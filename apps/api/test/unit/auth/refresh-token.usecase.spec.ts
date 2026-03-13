import {
  RefreshTokenUseCase,
  InvalidRefreshTokenError,
} from '../../../src/features/auth/app/usecases/refresh-token.usecase';
import { LoginUseCase } from '../../../src/features/auth/app/usecases/login.usecase';
import { User } from '@sagepoint/domain';
import {
  FakeUserService,
  FakeTokenStore,
  FakeTokenService,
} from '../_fakes/repositories';

describe('RefreshTokenUseCase', () => {
  let userService: FakeUserService;
  let tokenStore: FakeTokenStore;
  let tokenService: FakeTokenService;
  let loginUseCase: LoginUseCase;
  let useCase: RefreshTokenUseCase;

  beforeEach(() => {
    userService = new FakeUserService();
    tokenStore = new FakeTokenStore();
    tokenService = new FakeTokenService();
    loginUseCase = new LoginUseCase(tokenStore, tokenService);
    useCase = new RefreshTokenUseCase(
      userService,
      tokenStore,
      tokenService,
      loginUseCase,
    );
  });

  describe('when the refresh token is valid', () => {
    it('issues new tokens via login', async () => {
      const user = User.create('u1', 'test@example.com', 'Test').verify();
      userService.seed(user);

      // Simulate a previous login to get a real refresh token
      const loginResult = await loginUseCase.execute(user);

      const result = await useCase.execute(loginResult.refreshToken);

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      // Tokens should be different from the original
      expect(result.accessToken).not.toBe(loginResult.accessToken);
    });
  });

  describe('error cases', () => {
    it('throws when refresh token format is invalid', async () => {
      await expect(useCase.execute('garbage-token')).rejects.toThrow(
        InvalidRefreshTokenError,
      );
    });

    it('throws when stored token does not match', async () => {
      const user = User.create('u1', 'test@example.com', 'Test').verify();
      userService.seed(user);
      // Store a different token
      await tokenStore.storeRefreshToken('u1', 'stored-different', 86400);

      await expect(useCase.execute('refresh-token-u1-999')).rejects.toThrow(
        InvalidRefreshTokenError,
      );
    });

    it('throws when user no longer exists', async () => {
      // Create a valid token format but no user in the service
      await tokenStore.storeRefreshToken(
        'ghost',
        'refresh-token-ghost-1',
        86400,
      );

      await expect(useCase.execute('refresh-token-ghost-1')).rejects.toThrow(
        InvalidRefreshTokenError,
      );
    });
  });
});
