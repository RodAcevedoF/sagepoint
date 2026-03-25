import { Injectable, Inject } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Resend } from 'resend';
import type { IEmailService } from '@/features/auth/domain/outbound/email.service.port';

export interface ResendConfig {
  apiKey: string;
  fromEmail: string;
  frontendUrl: string;
}

@Injectable()
export class ResendEmailService implements IEmailService {
  private readonly resend: Resend;
  private readonly verificationHtml: string;
  private readonly invitationHtml: string;

  constructor(@Inject('RESEND_CONFIG') private readonly config: ResendConfig) {
    this.resend = new Resend(config.apiKey);
    const templatesDir = join(__dirname, 'templates');
    this.verificationHtml = readFileSync(
      join(templatesDir, 'verification.html'),
      'utf-8',
    );
    this.invitationHtml = readFileSync(
      join(templatesDir, 'invitation.html'),
      'utf-8',
    );
  }

  private logoUrl(): string {
    return `${this.config.frontendUrl}/logo.webp`;
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const url = `${this.config.frontendUrl}/auth/verify?token=${token}`;
    const html = this.verificationHtml
      .replaceAll('{{verifyUrl}}', url)
      .replaceAll('{{logoUrl}}', this.logoUrl());

    await this.resend.emails.send({
      from: this.config.fromEmail,
      to: email,
      subject: 'Verify your email — Sagepoint',
      html,
    });
  }

  async sendInvitationEmail(email: string, token: string): Promise<void> {
    const url = `${this.config.frontendUrl}/register?invitation=${token}`;
    const html = this.invitationHtml
      .replaceAll('{{inviteUrl}}', url)
      .replaceAll('{{logoUrl}}', this.logoUrl());

    await this.resend.emails.send({
      from: this.config.fromEmail,
      to: email,
      subject: "You're invited to join Sagepoint",
      html,
    });
  }
}
