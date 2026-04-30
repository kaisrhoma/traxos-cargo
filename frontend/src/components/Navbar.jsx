import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { NavHashLink } from 'react-router-hash-link';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [role, setRole] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedName = localStorage.getItem('userName');
    const savedRole = localStorage.getItem('userRole');
    
    if (token) {
      setIsLoggedIn(true);
      setUserName(savedName || 'عميلنا العزيز');
      setRole(savedRole);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    
    setIsLoggedIn(false);
    setRole('');
    setUserName('');

    navigate('/', { replace: true });

    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <nav className="bg-[#0a1d37] text-white py-4 px-8 sticky top-0 z-50 shadow-lg border-b border-white/10" dir="rtl">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button 
            className="md:hidden p-1" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
          <div className="text-2xl font-black">
            <Link to="/"><span className="text-[#ff6b00]">TRAXOS</span> CARGO</Link>
          </div>
        </div>

        {/* الروابط للشاشات الكبيرة */}
        <div className="hidden md:flex gap-8 font-medium items-center">
          {role === 'ADMIN' && (
            <Link to="/dashboard" className="text-[#ff6b00] font-bold border-b-2 border-[#ff6b00]">
              لوحة التحكم
            </Link>
          )}
          <NavHashLink smooth to="/#services" className="hover:text-[#ff6b00] transition">خدماتنا</NavHashLink>
          <NavHashLink smooth to="/#about" className="hover:text-[#ff6b00] transition">من نحن</NavHashLink>
          <NavHashLink smooth to="/#contact" className="hover:text-[#ff6b00] transition">اتصل بنا</NavHashLink>
        </div>

        <div className="flex gap-4 items-center">
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-[10px] text-gray-400 leading-none">
                  {role === 'ADMIN' ? 'مدير النظام' : 'مرحباً بك'}
                </span>
                <span className="text-sm font-bold text-[#ff6b00]">{userName}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-2 rounded-lg font-bold hover:bg-red-500 hover:text-white transition"
              >
                خروج
              </button>
            </div>
          ) : (
            <div className="flex gap-4 items-center">
              <Link to="/login" className="text-white hover:text-[#ff6b00] font-medium transition">
                تسجيل الدخول
              </Link>
              <Link to="/register" className="bg-[#ff6b00] hover:bg-orange-600 text-white px-5 py-2 rounded-lg font-bold transition">
                إنشاء حساب
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* روابط الجوال */}
      {isMenuOpen && (
        <div className="md:hidden flex flex-col gap-4 mt-4 pt-4 border-t border-white/10 font-medium">
          {role === 'ADMIN' && (
            <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="text-[#ff6b00] font-bold">لوحة التحكم</Link>
          )}
          <NavHashLink smooth to="/#services" onClick={() => setIsMenuOpen(false)} className="hover:text-[#ff6b00] transition">خدماتنا</NavHashLink>
          <NavHashLink smooth to="/#about" onClick={() => setIsMenuOpen(false)} className="hover:text-[#ff6b00] transition">من نحن</NavHashLink>
          <NavHashLink smooth to="/#contact" onClick={() => setIsMenuOpen(false)} className="hover:text-[#ff6b00] transition">اتصل بنا</NavHashLink>
          
          {isLoggedIn && (
             <div className="pt-2 border-t border-white/5 text-[#ff6b00] text-sm">
               متصل كـ: {userName}
             </div>
          )}
        </div>
      )}
    </nav>
  )
}