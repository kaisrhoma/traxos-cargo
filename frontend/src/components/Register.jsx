import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', otp: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  // ✅ هذا هو السطر الذي كان ينقصك وتسبب في المشكلة
  const [showSuccessModal, setShowSuccessModal] = useState(false); 
  
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (step === 1) {
        if (formData.password.length < 6) {
          setLoading(false);
          return setError("كلمة المرور يجب أن تكون 6 رموز على الأقل");
        }
        if (formData.password !== formData.confirmPassword) {
          setLoading(false);
          return setError("كلمات المرور غير متطابقة");
        }

        await api.post('/api/auth/register-request', {
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        
        setStep(2);
      } else {
        await api.post('/api/auth/verify-otp', {
          email: formData.email,
          otp: formData.otp
        });

        // تفعيل النافذة المنبثقة عند النجاح
        setShowSuccessModal(true); 
      }
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ ما، حاول مجدداً");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setError('');
    setStep(1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12" dir="rtl">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-[#0a1d37] text-center mb-6">
          {step === 1 ? "إنشاء حساب" : "التحقق من البريد الإلكتروني"}
        </h2>
        
        {error && <p className="bg-red-100 text-red-600 p-2 rounded mb-4 text-center border border-red-200">{error}</p>}

        <form className="flex flex-col gap-4" onSubmit={handleRegister}>
          {step === 1 ? (
            <>
              <input 
                type="text" placeholder="الاسم الكامل" required
                value={formData.name}
                className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-[#ff6b00] border-gray-300 transition"
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              <input 
                type="email" placeholder="البريد الإلكتروني" required
                value={formData.email}
                className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-[#ff6b00] border-gray-300 transition"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              <input 
                type="password" placeholder="كلمة المرور (6 رموز+)" required
                value={formData.password}
                className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-[#ff6b00] border-gray-300 transition"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <input 
                type="password" placeholder="تأكيد كلمة المرور" required
                value={formData.confirmPassword}
                className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-[#ff6b00] border-gray-300 transition"
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />
              <button 
                disabled={loading}
                className={`text-white py-3 rounded-lg font-bold transition shadow-lg ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#ff6b00] hover:bg-orange-600'}`}
              >
                {loading ? "جاري الإرسال..." : "إرسال رمز التحقق"}
              </button>
            </>
          ) : (
            <>
              <p className="text-center text-gray-600 mb-2 font-medium">الرمز أرسل إلى: <br/><span className="text-[#ff6b00]">{formData.email}</span></p>
              <input 
                type="text" placeholder="رمز التحقق (OTP)" required
                value={formData.otp}
                maxLength="6"
                className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-[#ff6b00] border-gray-300 text-center font-bold tracking-[10px] text-xl"
                onChange={(e) => setFormData({...formData, otp: e.target.value})}
              />
              <button 
                disabled={loading}
                className={`text-white py-3 rounded-lg font-bold transition ${loading ? 'bg-gray-400' : 'bg-[#0a1d37] hover:bg-[#1a2d47]'}`}
              >
                {loading ? "جاري التحقق..." : "تأكيد الرمز"}
              </button>
              <button type="button" onClick={goBack} className="text-sm text-gray-500 hover:text-[#ff6b00] transition flex items-center justify-center gap-1">
                <span>←</span> رجوع لتعديل البيانات
              </button>
            </>
          )}
        </form>
        <p className="mt-6 text-center text-gray-600">لديك حساب؟ <Link to="/login" className="text-[#ff6b00] font-bold hover:underline transition">تسجيل الدخول</Link></p>
      </div>

      {/* النافذة المنبثقة */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4" dir="rtl">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center transform transition-all scale-100">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl font-bold">
              ✓
            </div>
            
            <h3 className="text-2xl font-bold text-[#0a1d37] mb-2">تم التحقق بنجاح!</h3>
            <p className="text-gray-500 mb-6">
              لقد تم تفعيل حسابك بنجاح. يمكنك الآن الانتقال لصفحة تسجيل الدخول والبدء في تتبع شحناتك.
            </p>

            <button 
              onClick={() => navigate('/login')}
              className="w-full bg-[#ff6b00] text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-200"
            >
              الذهاب لتسجيل الدخول
            </button>
          </div>
        </div>
      )}
    </div>
  );
}