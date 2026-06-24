import nodemailer from 'nodemailer';

export interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

function classifySingleError(error: any): string | null {
  if (!error) return null;

  const code = error.code ? String(error.code).toUpperCase() : '';
  const message = error.message ? String(error.message) : '';
  const messageUpper = message.toUpperCase();

  // Existing normalized app errors must not be classified as genuine SMTP transport causes
  if (message === 'EMAIL_DELIVERY_UNAVAILABLE' || message === 'SMTP_NOT_CONFIGURED') {
    return null;
  }

  if (code === 'EAUTH' || messageUpper.includes('AUTH') || messageUpper.includes('PASSWORD') || messageUpper.includes('USERNAME') || messageUpper.includes('ACCEPTED')) {
    return 'AUTH_REJECTED';
  }

  if (code === 'ETIMEDOUT' || messageUpper.includes('TIMEOUT') || messageUpper.includes('TIMEDOUT')) {
    return 'CONNECTION_TIMEOUT';
  }

  if (code === 'ECONNREFUSED' || messageUpper.includes('CONNREFUSED') || messageUpper.includes('CONNECTION REFUSED')) {
    return 'CONNECTION_REFUSED';
  }

  if (code === 'EPROTO' || messageUpper.includes('TLS') || messageUpper.includes('SSL') || messageUpper.includes('HANDSHAKE')) {
    return 'TLS_FAILURE';
  }

  if (messageUpper.includes('SENDER') && (messageUpper.includes('REJECT') || messageUpper.includes('DENY') || messageUpper.includes('DENIED'))) {
    return 'SENDER_REJECTED';
  }

  if (messageUpper.includes('RECIPIENT') && (messageUpper.includes('REJECT') || messageUpper.includes('DENY') || messageUpper.includes('DENIED'))) {
    return 'RECIPIENT_REJECTED';
  }

  if (code === 'EENVELOPE' || messageUpper.includes('SMTP RESPONSE') || messageUpper.includes('REJECT')) {
    return 'SMTP_RESPONSE_REJECTED';
  }

  // A generic SMTP 4xx/5xx response without unambiguous sender/recipient evidence must be SMTP_RESPONSE_REJECTED
  if (error.responseCode) {
    const rCode = parseInt(error.responseCode, 10);
    if (rCode >= 400 && rCode < 600) {
      if (rCode === 535) return 'AUTH_REJECTED';
      // Do not classify sender or recipient rejection merely from a generic responseCode such as 550 or 554.
      return 'SMTP_RESPONSE_REJECTED';
    }
  }

  return null;
}

function getNestedErrors(error: any): any[] {
  const seen = new Set<any>();
  const list: any[] = [];

  function traverse(err: any, depth: number) {
    if (!err || depth > 5 || seen.has(err)) return;
    seen.add(err);
    if (err !== error) {
      list.push(err);
    }

    if (err.cause) {
      traverse(err.cause, depth + 1);
    }
    if (Array.isArray(err.errors)) {
      for (const nested of err.errors) {
        traverse(nested, depth + 1);
      }
    }
  }

  traverse(error, 0);
  return list;
}

function classifyMailError(error: any): { category: string; hint?: string } {
  if (!error) {
    return { category: 'UNKNOWN_TRANSPORT_FAILURE', hint: 'DIRECT_ERROR_NO_METADATA' };
  }

  // Helper to check if an error is already normalized
  if (error instanceof Error && (error.message === 'EMAIL_DELIVERY_UNAVAILABLE' || error.message === 'SMTP_NOT_CONFIGURED')) {
    return { category: 'UNKNOWN_TRANSPORT_FAILURE', hint: 'ALREADY_NORMALIZED_ERROR' };
  }

  // 1. Direct classification
  const directCategory = classifySingleError(error);
  if (directCategory) {
    return { category: directCategory };
  }

  // 2. Check nested causes
  const nestedErrors = getNestedErrors(error);
  let nestedCategory: string | null = null;
  for (const nested of nestedErrors) {
    const cat = classifySingleError(nested);
    if (cat) {
      nestedCategory = cat;
      break;
    }
  }

  if (nestedCategory) {
    // Nested cause matched a category! We promote timeout/refused/tls/auth, or return hint NESTED_CAUSE_CLASSIFIED
    if (nestedCategory === 'CONNECTION_TIMEOUT' || nestedCategory === 'CONNECTION_REFUSED' || nestedCategory === 'TLS_FAILURE' || nestedCategory === 'AUTH_REJECTED') {
      return { category: nestedCategory };
    }
    return { category: 'UNKNOWN_TRANSPORT_FAILURE', hint: 'NESTED_CAUSE_CLASSIFIED' };
  }

  // 3. Unclassified error hints
  if (nestedErrors.length > 0) {
    return { category: 'UNKNOWN_TRANSPORT_FAILURE', hint: 'NESTED_CAUSE_UNCLASSIFIED' };
  }

  if (error.responseCode || error.response) {
    return { category: 'UNKNOWN_TRANSPORT_FAILURE', hint: 'DIRECT_ERROR_UNCLASSIFIED_RESPONSE' };
  }

  if (error.code) {
    return { category: 'UNKNOWN_TRANSPORT_FAILURE', hint: 'DIRECT_ERROR_UNRECOGNIZED_CODE' };
  }

  return { category: 'UNKNOWN_TRANSPORT_FAILURE', hint: 'DIRECT_ERROR_NO_METADATA' };
}

