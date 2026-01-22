import { Injectable, Inject } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { IEmailService } from '@/features/auth/domain/outbound/email.service.port';

export interface EmailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  frontendUrl: string;
}

@Injectable()
export class NodemailerEmailService implements IEmailService {
  private transporter: nodemailer.Transporter;

  constructor(@Inject('EMAIL_CONFIG') private readonly config: EmailConfig) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const url = `${this.config.frontendUrl}/auth/verify?token=${token}`;

    await this.transporter.sendMail({
      from: '"Sagepoint" <noreply@sagepoint.com>',
      to: email,
      subject: 'Verify your email',
      html: `
        <h1>Welcome to Sagepoint!</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${url}">Verify Email</a>
      `,
    });
  }
}
