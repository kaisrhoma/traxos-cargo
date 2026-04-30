import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'; // ✅ تأكد من استيراد api

export default function Hero() {
  const [trackingNum, setTrackingNum] = useState('')
  const [orderData, setOrderData] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // حالات جديدة للنوافذ المنبثقة
  const [alertConfig, setAlertConfig] = useState({ show: false, message: '', type: '' });
  
  const navigate = useNavigate()

  const showAlert = (message, type = 'error') => {
    setAlertConfig({ show: true, message, type });
  };

  const handleTrack = async () => {
    const token = localStorage.getItem('token')
    
    if (!token) {
      showAlert('يرجى تسجيل الدخول أولاً لتتمكن من تتبع شحناتك', 'auth');
      return;
    }

    if (!trackingNum) {
      showAlert('يرجى إدخال رقم التتبع الخاص بك');
      return;
    }

    setLoading(true)
    try {
      // ✅ استخدام api بدلاً من fetch اليدوي
      const response = await api.get(`/api/orders/track/${trackingNum}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setOrderData(response.data)
      setShowResult(true)
    } catch (error) {
      const msg = error.response?.data?.message || 'رقم التتبع غير صحيح أو حدث خطأ في النظام';
      showAlert(msg);
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative bg-[#0a1d37] py-20 px-8 flex flex-col items-center justify-center text-center overflow-hidden">
      {/* زخرفة الخلفية */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path fill="#FFFFFF" d="M44.7,-76.4C58.1,-69.2,71.2,-59.1,79.6,-45.8C88.1,-32.5,91.8,-16.2,89.5,-0.3C87.2,15.6,78.8,31.2,68.8,43.9C58.8,56.6,47.2,66.4,33.9,72.4C20.6,78.5,5.6,80.8,-9.7,78.1C-25,75.4,-40.5,67.6,-53.4,56.5C-66.3,45.4,-76.5,31,-81,15.1C-85.5,-0.8,-84.3,-18.2,-77.2,-33.5C-70.1,-48.8,-57.1,-62,-42.2,-68.4C-27.3,-74.8,-13.7,-74.4,0.7,-75.6C15.1,-76.8,31.3,-79.6,44.7,-76.4Z" transform="translate(100 100)" />
        </svg>
      </div>

      <h1 className="relative z-10 text-4xl md:text-6xl font-bold text-white mb-6">
        شحن بضائعك أصبح <span className="text-[#ff6b00]">أسهل</span>
      </h1>
      <p className="relative z-10 text-gray-300 text-lg md:text-xl mb-10 max-w-2xl">
        من الصين، تركيا، وأوروبا.. نوفر لك حلولاً لوجستية متكاملة لتصل بضائعك إلى ليبيا بأمان وسرعة.
      </p>

      {/* صندوق التتبع */}
      <div className="relative z-10 w-full max-w-2xl flex flex-col md:flex-row gap-2 bg-white p-2 rounded-2xl shadow-2xl">
        <input 
          type="text" 
          placeholder="أدخل رقم التتبع (مثلاً: TRX-1234)" 
          className="flex-1 px-6 py-4 text-black outline-none text-lg rounded-xl"
          value={trackingNum}
          onChange={(e) => setTrackingNum(e.target.value)}
        />
        <button 
          onClick={handleTrack}
          disabled={loading}
          className="bg-[#0a1d37] hover:bg-[#1a2d47] text-white px-10 py-4 rounded-xl font-bold text-lg transition shadow-lg disabled:opacity-50"
        >
          {loading ? 'جاري البحث...' : 'تتبع الآن'}
        </button>
      </div>

      {/* 1. نافذة التنبيهات المنبثقة (Error & Auth Alert) */}
      {alertConfig.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-8 text-center shadow-2xl border-t-4 border-[#ff6b00]">
            <div className="text-4xl mb-4">
              {alertConfig.type === 'auth' ? '🔒' : '⚠️'}
            </div>
            <h3 className="text-xl font-bold text-[#0a1d37] mb-4">{alertConfig.message}</h3>
            <div className="flex flex-col gap-2">
              {alertConfig.type === 'auth' ? (
                <button 
                  onClick={() => navigate('/login')}
                  className="bg-[#ff6b00] text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition"
                >
                  ذهاب لتسجيل الدخول
                </button>
              ) : null}
              <button 
                onClick={() => setAlertConfig({ ...alertConfig, show: false })}
                className="bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. نافذة عرض النتائج (Modal) كما هي */}
      {showResult && orderData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-right animate-in fade-in zoom-in duration-300">
            <div className="bg-[#0a1d37] p-4 text-white flex justify-between items-center">
              <button onClick={() => setShowResult(false)} className="text-2xl hover:text-red-400 transition">&times;</button>
              <h3 className="font-bold">تفاصيل الشحنة: {orderData.trackingNumber}</h3>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <span className={`px-4 py-1 rounded-full text-xs font-bold ${orderData.status === 'جاهز للتسليم' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-[#ff6b00]'}`}>
                  {orderData.status}
                </span>
                <span className="text-gray-500 text-sm font-bold">{orderData.shippingType}</span>
              </div>
              <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {orderData.trackingDetails?.split('\n').map((detail, index) => (
                  <div key={index} className="border-r-2 border-[#ff6b00] pr-4 relative">
                    <div className="absolute -right-[9px] top-1 w-4 h-4 bg-[#ff6b00] rounded-full border-4 border-white shadow-sm"></div>
                    <p className="text-sm text-gray-700 leading-relaxed font-medium">{detail}</p>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setShowResult(false)}
                className="w-full mt-6 bg-[#0a1d37] text-white py-4 rounded-xl font-bold transition hover:bg-[#ff6b00] shadow-md"
              >
               اغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}