import { NotFoundException } from '@nestjs/common';
import type { ITokenBalanceRepository } from '@sagepoint/domain';
import { TokenBalance } from '@sagepoint/domain';
import type { IAdminRepository } from '../../domain/outbound/admin.repository.port';

export interface UpdateUserBalanceCommand {
  userId: string;
  /** Set an absolute balance value (or null for unlimited) */
  balance?: number | null;
  /** Add tokens to the existing balance */
  credit?: number;
}

export class UpdateUserLimitsUseCase {
  constructor(
    private readonly adminRepository: IAdminRepository,
    private readonly tokenBalanceRepository: ITokenBalanceRepository,
  ) {}

  async execute(command: UpdateUserBalanceCommand): Promise<TokenBalance> {
    const user = await this.adminRepository.findUserById(command.userId);
    if (!user) throw new NotFoundException('User not found');

    if (command.balance !== undefined) {
      await this.tokenBalanceRepository.setBalance(
        command.userId,
        command.balance,
      );
    } else if (command.credit !== undefined && command.credit > 0) {
      await this.tokenBalanceRepository.credit(command.userId, command.credit);
    }

    return (
      (await this.tokenBalanceRepository.findByUserId(command.userId)) ??
      TokenBalance.defaults(command.userId)
    );
  }
}
