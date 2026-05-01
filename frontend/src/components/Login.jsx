import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Login() {
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  // 1. إضافة حالة التحميل
  const [loading, setLoading] = useState(false); 
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponDetail, setCouponDetail] = useState({ discount: 0, expiry: '' });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); 
    setLoading(true); // 2. تفعيل التحميل عند بدء الطلب

    try {
      const response = await api.post('/api/auth/login', {
        email, 
        password
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', response.data.user.role);
      localStorage.setItem('userName', response.data.user.name);
      
      if (response.data.user.isNewUser) {
        const randomDiscount = Math.floor(Math.random() * 10) + 1;
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        const formattedDate = expiryDate.toLocaleDateString('ar-LY', { 
          year: 'numeric', month: 'long', day: 'numeric' 
        });

        setCouponDetail({ discount: randomDiscount, expiry: formattedDate });
        setShowCouponModal(true); 
      } else {
        completeLogin();
      }
    } catch (err) {
      setError(err.response?.data?.message || "خطأ في البريد الإلكتروني أو كلمة المرور");
    } finally {
      // 3. إيقاف التحميل سواء نجحت العملية أو فشلت
      setLoading(false); 
    }
  };

  const completeLogin = () => {
    navigate('/');
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4" dir="rtl">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-[#0a1d37] mb-6 text-center">تسجيل الدخول</h2>
        
        {error && <p className="text-red-500 text-sm text-center mb-4 bg-red-50 p-2 rounded border border-red-100">{error}</p>}

        <form className="flex flex-col gap-4" onSubmit={handleLogin}>
          <input 
            type="email" 
            placeholder="البريد الإلكتروني" 
            className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-[#ff6b00] border-gray-300 transition text-right" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="كلمة المرور" 
            className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-[#ff6b00] border-gray-300 transition text-right" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          {/* 4. تعديل الزر ليتفاعل مع حالة التحميل */}
          <button 
            type="submit" 
            disabled={loading}
            className={`text-white py-3 rounded-lg font-bold transition shadow-md ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#0a1d37] hover:bg-[#1a2d47]'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                جاري الدخول...
              </div>
            ) : "دخول"}
          </button>
        </form>
        
        <div className="mt-4 text-center space-y-2">
          <p className="text-gray-600">
            ليس لديك حساب؟ <Link to="/register" className="text-[#ff6b00] font-bold hover:underline">أنشئ حساباً الآن</Link>
          </p>
          <Link to="/forgot-password" d className="text-sm text-gray-500 hover:text-orange-500 block">
            نسيت كلمة المرور؟
          </Link>
        </div>
      </div>

      {/* نافذة الكوبون بقيت كما هي */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-[#0a1d37]/90 backdrop-blur-sm flex items-center justify-center z-[600] p-4">
          <div className="bg-white rounded-[2rem] p-10 max-w-sm w-full shadow-2xl text-center relative overflow-hidden border-b-8 border-[#ff6b00]">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h3 className="text-2xl font-black text-[#0a1d37] mb-2">هدية الترحيب!</h3>
            <p className="text-gray-500 mb-6 text-sm">يسعدنا انضمامك لأسرة تراكسوس. إليك خصم خاص لمستخدمينا الجدد:</p>
            
            <div className="relative bg-orange-50 border-2 border-dashed border-[#ff6b00] rounded-2xl p-6 mb-8">
              <div className="text-5xl font-black text-[#ff6b00]">{couponDetail.discount}%</div>
            </div>

            <button 
              onClick={completeLogin}
              className="w-full bg-[#ff6b00] text-white py-4 rounded-xl font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-200"
            >
              استخدام الخصم والدخول
            </button>
          </div>
        </div>
      )}
    </div>
  );
}