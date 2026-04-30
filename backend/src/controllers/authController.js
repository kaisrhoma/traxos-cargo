import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// const transporter = nodemailer.createTransport({
//   host: 'smtp.gmail.com',
//   port: 465,
//   secure: true, 
//   auth: {
//     user: 'traxos.ly@gmail.com',
//     pass: 'ayhh fqwt lkgf mezf'
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
// --- 1. طلب التسجيل وإرسال الكود ---
export const registerRequest = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: 'هذا البريد الإلكتروني مسجل ومفعل بالفعل' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); 
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.upsert({
      where: { email },
      update: { otp, otpExpires, password: hashedPassword, name, isVerified: false },
      create: { email, name, password: hashedPassword, otp, otpExpires, isVerified: false }
    });

    const mailOptions = {
      from: '"تراكسوس كارجو" <traxos.ly@gmail.com>',
      to: email,
      subject: 'رمز التحقق الخاص بحسابك - Traxos',
      html: `<div dir="rtl" style="text-align: center; font-family: sans-serif;">
              <h2 style="color: #0a1d37;">مرحباً بك في Traxos Cargo</h2>
              <p>كود التحقق الخاص بك هو:</p>
              <h1 style="color: #ff6b00; letter-spacing: 5px;">${otp}</h1>
              <p>صالح لمدة 10 دقائق.</p>
            </div>`
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'تم إرسال الرمز بنجاح' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
};

// --- 2. التحقق من الـ OTP وتفعيل الحساب (يُستخدم عند التسجيل الجديد) ---
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.otp !== otp || new Date() > user.otpExpires) {
      return res.status(400).json({ message: 'الرمز غير صحيح أو انتهت صلاحيته' });
    }

    await prisma.user.update({
      where: { email },
      data: { otp: null, otpExpires: null, isVerified: true }
    });

    res.status(200).json({ message: 'تم تفعيل حسابك بنجاح! يمكنك الآن تسجيل الدخول.' });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في التفعيل' });
  }
};

// --- 3. تسجيل الدخول ---
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // البحث عن المستخدم في قاعدة البيانات
    const user = await prisma.user.findUnique({ where: { email } });

    // التحقق من وجود المستخدم وصحة كلمة المرور
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'خطأ في البريد أو كلمة المرور' });
    }

    // التحقق من تفعيل الحساب
    if (!user.isVerified) {
      return res.status(403).json({ message: 'يرجى تفعيل حسابك أولاً باستخدام رمز التحقق المرسل إليك' });
    }

    // منطق الكوبون: نتحقق من حالة isNewUser قبل تحديثها
    const wasNewUser = user.isNewUser;

    // إذا كان مستخدماً جديداً، نقوم بتحديث الحالة فوراً في قاعدة البيانات
    // لضمان عدم ظهور الكوبون مرة أخرى في الدخول القادم
    if (wasNewUser) {
      await prisma.user.update({
        where: { email },
        data: { isVerified: true, isNewUser: false } // نغير isNewUser إلى false
      });
    }

    // إنشاء التوكن
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'traxos_secret',
      { expiresIn: '1d' }
    );

    // إرسال البيانات للفرونت إند مع إشارة الكوبون
    res.status(200).json({
      token,
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        isNewUser: wasNewUser // هنا نرسل true فقط في أول مرة يدخل فيها
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

// --- 4. استعادة كلمة المرور: طلب الرمز ---
export const forgotPasswordRequest = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "هذا البريد غير مسجل لدينا" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); 

    await prisma.user.update({
      where: { email },
      data: { otp, otpExpires }
    });

    const mailOptions = {
      from: '"تراكسوس كارجو" <traxos.ly@gmail.com>',
      to: email,
      subject: 'إعادة تعيين كلمة المرور - Traxos',
      html: `<div dir="rtl" style="text-align: center;">
              <h2>طلب إعادة تعيين كلمة المرور</h2>
              <p>استخدم الكود التالي لتغيير كلمة مرورك:</p>
              <h1 style="color: #ff6b00;">${otp}</h1>
            </div>`
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "تم إرسال رمز التحقق إلى بريدك" });
  } catch (error) {
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
};

// --- 5. استعادة كلمة المرور: التحقق من الرمز فقط (دون حذفه) ---
// هذا المسار ضروري للانتقال للخطوة الثالثة في الفرونت إند
export const verifyOtpOnly = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.otp !== otp || new Date() > user.otpExpires) {
      return res.status(400).json({ message: 'الرمز غير صحيح أو انتهت صلاحيته' });
    }

    res.status(200).json({ message: 'الرمز صحيح' });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
};

// --- 6. استعادة كلمة المرور: التغيير النهائي ---
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.otp !== otp || new Date() > user.otpExpires) {
      return res.status(400).json({ message: "جلسة التحقق انتهت، اطلب رمزاً جديداً" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: { 
        password: hashedPassword, 
        otp: null, 
        otpExpires: null 
      }
    });

    res.json({ message: "تم تغيير كلمة المرور بنجاح" });
  } catch (error) {
    res.status(500).json({ message: "فشل تغيير كلمة المرور" });
  }
};

// authController.js أو userController.js
export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }, // نفس المفتاح المستخدم في التوكن
      select: { name: true, email: true, role: true } // لا ترجع الباسورد
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "خطأ في جلب البيانات" });
  }
};