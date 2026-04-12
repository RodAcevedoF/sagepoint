import { TokenBalance } from '@sagepoint/domain';
import type { ITokenBalanceRepository } from '@sagepoint/domain';

export class GetUserLimitsUseCase {
  constructor(
    private readonly tokenBalanceRepository: ITokenBalanceRepository,
  ) {}

  async execute(userId: string): Promise<TokenBalance> {
    return (
      (await this.tokenBalanceRepository.findByUserId(userId)) ??
      TokenBalance.defaults(userId)
    );
  }
}
