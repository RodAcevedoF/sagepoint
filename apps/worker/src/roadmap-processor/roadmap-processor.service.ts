import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Job } from 'bullmq';
import { PrismaClient } from '@sagepoint/database';
import { RoadmapStep, Concept, Resource } from '@sagepoint/domain';
import {
	OpenAiTopicConceptGeneratorAdapter,
	OpenAiRoadmapGeneratorAdapter,
	PerplexityResearchAdapter,
} from '@sagepoint/ai';

interface JobData {
	roadmapId: string;
	topic: string;
	title: string;
	userId: string;
	userContext?: { experienceLevel?: string };
}

@Processor('roadmap-generation')
export class RoadmapProcessorService extends WorkerHost {
	private readonly prisma = new PrismaClient();

	constructor(
		@InjectPinoLogger(RoadmapProcessorService.name)
		private readonly logger: PinoLogger,
		private readonly topicConceptGenerator: OpenAiTopicConceptGeneratorAdapter,
		private readonly roadmapGenerator: OpenAiRoadmapGeneratorAdapter,
		private readonly resourceDiscovery: PerplexityResearchAdapter,
	) {
		super();
	}

	async process(job: Job<JobData>) {
		const { roadmapId, topic, userContext } = job.data;
		this.logger.info({ jobId: job.id, roadmapId, topic, stage: 'concepts' }, 'Processing roadmap generation');

		try {
			// 1. Mark as PROCESSING
			await this.prisma.roadmap.update({
				where: { id: roadmapId },
				data: { generationStatus: 'PROCESSING' },
			});
			await job.updateProgress({ stage: 'concepts' });

			// 2. Generate concepts from topic
			const { concepts, relationships } =
				await this.topicConceptGenerator.generateConceptsFromTopic(
					topic,
					userContext ?
						{
							experienceLevel: userContext.experienceLevel as
								| 'beginner'
								| 'intermediate'
								| 'advanced'
								| 'expert'
								| undefined,
						}
					:	undefined,
				);

			if (concepts.length === 0) {
				await this.prisma.roadmap.update({
					where: { id: roadmapId },
					data: {
						generationStatus: 'COMPLETED',
						description:
							'Could not generate concepts for this topic. Please try a more specific topic.',
					},
				});
				return;
			}

			await job.updateProgress({ stage: 'learning-path' });

			// 3. Generate learning path
			const learningPath = await this.roadmapGenerator.generateLearningPath(
				concepts,
				relationships,
				userContext ?
					{
						experienceLevel: userContext.experienceLevel as
							| 'beginner'
							| 'intermediate'
							| 'advanced'
							| 'expert'
							| undefined,
					}
				:	undefined,
			);

			// 4. Build steps
			const conceptMap = new Map(concepts.map((c) => [c.id, c]));
			const steps: RoadmapStep[] = [];

			for (const orderedConcept of learningPath.orderedConcepts) {
				const conceptData = conceptMap.get(orderedConcept.conceptId);
				if (!conceptData) continue;

				const concept = new Concept(
					conceptData.id,
					conceptData.name,
					undefined,
					conceptData.description,
				);

				const dependsOn = relationships
					.filter(
						(r) =>
							r.toId === orderedConcept.conceptId && r.type === 'DEPENDS_ON',
					)
					.map((r) => r.fromId);

				steps.push({
					concept,
					order: orderedConcept.order,
					dependsOn,
					learningObjective: orderedConcept.learningObjective,
					estimatedDuration: orderedConcept.estimatedDuration,
					difficulty: orderedConcept.difficulty,
					rationale: orderedConcept.rationale,
				});
			}

			// 5. Save completed roadmap (usable immediately, resources come after)
			const serializedSteps = steps.map((step) => ({
				concept: {
					id: step.concept.id,
					name: step.concept.name,
					documentId: step.concept.documentId,
					description: step.concept.description,
				},
				order: step.order,
				dependsOn: step.dependsOn,
				learningObjective: step.learningObjective,
				estimatedDuration: step.estimatedDuration,
				difficulty: step.difficulty,
				rationale: step.rationale,
			}));

			// Compute total duration from individual step durations (more reliable than AI aggregate)
			const stepDurationSum = steps.reduce((sum, s) => sum + (s.estimatedDuration ?? 0), 0);
			const totalDuration = stepDurationSum > 0 ? stepDurationSum : null;

			await this.prisma.roadmap.update({
				where: { id: roadmapId },
				data: {
					generationStatus: 'COMPLETED',
					description: learningPath.description,
					steps: serializedSteps,
					totalDuration,
					recommendedPace: learningPath.recommendedPace,
				},
			});

			this.logger.info(
				{ jobId: job.id, roadmapId, stepCount: steps.length, stage: 'completed' },
				'Roadmap generation complete',
			);

			// 6. Discover resources (after marking completed so roadmap is usable)
			await job.updateProgress({ stage: 'resources' });
			await this.discoverAndSaveResources(roadmapId, steps);

			await job.updateProgress({ stage: 'done' });
			this.logger.info({ jobId: job.id, roadmapId, stage: 'done' }, 'Roadmap resources discovered');
		} catch (error) {
			const err = error instanceof Error ? error : new Error(String(error));
			this.logger.error({ jobId: job.id, roadmapId, err }, 'Roadmap generation failed');
			const errorMsg = error instanceof Error ? error.message : 'Unknown error';
			await this.prisma.roadmap.update({
				where: { id: roadmapId },
				data: {
					generationStatus: 'FAILED',
					errorMessage: errorMsg,
				},
			});
			throw error;
		}
	}

	private async discoverAndSaveResources(
		roadmapId: string,
		steps: RoadmapStep[],
	): Promise<void> {
		try {
			const resourcePromises = steps.map(async (step) => {
				const discovered =
					await this.resourceDiscovery.discoverResourcesForConcept(
						step.concept.name,
						step.concept.description,
						{ maxResults: 3, difficulty: step.difficulty },
					);

				return discovered.map((d, idx) =>
					Resource.create({
						title: d.title,
						url: d.url,
						type: d.type,
						description: d.description,
						provider: d.provider,
						estimatedDuration: d.estimatedDuration,
						difficulty: d.difficulty,
						conceptId: step.concept.id,
						roadmapId,
						order: idx,
					}),
				);
			});

			const resourceArrays = await Promise.all(resourcePromises);
			const allResources = resourceArrays.flat();

			if (allResources.length > 0) {
				await this.prisma.resource.createMany({
					data: allResources.map((r) => ({
						id: r.id,
						title: r.title,
						url: r.url,
						type: r.type,
						description: r.description,
						provider: r.provider,
						estimatedDuration: r.estimatedDuration,
						difficulty: r.difficulty,
						conceptId: r.conceptId,
						roadmapId: r.roadmapId,
						order: r.order,
					})),
				});
			}

			this.logger.info(
				{ roadmapId, resourceCount: allResources.length },
				'Saved resources for roadmap',
			);
		} catch (error) {
			// Don't fail the job for resource discovery errors
			const err = error instanceof Error ? error : new Error(String(error));
			this.logger.warn(
				{ roadmapId, err },
				'Resource discovery failed for roadmap',
			);
		}
	}
}