export class MailProvider {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured = false;

  constructor() {
    const host = process.env.SMTP_HOST;
    const portStr = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM;

    if (host && portStr && user && pass && from) {
      const port = parseInt(portStr, 10);
      if (isNaN(port) || port <= 0) {
        this.isConfigured = false;
        const isProductionOrDemo =
          process.env.NODE_ENV === 'production' ||
          process.env.APP_MODE === 'production' ||
          process.env.APP_MODE === 'demo';
        if (isProductionOrDemo) {
          console.error('[MAIL_TRANSPORT_FAILURE] phase=init category=CONFIGURATION_INVALID');
          console.warn('SMTP configuration is invalid. SMTP operations will fail with SMTP_NOT_CONFIGURED in production mode.');
        } else {
          console.warn('SMTP configuration is invalid. MailProvider will run in MOCK mode.');
        }
      } else {
        // Bounded but tolerant timeouts configured to prevent indefinite Express blocks
        // while still providing enough margin for normal production mail transport routes.
        const connectionTimeout = parseInt(process.env.SMTP_CONNECTION_TIMEOUT || '15000', 10);
        const greetingTimeout = parseInt(process.env.SMTP_GREETING_TIMEOUT || '15000', 10);
        const socketTimeout = parseInt(process.env.SMTP_SOCKET_TIMEOUT || '30000', 10);

        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
          connectionTimeout,
          greetingTimeout,
          socketTimeout,
        });
        this.isConfigured = true;
      }
    } else {
      const isProductionOrDemo =
        process.env.NODE_ENV === 'production' ||
        process.env.APP_MODE === 'production' ||
        process.env.APP_MODE === 'demo';
      if (isProductionOrDemo) {
        console.error('[MAIL_TRANSPORT_FAILURE] phase=init category=CONFIGURATION_INVALID');
        console.warn('SMTP configuration is missing. SMTP operations will fail with SMTP_NOT_CONFIGURED in production mode.');
      } else {
        console.warn('SMTP configuration is missing. MailProvider will run in MOCK mode.');
      }
    }
  }

  async sendMail(options: MailOptions): Promise<{ sent: boolean; isMock: boolean; info?: any }> {
    const from = process.env.SMTP_FROM || 'no-reply@ecotransit.vn';
    const isProductionOrDemo =
      process.env.NODE_ENV === 'production' ||
      process.env.APP_MODE === 'production' ||
      process.env.APP_MODE === 'demo';

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
      } catch (error: any) {
        const { category, hint } = classifyMailError(error);
        if (hint) {
          console.error(`[MAIL_TRANSPORT_FAILURE] phase=send category=${category} hint=${hint}`);
        } else {
          console.error(`[MAIL_TRANSPORT_FAILURE] phase=send category=${category}`);
        }
        if (!isProductionOrDemo) {
          console.error(error);
        }
        throw new Error('EMAIL_DELIVERY_UNAVAILABLE');
      }
    } else {
      // If we are in production or demo and SMTP is not configured, throw a clear operational error
      if (isProductionOrDemo) {
        console.error('[MAIL_TRANSPORT_FAILURE] phase=send category=CONFIGURATION_INVALID');
        throw new Error('SMTP_NOT_CONFIGURED');
      }

      // Mock mode for local development/testing only
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
