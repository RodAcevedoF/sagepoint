export class EmailRateLimitError extends Error {
  constructor(message = 'Email provider rate-limited the request') {
    super(message);
    this.name = 'EmailRateLimitError';
  }
}

export class EmailSendError extends Error {
  constructor(
    message: string,
    readonly statusCode?: number,
  ) {
    super(message);
    this.name = 'EmailSendError';
  }
}
