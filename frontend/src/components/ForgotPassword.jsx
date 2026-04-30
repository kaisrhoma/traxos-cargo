import React, { useState } from 'react';
import api from '../api/axios'; // استخدام الملف الموحد
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // حالة النافذة المنبثقة
  const navigate = useNavigate();

  const handleRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/api/auth/forgot-password', { email });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ ما");
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/api/auth/verify-otp-only', { email, otp });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "الرمز غير صحيح أو انتهت صلاحيته");
    } finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return setError("كلمة المرور قصيرة جداً");
    
    setLoading(true);
    setError('');
    try {
      await api.post('/api/auth/reset-password', { email, otp, newPassword });
      setShowSuccessModal(true); // إظهار النافذة بدلاً من alert
    } catch (err) {
      setError(err.response?.data?.message || "فشل التحديث، حاول مجدداً");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4" dir="rtl">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
             <span className="text-3xl">🔑</span>
          </div>
          <h2 className="text-2xl font-bold text-[#0a1d37]">
            {step === 1 && "استعادة كلمة المرور"}
            {step === 2 && "التحقق من الرمز"}
            {step === 3 && "تعيين كلمة جديدة"}
          </h2>
        </div>
        
        {error && <p className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-center border border-red-100 text-sm">{error}</p>}

        <form 
          onSubmit={step === 1 ? handleRequest : step === 2 ? handleVerifyOtp : handleReset} 
          className="flex flex-col gap-4"
        >
          {step === 1 && (
            <>
              <p className="text-gray-500 text-sm text-center mb-2">أدخل بريدك الإلكتروني المسجل لنرسل لك رمز التحقق.</p>
              <input 
                type="email" placeholder="أدخل بريدك الإلكتروني" required
                value={email}
                className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-[#ff6b00] transition-all text-right"
                onChange={(e) => setEmail(e.target.value)}
              />
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-sm text-center text-gray-500 mb-2">لقد أرسلنا كود التحقق إلى <br/><b>{email}</b></p>
              <input 
                type="text" placeholder="رمز التحقق (OTP)" required
                value={otp}
                maxLength="6"
                className="p-3 border rounded-lg text-center font-bold tracking-[10px] text-2xl outline-none focus:ring-2 focus:ring-[#ff6b00]"
                onChange={(e) => setOtp(e.target.value)}
              />
            </>
          )}

          {step === 3 && (
            <>
              <p className="text-gray-500 text-sm text-center mb-2">أدخل كلمة مرور قوية وسهلة التذكر.</p>
              <input 
                type="password" placeholder="كلمة المرور الجديدة" required
                value={newPassword}
                className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-[#ff6b00] text-right"
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </>
          )}
          
          <button 
            disabled={loading}
            className={`py-3 rounded-lg font-bold transition shadow-md text-white ${loading ? 'bg-gray-400' : 'bg-[#ff6b00] hover:bg-orange-600'}`}
          >
            {loading ? "جاري المعالجة..." : 
             step === 1 ? "إرسال الرمز" : 
             step === 2 ? "تحقق من الرمز" : 
             "تحديث كلمة المرور"}
          </button>

          {step > 1 && (
            <button 
              type="button" 
              onClick={() => { setStep(step - 1); setError(''); }}
              className="text-sm text-gray-500 hover:text-[#ff6b00] transition"
            >
              رجوع
            </button>
          )}
          
          {step === 1 && (
             <button 
              type="button" 
              onClick={() => navigate('/login')}
              className="text-sm text-gray-500 hover:text-[#ff6b00] transition"
            >
              العودة لتسجيل الدخول
            </button>
          )}
        </form> 
      </div>

      {/* النافذة المنبثقة للنجاح */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-[#0a1d37]/90 backdrop-blur-sm flex items-center justify-center z-[600] p-4">
          <div className="bg-white rounded-[2rem] p-10 max-w-sm w-full shadow-2xl text-center relative overflow-hidden border-b-8 border-green-500">
            <div className="text-6xl mb-4 animate-bounce">✅</div>
            <h3 className="text-2xl font-black text-[#0a1d37] mb-2">تم التغيير بنجاح!</h3>
            <p className="text-gray-500 mb-8 text-sm">لقد تم تحديث كلمة مرور حسابك في تراكسوس بنجاح. يمكنك الآن تسجيل الدخول باستخدام بياناتك الجديدة.</p>
            
            <button 
              onClick={() => navigate('/login')}
              className="w-full bg-green-500 text-white py-4 rounded-xl font-bold hover:bg-green-600 transition shadow-lg shadow-green-100"
            >
              تسجيل الدخول الآن
            </button>
          </div>
        </div>
      )}
    </div>
  );
}