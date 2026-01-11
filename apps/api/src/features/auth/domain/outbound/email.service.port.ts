export const EMAIL_SERVICE_PORT = Symbol('EMAIL_SERVICE_PORT');

export interface IEmailService {
  sendVerificationEmail(email: string, token: string): Promise<void>;
}
