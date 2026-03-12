import { RegisterUseCase, UserAlreadyExistsError } from '../../../src/features/auth/app/usecases/register.usecase';
import { User } from '@sagepoint/domain';
import {
  FakeUserService,
  FakeEmailService,
  FakeTokenStore,
  FakePasswordHasher,
} from '../_fakes/repositories';

describe('RegisterUseCase', () => {
  let userService: FakeUserService;
  let emailService: FakeEmailService;
  let tokenStore: FakeTokenStore;
  let passwordHasher: FakePasswordHasher;
  let useCase: RegisterUseCase;

  beforeEach(() => {
    userService = new FakeUserService();
    emailService = new FakeEmailService();
    tokenStore = new FakeTokenStore();
    passwordHasher = new FakePasswordHasher();
    // clear the env var to test the email path
    delete process.env.USE_MOCK_EMAIL;
    useCase = new RegisterUseCase(
      userService as any,
      emailService as any,
      tokenStore as any,
      passwordHasher as any,
    );
  });

  describe('when the email is new', () => {
    it('creates a user with a hashed password', async () => {
      await useCase.execute({
        email: 'new@example.com',
        name: 'New User',
        password: 'secret123',
      });

      const user = await userService.getByEmail('new@example.com');
      expect(user).not.toBeNull();
      expect(user!.passwordHash).toBe('hashed:secret123');
    });

    it('sends a verification email', async () => {
      await useCase.execute({
        email: 'new@example.com',
        name: 'New User',
        password: 'secret123',
      });

      expect(emailService.sentEmails).toHaveLength(1);
      expect(emailService.sentEmails[0].email).toBe('new@example.com');
    });

    it('stores a verification token', async () => {
      await useCase.execute({
        email: 'new@example.com',
        name: 'New User',
        password: 'secret123',
      });

      // The token is stored with the user's ID
      const user = await userService.getByEmail('new@example.com');
      const storedToken = emailService.sentEmails[0].token;
      const userId = await tokenStore.getVerificationToken(storedToken);
      expect(userId).toBe(user!.id);
    });

    it('returns a success message', async () => {
      const result = await useCase.execute({
        email: 'new@example.com',
        name: 'New User',
        password: 'secret123',
      });

      expect(result.message).toContain('Registration successful');
    });
  });

  describe('when USE_MOCK_EMAIL is true', () => {
    it('auto-verifies the user without sending email', async () => {
      process.env.USE_MOCK_EMAIL = 'true';
      useCase = new RegisterUseCase(
        userService as any,
        emailService as any,
        tokenStore as any,
        passwordHasher as any,
      );

      await useCase.execute({
        email: 'auto@example.com',
        name: 'Auto Verified',
        password: 'pass',
      });

      const user = await userService.getByEmail('auto@example.com');
      expect(user!.isVerified).toBe(true);
      expect(emailService.sentEmails).toHaveLength(0);
    });
  });

  describe('when the email already exists', () => {
    it('throws UserAlreadyExistsError', async () => {
      userService.seed(User.create('u1', 'existing@example.com', 'Existing'));

      await expect(
        useCase.execute({
          email: 'existing@example.com',
          name: 'Duplicate',
          password: 'pass',
        }),
      ).rejects.toThrow(UserAlreadyExistsError);
    });
  });
});
