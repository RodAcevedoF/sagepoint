import { ValidateGoogleUserUseCase } from '../../../src/features/auth/app/usecases/validate-google-user.usecase';
import { User } from '@sagepoint/domain';
import { FakeUserService } from '../_fakes/repositories';

describe('ValidateGoogleUserUseCase', () => {
  let userService: FakeUserService;
  let useCase: ValidateGoogleUserUseCase;

  beforeEach(() => {
    userService = new FakeUserService();
    useCase = new ValidateGoogleUserUseCase(userService as any);
  });

  describe('when the Google user already exists', () => {
    it('returns the existing user without creating a new one', async () => {
      const existing = User.create('u1', 'google@example.com', 'Existing');
      userService.seed(existing);

      const result = await useCase.execute({
        email: 'google@example.com',
        firstName: 'New',
        lastName: 'Name',
      });

      expect(result.id).toBe('u1');
      expect(result.name).toBe('Existing'); // keeps original name
    });
  });

  describe('when the Google user is new', () => {
    it('creates and auto-verifies a new user', async () => {
      const result = await useCase.execute({
        email: 'new-google@example.com',
        firstName: 'John',
        lastName: 'Doe',
        picture: 'https://example.com/photo.jpg',
      });

      expect(result.email).toBe('new-google@example.com');
      expect(result.name).toBe('John Doe');
      expect(result.isVerified).toBe(true);
    });
  });
});
