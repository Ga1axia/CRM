import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

const BREVO_HOST = 'smtp-relay.brevo.com';
const BREVO_PORT = 587;

const DEFAULT_TRANSPORTER = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? BREVO_HOST,
  port: Number(process.env.SMTP_PORT || BREVO_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  pool: true,
  maxConnections: 3,
  maxMessages: Infinity,
});

/** Create a Brevo SMTP transporter from a user's login and SMTP key */
export function createBrevoTransporter(smtpLogin: string, smtpKey: string): Transporter {
  return nodemailer.createTransport({
    host: BREVO_HOST,
    port: BREVO_PORT,
    secure: false,
    auth: {
      user: smtpLogin,
      pass: smtpKey,
    },
  });
}

/** Send email using env-based SMTP or a user's Brevo transporter (when provided) */
export async function sendEmail(
  options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
    from?: string;
  },
  transporter?: Transporter
) {
  const transport = transporter ?? DEFAULT_TRANSPORTER;
  const from = options.from ?? process.env.SMTP_FROM ?? 'noreply@generator-crm.local';
  return transport.sendMail({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });
}
