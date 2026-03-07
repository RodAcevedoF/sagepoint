import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Job } from 'bullmq';
import { PrismaClient } from '@sagepoint/database';
import {
	RoadmapStep,
	Concept,
	Resource,
	TOPIC_CONCEPT_GENERATION_SERVICE,
	ROADMAP_GENERATION_SERVICE,
	CONCEPT_REPOSITORY,
} from '@sagepoint/domain';
import type {
	IConceptRepository,
	ITopicConceptGenerationService,
	IRoadmapGenerationService,
	IResourceDiscoveryService,
	ConceptForOrdering,
	ConceptRelationshipForOrdering,
	ConceptGraph,
	UserContext,
} from '@sagepoint/domain';
import { CachedResourceDiscoveryAdapter } from '../infra/cached-resource-discovery.adapter';
import { Inject } from '@nestjs/common';

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
		@Inject(TOPIC_CONCEPT_GENERATION_SERVICE)
		private readonly topicConceptGenerator: ITopicConceptGenerationService,
		@Inject(ROADMAP_GENERATION_SERVICE)
		private readonly roadmapGenerator: IRoadmapGenerationService,
		private readonly resourceDiscovery: CachedResourceDiscoveryAdapter,
		@Inject(CONCEPT_REPOSITORY)
		private readonly conceptRepository: IConceptRepository,
	) {
		super();
	}

	async process(job: Job<JobData>) {
		const { roadmapId, topic, userContext } = job.data;
		this.logger.info(
			{ jobId: job.id, roadmapId, topic, stage: 'concepts' },
			'Processing roadmap generation',
		);

		try {
			await this.markProcessing(roadmapId);
			const parsedContext = this.parseUserContext(userContext);

			const { concepts, relationships } = await this.generateConcepts(
				job, roadmapId, topic, parsedContext,
			);
			if (concepts.length === 0) {
				await this.completeEmpty(roadmapId);
				return;
			}

			await this.persistToNeo4j(roadmapId, concepts, relationships);

			const steps = await this.buildLearningPath(
				job, roadmapId, topic, concepts, relationships, parsedContext,
			);

			await this.discoverAndSaveResources(job, roadmapId, steps);
			await job.updateProgress({ stage: 'done' });
			this.logger.info({ jobId: job.id, roadmapId, stage: 'done' }, 'Roadmap resources discovered');
		} catch (error) {
			await this.handleFailure(job, roadmapId, error);
			throw error;
		}
	}

	private parseUserContext(
		raw?: { experienceLevel?: string },
	): UserContext | undefined {
		if (!raw) return undefined;
		return {
			experienceLevel: raw.experienceLevel as UserContext['experienceLevel'],
		};
	}

	private async markProcessing(roadmapId: string): Promise<void> {
		await this.prisma.roadmap.update({
			where: { id: roadmapId },
			data: { generationStatus: 'PROCESSING' },
		});
	}

	private async generateConcepts(
		job: Job<JobData>,
		roadmapId: string,
		topic: string,
		userContext?: UserContext,
	): Promise<{ concepts: ConceptForOrdering[]; relationships: ConceptRelationshipForOrdering[] }> {
		await job.updateProgress({ stage: 'concepts' });

		const ontologyContext = await this.fetchOntologyContext(roadmapId, topic);

		return this.topicConceptGenerator.generateConceptsFromTopic(
			topic,
			userContext,
			ontologyContext,
		);
	}

	private async fetchOntologyContext(roadmapId: string, topic: string): Promise<string | undefined> {
		const topicWords = topic.split(/\s+/).filter((w) => w.length > 2);
		try {
			const existingGraph = await this.conceptRepository.findRelatedConcepts(topicWords);
			if (existingGraph.nodes.length > 0) {
				this.logger.info(
					{ roadmapId, existingConcepts: existingGraph.nodes.length },
					'Found existing ontology context',
				);
				return existingGraph.nodes
					.map((c) => `${c.name}: ${c.description || ''}`)
					.join('\n');
			}
		} catch {
			this.logger.warn({ roadmapId }, 'Failed to query existing ontology, proceeding without');
		}
		return undefined;
	}

	private async completeEmpty(roadmapId: string): Promise<void> {
		await this.prisma.roadmap.update({
			where: { id: roadmapId },
			data: {
				generationStatus: 'COMPLETED',
				description: 'Could not generate concepts for this topic. Please try a more specific topic.',
			},
		});
	}

	private async persistToNeo4j(
		roadmapId: string,
		concepts: ConceptForOrdering[],
		relationships: ConceptRelationshipForOrdering[],
	): Promise<void> {
		const conceptEntities = concepts.map((c) =>
			Concept.create(c.id, c.name, undefined, c.description),
		);
		try {
			await this.conceptRepository.saveWithRelations(
				conceptEntities,
				relationships,
				roadmapId,
				'Roadmap',
			);
		} catch (error) {
			const err = error instanceof Error ? error : new Error(String(error));
			this.logger.warn({ roadmapId, err }, 'Failed to persist concepts to Neo4j');
		}
	}

	private async buildLearningPath(
		job: Job<JobData>,
		roadmapId: string,
		topic: string,
		concepts: ConceptForOrdering[],
		relationships: ConceptRelationshipForOrdering[],
		userContext?: UserContext,
	): Promise<RoadmapStep[]> {
		await job.updateProgress({ stage: 'learning-path' });

		const learningPath = await this.roadmapGenerator.generateLearningPath(
			concepts,
			relationships,
			userContext,
		);

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
				.filter((r) => r.toId === orderedConcept.conceptId && r.type === 'DEPENDS_ON')
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

		const stepDurationSum = steps.reduce((sum, s) => sum + (s.estimatedDuration ?? 0), 0);
		const categoryId = await this.matchCategory(topic, concepts.map((c) => c.name));

		await this.prisma.roadmap.update({
			where: { id: roadmapId },
			data: {
				generationStatus: 'COMPLETED',
				description: learningPath.description,
				steps: serializedSteps,
				totalDuration: stepDurationSum > 0 ? stepDurationSum : null,
				recommendedPace: learningPath.recommendedPace,
				...(categoryId ? { categoryId } : {}),
			},
		});

		this.logger.info(
			{ jobId: job.id, roadmapId, stepCount: steps.length, stage: 'completed' },
			'Roadmap generation complete',
		);

		return steps;
	}

	private async handleFailure(job: Job<JobData>, roadmapId: string, error: unknown): Promise<void> {
		const err = error instanceof Error ? error : new Error(String(error));
		this.logger.error({ jobId: job.id, roadmapId, err }, 'Roadmap generation failed');
		await this.prisma.roadmap.update({
			where: { id: roadmapId },
			data: {
				generationStatus: 'FAILED',
				errorMessage: error instanceof Error ? error.message : 'Unknown error',
			},
		});
	}

	private async matchCategory(
		topic: string,
		conceptNames: string[],
	): Promise<string | null> {
		try {
			const categories = await this.prisma.category.findMany({
				select: { id: true, name: true, slug: true, description: true },
			});

			const searchText = [topic, ...conceptNames].join(' ').toLowerCase();
			let bestMatch: { id: string; score: number } | null = null;

			for (const cat of categories) {
				const keywords = [
					cat.name.toLowerCase(),
					cat.slug.replace(/-/g, ' '),
					...(cat.description?.toLowerCase().split(/[,\s]+/) ?? []),
				].filter((k) => k.length > 2);

				const score = keywords.reduce(
					(sum, kw) => sum + (searchText.includes(kw) ? 1 : 0),
					0,
				);

				if (score > 0 && (!bestMatch || score > bestMatch.score)) {
					bestMatch = { id: cat.id, score };
				}
			}

			if (bestMatch) {
				this.logger.info(
					{ categoryId: bestMatch.id, score: bestMatch.score },
					'Auto-assigned category',
				);
			}
			return bestMatch?.id ?? null;
		} catch {
			return null;
		}
	}

	private async discoverAndSaveResources(
		job: Job<JobData>,
		roadmapId: string,
		steps: RoadmapStep[],
	): Promise<void> {
		await job.updateProgress({ stage: 'resources' });

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
			const err = error instanceof Error ? error : new Error(String(error));
			this.logger.warn({ roadmapId, err }, 'Resource discovery failed for roadmap');
		}
	}
}
