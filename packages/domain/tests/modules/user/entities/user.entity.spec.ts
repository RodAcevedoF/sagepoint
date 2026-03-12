import { User, UserRole, OnboardingStatus, Category } from '../../../../src';

function buildUser(overrides?: Partial<ConstructorParameters<typeof User>>) {
	return User.create('u1', 'test@example.com', 'Test User', UserRole.USER, 'hashed-pw');
}

const mockCategories: Category[] = [
	new Category('c1', 'Web Development', 'web-development'),
	new Category('c2', 'Data Science', 'data-science'),
];

describe('User', () => {
	describe('create', () => {
		it('creates an unverified user with PENDING onboarding', () => {
			const user = buildUser();

			expect(user.id).toBe('u1');
			expect(user.email).toBe('test@example.com');
			expect(user.name).toBe('Test User');
			expect(user.role).toBe(UserRole.USER);
			expect(user.isVerified).toBe(false);
			expect(user.isActive).toBe(true);
			expect(user.onboardingStatus).toBe(OnboardingStatus.PENDING);
			expect(user.interests).toEqual([]);
			expect(user.learningGoal).toBeNull();
			expect(user.verificationToken).toBeNull();
		});

		it('defaults role to USER', () => {
			const user = User.create('u2', 'a@b.com', 'A');
			expect(user.role).toBe(UserRole.USER);
		});
	});

	describe('immutability', () => {
		it('returns a new instance on every mutation', () => {
			const original = buildUser();
			const updated = original.updateAvatar('https://img.com/pic.jpg');

			expect(updated).not.toBe(original);
			expect(updated.avatarUrl).toBe('https://img.com/pic.jpg');
			expect(original.avatarUrl).toBeUndefined();
		});
	});

	describe('verification', () => {
		it('marks user as verified and clears token', () => {
			const user = buildUser()
				.withVerificationToken('tok-123')
				.verify();

			expect(user.isVerified).toBe(true);
			expect(user.verificationToken).toBeNull();
		});

		it('sets verification token without changing other fields', () => {
			const user = buildUser().withVerificationToken('tok-456');

			expect(user.verificationToken).toBe('tok-456');
			expect(user.isVerified).toBe(false);
		});
	});

	describe('onboarding', () => {
		it('completes onboarding with goal and interests', () => {
			const user = buildUser().completeOnboarding('Learn AI', mockCategories);

			expect(user.onboardingStatus).toBe(OnboardingStatus.COMPLETED);
			expect(user.learningGoal).toBe('Learn AI');
			expect(user.interests).toHaveLength(2);
			expect(user.interests[0].slug).toBe('web-development');
		});

		it('skips onboarding without changing interests', () => {
			const user = buildUser().skipOnboarding();

			expect(user.onboardingStatus).toBe(OnboardingStatus.SKIPPED);
			expect(user.interests).toEqual([]);
		});

		it('resets onboarding clearing goal and interests', () => {
			const user = buildUser()
				.completeOnboarding('Learn AI', mockCategories)
				.resetOnboarding();

			expect(user.onboardingStatus).toBe(OnboardingStatus.PENDING);
			expect(user.learningGoal).toBeNull();
			expect(user.interests).toEqual([]);
		});
	});

	describe('profile updates', () => {
		it('updateProfile sets goal and marks onboarding completed', () => {
			const user = buildUser().updateProfile('Build apps', mockCategories);

			expect(user.learningGoal).toBe('Build apps');
			expect(user.onboardingStatus).toBe(OnboardingStatus.COMPLETED);
			expect(user.interests).toEqual(mockCategories);
		});

		it('withPartialUpdate only changes provided fields', () => {
			const user = buildUser().withPartialUpdate({ name: 'New Name' });

			expect(user.name).toBe('New Name');
			expect(user.email).toBe('test@example.com');
			expect(user.learningGoal).toBeNull();
		});

		it('updateAvatar preserves all other fields', () => {
			const user = buildUser()
				.completeOnboarding('Goal', mockCategories)
				.updateAvatar('https://new.img');

			expect(user.avatarUrl).toBe('https://new.img');
			expect(user.learningGoal).toBe('Goal');
			expect(user.interests).toEqual(mockCategories);
		});
	});
});
