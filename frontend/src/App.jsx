import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard';
import ForgotPassword from './components/ForgotPassword';
import truckPng from './assets/trpng.png';
import api from './api/axios'; 

// --- مكونات الحماية ---

// 1. يمنع المسجلين من رؤية صفحات Login/Register
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/" replace /> : children;
};

// 2. يحمي لوحة التحكم للأدمن فقط
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');
  return (token && role === 'ADMIN') ? children : <Navigate to="/" replace />;
};

// --- مكونات الأقسام (Services, About, ContactForm, Contact) ---
// (أبقيها كما هي لديك في الكود، سأختصرها هنا لسهولة القراءة)

const Services = () => (
  <section id="services" className="py-20 bg-gray-50 px-8 text-center">
    <h2 className="text-4xl font-bold text-[#0a1d37] mb-12 text-center">خدماتنا اللوجستية</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-t-4 border-[#ff6b00]">
        <div className="text-4xl mb-4 text-[#ff6b00]">🚢</div>
        <h3 className="text-xl font-bold mb-2 text-[#0a1d37]">الشحن البحري</h3>
        <p className="text-gray-600">نقل الحاويات من الموانئ العالمية إلى ميناء الخمس وطرابلس بأفضل الأسعار.</p>
      </div>
      <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-t-4 border-[#ff6b00]">
        <div className="text-4xl mb-4 text-[#ff6b00]">✈️</div>
        <h3 className="text-xl font-bold mb-2 text-[#0a1d37]">الشحن الجوي</h3>
        <p className="text-gray-600">خدمة الشحن السريع للبضائع والطرود الشخصية من تركيا والصين يومياً.</p>
      </div>
      <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-t-4 border-[#ff6b00]">
        <div className="text-4xl mb-4 text-[#ff6b00]">📦</div>
        <h3 className="text-xl font-bold mb-2 text-[#0a1d37]">التجميع والتخزين</h3>
        <p className="text-gray-600">نوفر لك مستودعات في الخارج لتجميع بضائعك من مختلف الموردين وشحنها معاً.</p>
      </div>
    </div>
  </section>
);

const About = () => (
  <section id="about" className="py-20 bg-white px-8">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
      <div className="flex-1 text-right">
        <h2 className="text-4xl font-bold text-[#0a1d37] mb-6">حول تراكسوس كارجو</h2>
        <p className="text-gray-600 text-lg leading-relaxed mb-6">
          نحن في تراكسوس نسعى لتسهيل حركة التجارة بين ليبيا والعالم. نؤمن بأن اللوجستيات هي العمود الفقري للأعمال، لذلك نوفر حلولاً متكاملة تبدأ من استلام بضائعك من المصنع وصولاً إلى باب بيتك.
        </p>
        <div className="grid grid-cols-2 gap-6">
          <div className="border-r-4 border-[#ff6b00] pr-4">
            <h4 className="font-bold text-[#0a1d37]">سرعة التوصيل</h4>
            <p className="text-sm text-gray-500">نلتزم بمواعيد دقيقة للشحن الجوي والبحري.</p>
          </div>
          <div className="border-r-4 border-[#ff6b00] pr-4">
            <h4 className="font-bold text-[#0a1d37]">أمان عالي</h4>
            <p className="text-sm text-gray-500">نظام تتبع دقيق يضمن سلامة بضائعك.</p>
          </div>
        </div>
      </div>
      <div className="flex-1 h-80 flex items-center justify-center relative p-6">
        {/* الظل الخلفي المتوهج */}
        <div className="absolute inset-0 bg-[#0a1d37]/5 rounded-full scale-90 blur-3xl"></div>
        <img 
          src={truckPng} 
          alt="شاحنة تراكسوس" 
          className="max-w-full max-h-full object-contain relative z-10 transform hover:-translate-y-4 transition-transform duration-500 ease-in-out cursor-pointer"
        />
      </div>
    </div>
  </section>
);

const ContactForm = () => {
  const [formData, setFormData] = useState({ name: '', message: '' });
  const [status, setStatus] = useState('');

  const handleSubmit = async () => {
    if (!formData.name || !formData.message) return setStatus('يرجى ملء جميع الحقول');
    const token = localStorage.getItem('token');
    if (!token) return setStatus('يرجى تسجيل الدخول للإرسال');
    
    setStatus('جاري الإرسال...');
    try {
      // ✅ تعديل هنا لاستخدام api الموحد بدلاً من fetch اليدوي
      const response = await api.post('/api/orders/contact', formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setStatus('تم الإرسال بنجاح!');
      setFormData({ name: '', message: '' });
    } catch (err) {
      setStatus(err.response?.data?.message || 'حدث خطأ في الإرسال');
    }
  };

  return (
    <div className="space-y-4">
      <input type="text" placeholder="الاسم" value={formData.name} onChange={(e)=>setFormData({...formData, name: e.target.value})} className="w-full p-3 rounded bg-white/10 border border-white/20 text-white outline-none focus:border-[#ff6b00]" />
      <textarea placeholder="رسالتك" value={formData.message} onChange={(e)=>setFormData({...formData, message: e.target.value})} className="w-full p-3 rounded bg-white/10 border border-white/20 text-white outline-none focus:border-[#ff6b00]" rows="3"></textarea>
      <button onClick={handleSubmit} className="w-full bg-[#ff6b00] py-3 rounded font-bold hover:bg-orange-600 transition text-white">إرسال</button>
      {status && <p className="text-xs text-orange-400 text-center mt-2">{status}</p>}
    </div>
  );
};

// ... باقي المكونات (Services, About, Contact, App) تبقى كما هي

const Contact = () => (
  <section id="contact" className="py-20 bg-[#0a1d37] text-white px-8">
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-4xl font-bold mb-6">تواصل معنا</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="text-right space-y-4">
          <p>📍 ام الجرسان - يفرن - ليبيا</p>
          <p className="font-mono">📞 3935 047 092 218+</p>
          <p>✉️ traxos.ly@gmail.com</p>
        </div>
        <ContactForm />
      </div>
    </div>
  </section>
);

// --- المكون الرئيسي ---

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white" dir="rtl">
        <Navbar />
        <Routes>
          {/* الصفحة الرئيسية */}
          <Route path="/" element={
            <>
              <Hero />
              <Services />
              <About />
              <Contact />
            </>
          } />

          {/* صفحات الدخول والتسجيل (محمية ضد المسجلين) */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />

          <Route path="/forgot-password" element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          } />

          {/* لوحة التحكم (محمية للأدمن فقط) */}
          <Route path="/dashboard" element={
            <AdminRoute>
              <Dashboard />
            </AdminRoute>
          } />

          {/* إعادة توجيه أي رابط خاطئ للرئيسية */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        <footer className="py-6 text-center text-gray-500 text-sm border-t bg-gray-50">
          جميع الحقوق محفوظة © 2026 Traxos Cargo
          <br />
          powered by <a href="https://www.facebook.com/share/1B7maCcavw/" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">Mellon Tech</a>
        </footer>
      </div>
    </Router>
  )
}

export default App;