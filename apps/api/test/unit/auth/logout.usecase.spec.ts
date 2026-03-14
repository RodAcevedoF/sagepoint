import { LogoutUseCase } from '../../../src/features/auth/app/usecases/logout.usecase';
import type { ITokenStore } from '@/features/auth/domain/outbound/token-store.port';
import { FakeTokenStore } from '../_fakes/repositories';

describe('LogoutUseCase', () => {
  let tokenStore: FakeTokenStore;
  let useCase: LogoutUseCase;

  beforeEach(() => {
    tokenStore = new FakeTokenStore();
    useCase = new LogoutUseCase(tokenStore as ITokenStore);
  });

  it('removes the refresh token for the user', async () => {
    await tokenStore.storeRefreshToken('u1', 'some-token', 86400);
    expect(tokenStore.hasRefreshToken('u1')).toBe(true);

    await useCase.execute('u1');

    expect(tokenStore.hasRefreshToken('u1')).toBe(false);
  });

  it('does not throw when user has no stored token', async () => {
    await expect(useCase.execute('no-token-user')).resolves.not.toThrow();
  });
});
