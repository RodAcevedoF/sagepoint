import { InsufficientTokensError } from "../errors/insufficient-tokens.error";

export const DEFAULT_STARTING_TOKENS = 100;

export class TokenBalance {
  constructor(
    public readonly userId: string,
    public readonly balance: number | null, // null = unlimited
  ) {}

  static defaults(userId: string): TokenBalance {
    return new TokenBalance(userId, DEFAULT_STARTING_TOKENS);
  }

  canAfford(cost: number): boolean {
    return this.balance === null || this.balance >= cost;
  }

  deduct(cost: number): TokenBalance {
    if (this.balance === null) return this;
    if (this.balance < cost) {
      throw new InsufficientTokensError(cost, this.balance);
    }
    return new TokenBalance(this.userId, this.balance - cost);
  }
}
