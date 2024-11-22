export interface EmailOptions {
  from: string;
  senderName: string;
  to: string;
  subject: string;
  content: string;
}

export interface SmtpServer {
  type: 'smtp' | 'sendgrid';
  host?: string;
  port?: string;
  username?: string;
  password?: string;
  isRootServer?: boolean;
  apiKey?: string;
}

export class EmailService {
  private server: SmtpServer;

  constructor(server: SmtpServer) {
    this.server = server;
  }

  private async sendSingleEmail(options: EmailOptions): Promise<boolean> {
    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          server: this.server,
          options,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send email');
      }

      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  async sendBulkEmails(
    options: Omit<EmailOptions, 'to' | 'senderName'> & {
      to: string[];
      senderNames: string[];
    },
    onProgress?: (progress: number) => void
  ): Promise<{ sent: number; delivered: number; failed: number }> {
    const results = {
      sent: 0,
      delivered: 0,
      failed: 0,
    };

    for (let i = 0; i < options.to.length; i++) {
      const senderName = options.senderNames[i % options.senderNames.length];
      
      results.sent++;
      
      const success = await this.sendSingleEmail({
        ...options,
        to: options.to[i],
        senderName,
      });

      if (success) {
        results.delivered++;
      } else {
        results.failed++;
      }

      if (onProgress) {
        onProgress((i + 1) / options.to.length * 100);
      }

      // Rate limiting to prevent overwhelming the email server
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    return results;
  }
}