import { TokenBalance, OPERATION_COSTS } from '@sagepoint/domain';
import type { ITokenBalanceRepository } from '@sagepoint/domain';

export interface TokenQuota {
  balance: number | null;
  costs: typeof OPERATION_COSTS;
}

export class GetResourceQuotaUseCase {
  constructor(
    private readonly tokenBalanceRepository: ITokenBalanceRepository,
  ) {}

  async execute(userId: string): Promise<TokenQuota> {
    const balance =
      (await this.tokenBalanceRepository.findByUserId(userId)) ??
      TokenBalance.defaults(userId);

    return {
      balance: balance.balance,
      costs: OPERATION_COSTS,
    };
  }
}
