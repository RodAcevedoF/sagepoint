import { LoginUseCase } from '../../../src/features/auth/app/usecases/login.usecase';
import { User } from '@sagepoint/domain';
import { FakeTokenStore, FakeTokenService } from '../_fakes/repositories';

const VERIFIED_USER = User.create('u1', 'test@example.com', 'Test').verify();

describe('LoginUseCase', () => {
  let tokenStore: FakeTokenStore;
  let tokenService: FakeTokenService;
  let useCase: LoginUseCase;

  beforeEach(() => {
    tokenStore = new FakeTokenStore();
    tokenService = new FakeTokenService();
    useCase = new LoginUseCase(tokenStore as any, tokenService as any);
  });

  describe('when a valid user logs in', () => {
    it('returns access and refresh tokens', async () => {
      const result = await useCase.execute(VERIFIED_USER);

      expect(result.accessToken).toContain('access-token-u1');
      expect(result.refreshToken).toContain('refresh-token-u1');
      expect(result.user).toBe(VERIFIED_USER);
    });

    it('stores the refresh token for the user', async () => {
      await useCase.execute(VERIFIED_USER);

      expect(tokenStore.hasRefreshToken('u1')).toBe(true);
    });

    it('generates different tokens on each call', async () => {
      const first = await useCase.execute(VERIFIED_USER);
      const second = await useCase.execute(VERIFIED_USER);

      expect(first.accessToken).not.toBe(second.accessToken);
      expect(first.refreshToken).not.toBe(second.refreshToken);
    });
  });
});
