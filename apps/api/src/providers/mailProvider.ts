import nodemailer from 'nodemailer';

export interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export class MailProvider {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured = false;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM;

    if (host && user && pass && from) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      this.isConfigured = true;
    } else {
      console.warn('SMTP configuration is missing. MailProvider will run in MOCK mode.');
    }
  }

  async sendMail(options: MailOptions): Promise<{ sent: boolean; isMock: boolean; info?: any }> {
    const from = process.env.SMTP_FROM || 'no-reply@ecotransit.vn';
    
    if (this.isConfigured && this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from,
          to: options.to,
          subject: options.subject,
          text: options.text,
          html: options.html,
        });
        return { sent: true, isMock: false, info };
      } catch (error) {
        console.error('Failed to send email via SMTP:', error);
        throw error;
      }
    } else {
      // Mock mode
      console.log('--------------------------------------------------');
      console.log(`[MOCK EMAIL SENT]`);
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Text: ${options.text}`);
      console.log('--------------------------------------------------');

      // Write to a temporary file in the workspace root for Playwright tests
      try {
        const fs = await import('fs');
        const path = await import('path');
        const filepath = path.join(process.cwd(), 'last-mock-email.json');
        fs.writeFileSync(filepath, JSON.stringify({
          to: options.to,
          subject: options.subject,
          text: options.text,
          html: options.html,
          timestamp: Date.now()
        }, null, 2));
      } catch (err) {
        console.error('Failed to write mock email file:', err);
      }

      return { sent: true, isMock: true };
    }
  }

  hasSmtpConfig(): boolean {
    return this.isConfigured;
  }
}

export const mailProvider = new MailProvider();
export default mailProvider;
