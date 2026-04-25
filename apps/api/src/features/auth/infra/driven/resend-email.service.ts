import { Injectable, Inject, Logger } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Resend } from 'resend';
import type { IEmailService } from '@/features/auth/domain/outbound/email.service.port';
import { EmailRateLimitError, EmailSendError } from './email-errors';

export interface ResendConfig {
  apiKey: string;
  fromEmail: string;
  frontendUrl: string;
}

@Injectable()
export class ResendEmailService implements IEmailService {
  private readonly logger = new Logger(ResendEmailService.name);
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
    // PNG for broad email-client compatibility (Outlook et al. don't render webp).
    return `${this.config.frontendUrl}/logo.png`;
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const url = `${this.config.frontendUrl}/auth/verify?token=${token}`;
    const html = this.verificationHtml
      .replaceAll('{{verifyUrl}}', url)
      .replaceAll('{{logoUrl}}', this.logoUrl());

    await this.send({
      to: email,
      subject: 'Verify your email — Sagepoint',
      html,
      kind: 'verification',
    });
  }

  async sendInvitationEmail(email: string, token: string): Promise<void> {
    const url = `${this.config.frontendUrl}/register?invitation=${token}`;
    const html = this.invitationHtml
      .replaceAll('{{inviteUrl}}', url)
      .replaceAll('{{logoUrl}}', this.logoUrl());

    await this.send({
      to: email,
      subject: "You're invited to join Sagepoint",
      html,
      kind: 'invitation',
    });
  }

  private async send(params: {
    to: string;
    subject: string;
    html: string;
    kind: string;
  }): Promise<void> {
    let result: Awaited<ReturnType<typeof this.resend.emails.send>>;
    try {
      result = await this.resend.emails.send({
        from: this.config.fromEmail,
        to: params.to,
        subject: params.subject,
        html: params.html,
      });
    } catch (err: unknown) {
      throw this.mapError(err, params.kind);
    }

    if (result.error) {
      throw this.mapError(result.error, params.kind);
    }
  }

  private mapError(err: unknown, kind: string): Error {
    const status = this.statusOf(err);
    if (status === 429) {
      this.logger.warn(
        `Resend rate-limited ${kind} email; dropping silently from Sentry`,
      );
      return new EmailRateLimitError(`Rate-limited while sending ${kind}`);
    }
    const message =
      err instanceof Error
        ? err.message
        : typeof err === 'object' && err && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Unknown email send failure';
    return new EmailSendError(message, status);
  }

  private statusOf(err: unknown): number | undefined {
    if (!err || typeof err !== 'object') return undefined;
    const e = err as { statusCode?: number; status?: number };
    return e.statusCode ?? e.status;
  }
}
