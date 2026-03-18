import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends a recovery email to the user
 * @param to The user's email address
 * @param firstName The user's first name
 */
export async function sendRecoveryEmail(to: string, firstName: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'SurakshaPay AI <onboarding@resend.dev>',
      to: [to],
      subject: 'SurakshaPay AI - Account Recovery',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg: 12px;">
          <h1 style="color: #0f172a; font-size: 24px; font-weight: 800; margin-bottom: 24px;">Account Recovery</h1>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">Hello ${firstName},</p>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">We received a request to recover your SurakshaPay AI account.</p>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">Since this is a demo environment, your account has been verified. You can now return to the login page and sign in with <strong>any password</strong> of your choice.</p>
          <div style="margin-top: 32px; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
            <p style="color: #0f172a; font-weight: 700; margin: 0;">Next Step:</p>
            <p style="margin-top: 8px; color: #475569;">Visit our login page and sign in to access your dashboard.</p>
          </div>
          <p style="margin-top: 32px; color: #94a3b8; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
          <hr style="margin-top: 32px; border: 0; border-top: 1px solid #e2e8f0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">© 2026 SurakshaPay AI. Powered by Guidewire Cloud.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Failed to send email:', err);
    return { success: false, error: err };
  }
}
