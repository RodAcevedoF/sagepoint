import type { IEmailService } from '@/features/auth/domain/outbound/email.service.port';

export class MockEmailService implements IEmailService {
  private readonly logs: string[] = [];

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const url = `http://localhost:3000/auth/verify?token=${token}`;
    const logMessage = `[MOCK EMAIL] To: ${email}, Link: ${url}`;
    this.logs.push(logMessage);
    console.log(logMessage);
  }

  getLogs(): string[] {
    return [...this.logs];
  }
}
