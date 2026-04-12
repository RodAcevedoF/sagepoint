import type { TokenBalance } from "../entities/token-balance.entity";

export const TOKEN_BALANCE_REPOSITORY = Symbol("TOKEN_BALANCE_REPOSITORY");

export interface ITokenBalanceRepository {
  findByUserId(userId: string): Promise<TokenBalance | null>;
  /** Atomically deducts `cost` tokens. Returns false if balance is insufficient. */
  atomicDeduct(userId: string, cost: number): Promise<boolean>;
  /** Adds tokens to a user's balance. Creates the record if it doesn't exist. */
  credit(userId: string, amount: number): Promise<void>;
  /** Sets absolute balance. Pass null for unlimited. Creates record if needed. */
  setBalance(userId: string, balance: number | null): Promise<void>;
}
