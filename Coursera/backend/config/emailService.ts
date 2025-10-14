import sgMail from '@sendgrid/mail';

const SENDGRID_API_KEY = "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"
const FROM_EMAIL = "princesahu17125@gmail.com";

if (!SENDGRID_API_KEY) {
  console.warn('SENDGRID_API_KEY not found in .env');
}

sgMail.setApiKey(SENDGRID_API_KEY || '');

export const sendOTPEmail = async (toEmail: string, otp: string) => {
  const msg = {
    to: toEmail,
    from: FROM_EMAIL,
    subject: 'Your OTP Code - VaurLis',
    text: `Your OTP code is: ${otp}. This code will expire in 5 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Your OTP Code</h2>
        <p>Your verification code is:</p>
        <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
        <p>This code will expire in <strong>5 minutes</strong>.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log('OTP email sent to:', toEmail);
    return { success: true };
  } catch (error: any) {
    console.error('SendGrid Error:', error.response?.body || error.message);
    return { success: false, error: error.message };
  }
};