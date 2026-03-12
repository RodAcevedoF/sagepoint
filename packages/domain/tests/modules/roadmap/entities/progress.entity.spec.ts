import { UserRoadmapProgress, StepStatus } from '../../../../src';

function buildProgress(status = StepStatus.NOT_STARTED) {
	return UserRoadmapProgress.create('u1', 'r1', 'c1', status);
}

describe('UserRoadmapProgress', () => {
	describe('create', () => {
		it('creates progress with NOT_STARTED and no completedAt', () => {
			const progress = buildProgress();

			expect(progress.userId).toBe('u1');
			expect(progress.roadmapId).toBe('r1');
			expect(progress.conceptId).toBe('c1');
			expect(progress.status).toBe(StepStatus.NOT_STARTED);
			expect(progress.completedAt).toBeUndefined();
		});

		it('sets completedAt when created with COMPLETED status', () => {
			const progress = buildProgress(StepStatus.COMPLETED);

			expect(progress.status).toBe(StepStatus.COMPLETED);
			expect(progress.completedAt).toBeInstanceOf(Date);
		});
	});

	describe('withStatus', () => {
		const statusTransitions: Array<{
			from: StepStatus;
			to: StepStatus;
			hasCompletedAt: boolean;
		}> = [
			{ from: StepStatus.NOT_STARTED, to: StepStatus.IN_PROGRESS, hasCompletedAt: false },
			{ from: StepStatus.IN_PROGRESS, to: StepStatus.COMPLETED, hasCompletedAt: true },
			{ from: StepStatus.NOT_STARTED, to: StepStatus.SKIPPED, hasCompletedAt: false },
			{ from: StepStatus.IN_PROGRESS, to: StepStatus.NOT_STARTED, hasCompletedAt: false },
		];

		for (const { from, to, hasCompletedAt } of statusTransitions) {
			it(`${from} → ${to} ${hasCompletedAt ? 'sets' : 'does not set'} completedAt`, () => {
				const progress = buildProgress(from).withStatus(to);

				expect(progress.status).toBe(to);
				if (hasCompletedAt) {
					expect(progress.completedAt).toBeInstanceOf(Date);
				} else {
					expect(progress.completedAt).toBeUndefined();
				}
			});
		}

		it('returns a new instance', () => {
			const original = buildProgress();
			const updated = original.withStatus(StepStatus.COMPLETED);

			expect(updated).not.toBe(original);
		});
	});

	describe('isCompleted', () => {
		it('returns true for COMPLETED status', () => {
			expect(buildProgress(StepStatus.COMPLETED).isCompleted()).toBe(true);
		});

		it('returns false for non-COMPLETED statuses', () => {
			const statuses = [StepStatus.NOT_STARTED, StepStatus.IN_PROGRESS, StepStatus.SKIPPED];
			for (const status of statuses) {
				expect(buildProgress(status).isCompleted()).toBe(false);
			}
		});
	});
});
