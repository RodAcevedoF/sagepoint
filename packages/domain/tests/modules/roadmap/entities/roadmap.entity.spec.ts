import { Roadmap, RoadmapVisibility, Concept } from '../../../../src';
import type { RoadmapStep } from '../../../../src';

function buildStep(id: string, order: number): RoadmapStep {
	return {
		concept: Concept.create(id, `Concept ${id}`),
		order,
		dependsOn: [],
		learningObjective: `Learn ${id}`,
		difficulty: 'beginner',
	};
}

function buildRoadmap(overrides?: Partial<ConstructorParameters<typeof Roadmap>[0]>) {
	return new Roadmap({
		id: 'r1',
		title: 'Test Roadmap',
		steps: [buildStep('c2', 2), buildStep('c1', 1), buildStep('c3', 3)],
		createdAt: new Date('2026-01-01'),
		...overrides,
	});
}

describe('Roadmap', () => {
	describe('defaults', () => {
		it('defaults to pending, private, not featured', () => {
			const roadmap = buildRoadmap();

			expect(roadmap.generationStatus).toBe('pending');
			expect(roadmap.visibility).toBe(RoadmapVisibility.PRIVATE);
			expect(roadmap.isFeatured).toBe(false);
		});

		it('respects provided overrides', () => {
			const roadmap = buildRoadmap({
				generationStatus: 'completed',
				visibility: RoadmapVisibility.PUBLIC,
				isFeatured: true,
			});

			expect(roadmap.generationStatus).toBe('completed');
			expect(roadmap.visibility).toBe(RoadmapVisibility.PUBLIC);
			expect(roadmap.isFeatured).toBe(true);
		});
	});

	describe('getOrderedSteps', () => {
		it('returns steps sorted by order ascending', () => {
			const roadmap = buildRoadmap();
			const ordered = roadmap.getOrderedSteps();

			expect(ordered.map((s) => s.order)).toEqual([1, 2, 3]);
			expect(ordered.map((s) => s.concept.id)).toEqual(['c1', 'c2', 'c3']);
		});

		it('does not mutate original steps array', () => {
			const roadmap = buildRoadmap();
			const ordered = roadmap.getOrderedSteps();

			expect(roadmap.steps[0].order).toBe(2);
			expect(ordered[0].order).toBe(1);
		});
	});

	describe('getConceptById', () => {
		it('returns the concept when found', () => {
			const concept = buildRoadmap().getConceptById('c2');

			expect(concept).toBeDefined();
			expect(concept!.name).toBe('Concept c2');
		});

		it('returns undefined for non-existent concept', () => {
			expect(buildRoadmap().getConceptById('nonexistent')).toBeUndefined();
		});
	});
});
