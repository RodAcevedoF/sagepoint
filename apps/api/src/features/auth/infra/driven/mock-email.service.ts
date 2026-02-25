import { Injectable, Logger } from '@nestjs/common';
import type { IEmailService } from '@/features/auth/domain/outbound/email.service.port';

@Injectable()
export class MockEmailService implements IEmailService {
  private readonly logger = new Logger(MockEmailService.name);
  private readonly logs: string[] = [];

  sendVerificationEmail(email: string, token: string): Promise<void> {
    const url = `http://localhost:3000/auth/verify?token=${token}`;
    const logMessage = `To: ${email}, Link: ${url}`;
    this.logs.push(logMessage);
    this.logger.log(logMessage);
    return Promise.resolve();
  }

  getLogs(): string[] {
    return [...this.logs];
  }
}
