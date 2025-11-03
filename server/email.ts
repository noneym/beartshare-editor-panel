import nodemailer from "nodemailer";
import type { User } from "@shared/schema";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtp-relay.brevo.com",
  port: parseInt(process.env.MAIL_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.MAIL_USERNAME || "berkca@gmail.com",
    pass: process.env.MAIL_PASSWORD || "RcCmNQIfMVqAy8H9",
  },
});

export interface SendEmailOptions {
  to: string[];
  subject: string;
  html: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const from = `${process.env.MAIL_FROM_NAME || "Beartshare"} <${process.env.MAIL_FROM_ADDRESS || "info@beartshare.com"}>`;

  await transporter.sendMail({
    from,
    to: options.to.join(", "),
    subject: options.subject,
    html: options.html,
  });
}

export function replaceTemplateTags(content: string, user: Partial<User>, customText?: string): string {
  return content
    .replace(/\[isim\]/g, user.name || "")
    .replace(/\[soyisim\]/g, user.lastname || "")
    .replace(/\[email\]/g, user.email || "")
    .replace(/\[metin\]/g, customText || "");
}
