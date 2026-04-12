import { TokenBalance, DEFAULT_STARTING_TOKENS } from "@sagepoint/domain";
import type { ITokenBalanceRepository } from "@sagepoint/domain";
import type { PrismaClient } from "../generated/prisma/client";

export class PrismaTokenBalanceRepository implements ITokenBalanceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByUserId(userId: string): Promise<TokenBalance | null> {
    const row = await this.prisma.userTokenBalance.findUnique({
      where: { userId },
    });
    if (!row) return null;
    return new TokenBalance(row.userId, row.balance);
  }

  async atomicDeduct(userId: string, cost: number): Promise<boolean> {
    // Check for unlimited first — null balance means no deduction needed
    const row = await this.prisma.userTokenBalance.findUnique({
      where: { userId },
      select: { balance: true },
    });

    if (!row) {
      // No record → create with defaults and deduct
      await this.prisma.userTokenBalance.create({
        data: { userId, balance: DEFAULT_STARTING_TOKENS - cost },
      });
      return DEFAULT_STARTING_TOKENS >= cost;
    }

    if (row.balance === null) return true; // unlimited

    // Atomic decrement: only succeeds if balance >= cost
    const result = await this.prisma.userTokenBalance.updateMany({
      where: { userId, balance: { gte: cost } },
      data: { balance: { decrement: cost } },
    });

    return result.count === 1;
  }

  async credit(userId: string, amount: number): Promise<void> {
    await this.prisma.userTokenBalance.upsert({
      where: { userId },
      create: { userId, balance: amount },
      update: { balance: { increment: amount } },
    });
  }

  async setBalance(userId: string, balance: number | null): Promise<void> {
    await this.prisma.userTokenBalance.upsert({
      where: { userId },
      create: { userId, balance },
      update: { balance },
    });
  }
}
