import { promises as fs } from 'node:fs';
import path from 'node:path';
import nodemailer from 'nodemailer';

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  private static getTransporter(): nodemailer.Transporter | null {
    if (this.transporter) {
      return this.transporter;
    }

    const host = process.env.SMTP_HOST;
    const portStr = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;

    if (!host || !portStr || !user || !pass) {
      // SMTP credentials not fully configured, return null to use simulation mode
      return null;
    }

    const port = parseInt(portStr, 10);
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });

    return this.transporter;
  }

  static async sendMail(options: SendMailOptions): Promise<{ success: boolean; simulated: boolean; info?: any }> {
    const transporter = this.getTransporter();
    const from = process.env.SMTP_FROM || 'no-reply@towerpower.local';

    if (transporter) {
      try {
        const info = await transporter.sendMail({
          from,
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text || options.subject,
        });

        console.log(`[EmailService] Real email sent to ${options.to}. Message ID: ${info.messageId}`);
        return { success: true, simulated: false, info };
      } catch (error) {
        console.error('[EmailService] Error sending real email, falling back to simulation:', error);
        // Fall through to simulation if real sending fails
      }
    }

    // Simulation Mode
    const timestamp = new Date().toISOString();
    const logDir = path.join(process.cwd(), 'tmp');
    const logPath = path.join(logDir, 'simulated-emails.log');

    const emailPayload = {
      timestamp,
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.subject,
    };

    const logMessage = `--- EMAIL SIMULATION START (${timestamp}) ---\n` +
      `From: ${emailPayload.from}\n` +
      `To: ${emailPayload.to}\n` +
      `Subject: ${emailPayload.subject}\n` +
      `Text: ${emailPayload.text}\n` +
      `HTML:\n${emailPayload.html}\n` +
      `--- EMAIL SIMULATION END ---\n\n`;

    try {
      await fs.mkdir(logDir, { recursive: true });
      await fs.appendFile(logPath, logMessage, 'utf-8');
      console.log(`[EmailService] Simulated email to ${options.to} logged in ${logPath}`);
      return { success: true, simulated: true };
    } catch (fsError) {
      console.error('[EmailService] Failed to write simulated email to file:', fsError);
      console.log(`[EmailService] Simulated email payload:`, emailPayload);
      return { success: false, simulated: true };
    }
  }
}
