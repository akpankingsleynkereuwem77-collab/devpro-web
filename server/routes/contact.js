import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';

export const contactRouter = Router();
export const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many enquiries from this connection. Please try again in 15 minutes.' }
});

import { validateContact } from '../contact-validation.js';

function createTransporter(env = process.env) {
  const host = env.EMAIL_HOST;
  const user = env.EMAIL_USER;
  const pass = env.EMAIL_PASS;
  if (!host || !user || !pass || !env.CONTACT_TO || !env.CONTACT_FROM) return null;
  const port = Number(env.EMAIL_PORT || 587);
  if (!Number.isInteger(port) || port < 1 || port > 65535) return null;
  return nodemailer.createTransport({
    host,
    port,
    secure: String(env.EMAIL_SECURE).toLowerCase() === 'true',
    auth: { user, pass }
  });
}

contactRouter.post('/', async (req, res) => {
  // Honeypot: respond as if accepted, without sending spam.
  if (cleanText(req.body?.companyWebsite)) {
    return res.status(200).json({ message: 'Thanks — your enquiry has been received.' });
  }

  const { errors, value } = validateContact(req.body);
  if (Object.keys(errors).length) return res.status(400).json({ message: 'Please correct the highlighted fields.', errors });

  const transporter = createTransporter();
  if (!transporter) {
    return res.status(503).json({ message: 'The contact service is not configured yet. Please email hello@devpro.example after the site owner configures a real address.' });
  }

  const safeName = value.name.replace(/[\r\n]+/g, ' ');
  const safeEmail = value.email.replace(/[\r\n]+/g, '');
  const bodyText = [
    `Name: ${safeName}`,
    `Email: ${safeEmail}`,
    `Phone: ${value.phone || 'Not provided'}`,
    `Project type: ${value.projectType}`,
    `Budget: ${value.budget || 'Not provided'}`,
    '', 'Message:', value.message
  ].join('\n');

  try {
    await transporter.sendMail({
      from: process.env.CONTACT_FROM,
      to: process.env.CONTACT_TO,
      replyTo: safeEmail,
      subject: `New DevPro enquiry: ${value.projectType}`,
      text: bodyText
    });
    return res.status(200).json({ message: 'Thanks — your enquiry was sent successfully. I’ll be in touch soon.' });
  } catch (error) {
    console.error('Contact email delivery failed:', error?.message || 'Unknown error');
    return res.status(502).json({ message: 'Your details could not be emailed right now. Please try again later or contact us another way.' });
  }
});
