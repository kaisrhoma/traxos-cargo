import nodemailer from 'nodemailer';

export const sendContactEmail = async (name, message) => {
  // const transporter = nodemailer.createTransport({
  //   service: 'gmail',
  //   host: 'smtp.gmail.com',
  //   port: 465,
  //   secure: true,
  //   auth: {
  //     user: 'traxos.ly@gmail.com',
  //     pass: 'ayhh fqwt lkgf mezf' // الرمز من جوجل (بدون مسافات)
  //   }
  // });

  const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // يجب أن تكون false للمنفذ 587
  auth: {
    user: 'traxos.ly@gmail.com',
    pass: 'ayhhfqwtlkgfmezf' // تأكد من حذف المسافات تماماً
  },
  tls: {
    rejectUnauthorized: false // يتجاوز مشاكل فحص الشهادات في Render
  },
  connectionTimeout: 10000 // زيادة وقت محاولة الاتصال لـ 10 ثوانٍ
});

  const mailOptions = {
    from: `"موقع تراكسوس" <traxos.ly@gmail.com>`,
    to: 'traxos.ly@gmail.com',
    subject: `📩 رسالة تواصل جديدة من: ${name}`,
    text: `لديك رسالة جديدة من الموقع:\n\nالاسم: ${name}\nالرسالة: ${message}`,
  };

  return transporter.sendMail(mailOptions);
};