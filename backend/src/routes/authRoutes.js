import { Router } from 'express';
import { 
  registerRequest, 
  verifyOtp, 
  login, 
  forgotPasswordRequest, 
  verifyOtpOnly, // أضف هذه
  resetPassword ,
  getMe,
} from '../controllers/authController.js'; 
import { verifyToken } from '../middleware/authMiddleware.js';

const router = Router();

// --- مسارات التسجيل والدخول ---
// 1. مسار طلب التسجيل (إرسال الـ OTP للإيميل)
router.post('/register-request', registerRequest);

// 2. مسار التحقق من الـ OTP وتفعيل الحساب
router.post('/verify-otp', verifyOtp);

// 3. مسار تسجيل الدخول
router.post('/login', login); 

// --- مسارات استعادة كلمة المرور ---
// 1. طلب إرسال رمز استعادة كلمة المرور
router.post('/forgot-password', forgotPasswordRequest);

// 2. التحقق من الرمز فقط (للانتقال لخطوة تعيين الكلمة الجديدة في الفرونت إند)
router.post('/verify-otp-only', verifyOtpOnly); 

// 3. تعيين كلمة المرور الجديدة ومسح الرمز
router.post('/reset-password', resetPassword);

// أضف verifyToken من الـ middleware
router.get('/me', verifyToken, getMe);

export default router;