export class InsufficientTokensError extends Error {
  constructor(
    public readonly required: number,
    public readonly available: number,
  ) {
    super(
      `Insufficient tokens: ${required} required, ${available} available. Contact your administrator to get more tokens.`,
    );
    this.name = "InsufficientTokensError";
  }
}
