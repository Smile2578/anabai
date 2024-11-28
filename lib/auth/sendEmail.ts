// lib/email/emailService.ts
import { Resend } from 'resend';

// Vérification de la présence de la clé API
if (!process.env.RESEND_API_KEY) {
  throw new Error('La clé API Resend est manquante dans les variables d\'environnement');
}

// Initialisation de Resend avec la clé API
const resend = new Resend(process.env.RESEND_API_KEY);

// Types pour les paramètres des emails
interface EmailParams {
  to: string;
  subject: string;
  content: string;
}

// Types pour les templates d'email
interface EmailTemplate {
  subject: string;
  content: string;
}

class EmailService {
  private getBaseTemplate(content: string) {
    // Template de base pour tous les emails avec style consistent
    return `
      <div style="font-family: Inter, system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        ${content}
        <div style="margin-top: 32px; padding-top: 32px; border-top: 1px solid #eaeaea; text-align: center; color: #666;">
          <p style="margin: 0;">© ${new Date().getFullYear()} Anaba.io. Tous droits réservés.</p>
        </div>
      </div>
    `;
  }

  private readonly emailTemplates = {
    verification: (name: string, token: string): EmailTemplate => ({
      subject: 'Vérifiez votre compte Anaba.io',
      content: this.getBaseTemplate(`
        <h1 style="color: #333; margin-bottom: 24px;">Bienvenue sur Anaba.io, ${name} !</h1>
        <p style="color: #666; margin-bottom: 24px;">Pour commencer votre voyage au Japon, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}"
             style="display: inline-block; padding: 12px 24px; background-color: #4A3AFF; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">
            Vérifier mon compte
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">Ce lien expirera dans 24 heures. Si vous n'avez pas créé de compte sur Anaba.io, vous pouvez ignorer cet email.</p>
      `)
    })
  };

  async sendEmail({ to, subject, content }: EmailParams): Promise<void> {
    try {
      const result = await resend.emails.send({
        from: 'Anaba.io <no-reply@anaba.io>',
        to: [to],
        subject,
        html: content,
      });

      if (result.error) {
        throw new Error(`Échec de l'envoi: ${result.error.message}`);
      }

      console.log('✉️ Email envoyé avec succès:', result.data);
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
      throw new Error('Échec de l\'envoi de l\'email');
    }
  }

  async sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
    const template = this.emailTemplates.verification(name, token);
    await this.sendEmail({
      to: email,
      subject: template.subject,
      content: template.content
    });
  }
}

// Export d'une instance unique du service
export const emailService = new EmailService();