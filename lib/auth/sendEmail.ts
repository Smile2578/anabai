// lib/auth/sendEmail.ts

import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const sendEmail = async (options: EmailOptions) => {
  const transporter = nodemailer.createTransport({
    service: 'Mailjet',
    auth: {
      user: process.env.MAILJET_API_KEY!,
      pass: process.env.MAILJET_SECRET_KEY!,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM!,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
