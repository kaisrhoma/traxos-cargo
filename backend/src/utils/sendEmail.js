import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// إرسال OTP
export const sendOTPEmail = async (email, otp) => {
  try {
    const response = await resend.emails.send({
      from: 'Traxos <no-reply@traxos.store>',
      to: email,
      subject: 'رمز التحقق - Traxos',
      html: `
        <div dir="rtl" style="text-align:center;font-family:sans-serif;">
          <h2 style="color:#0a1d37;">مرحباً بك في Traxos</h2>
          <p>رمز التحقق الخاص بك:</p>
          <h1 style="color:#ff6b00;letter-spacing:5px;">${otp}</h1>
          <p>صالح لمدة 10 دقائق</p>
        </div>
      `
    });

    console.log("✅ OTP email sent:", response);
  } catch (error) {
    console.error("❌ Email send error:", error);
    throw error;
  }
};

// رسالة تواصل
export const sendContactEmail = async (name, message) => {
  return resend.emails.send({
    from: 'onboarding@resend.dev',
    to: 'traxos.ly@gmail.com',
    subject: `📩 رسالة جديدة من ${name}`,
    html: `<p>${message}</p>`
  });
};