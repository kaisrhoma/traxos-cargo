import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import api from '../api/axios'; 
import Swal from 'sweetalert2';


export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [settings, setSettings] = useState({
  name: '', 
  newPassword: '',
  confirmPassword: ''
});

  const [alertConfig, setAlertConfig] = useState({ show: false, message: '', type: '', onConfirm: null });
  const showAlert = (message, type = 'error', onConfirm = null) => {
    setAlertConfig({ show: true, message, type, onConfirm });
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [services, setServices] = useState([]); // لجلب الخدمات المتاحة
  const [allUsers, setAllUsers] = useState([]); // لاختيار العميل
  const [newOrder, setNewOrder] = useState({
  userId: '',
  shippingType: 'شحن جوي', // القيمة الافتراضية
  trackingNumber: '',
  shippingCompany: '',
  trackingDetails: '',
  status: 'قيد المعالجة'
});
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updateText, setUpdateText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("الكل");
  const [filterType, setFilterType] = useState("الكل");
  const filteredOrders = orders.filter(order => {
  const matchesSearch = 
    order.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
  
  const matchesStatus = filterStatus === "الكل" || order.status === filterStatus;
  const matchesType = filterType === "الكل" || order.shippingType === filterType;

  return matchesSearch && matchesStatus && matchesType;
});

  // بيانات وهمية للرسم البياني (سيتم استبدالها ببيانات حقيقية لاحقاً)
  const chartData = [
    { name: 'السبت', orders: 4 },
    { name: 'الأحد', orders: 7 },
    { name: 'الأثنين', orders: 5 },
    { name: 'الثلاثاء', orders: 10 },
    { name: 'الأربعاء', orders: 8 },
  ];


 // 1. جلب الشحنات
const fetchOrders = async () => {
  setLoading(true);
  try {
    // الآن api سيعرف وحده أن عليه الذهاب للـ localStorage وإحضار التوكن
    const response = await api.get('/api/orders/all');
    
    // axios يضع النتيجة في data
    setOrders(response.data); 
  } catch (error) {
    console.error("خطأ في جلب الشحنات:", error);
    // إذا كان الخطأ 401 (توكن غير صالح)، يمكنك توجيهه للـ login هنا
  } finally {
    setLoading(false);
  }
};

// 2. جلب المستخدمين
const fetchUsers = async () => {
  try {
    // api سيقوم بإضافة التوكن من الـ localStorage تلقائياً
    const response = await api.get('/api/users/all');
    
    // البيانات جاهزة في response.data
    setAllUsers(response.data);
    setUsers(response.data); 
  } catch (error) {
    console.error("خطأ في جلب المستخدمين:", error);
  }
};

 // 3. جلب الخدمات
const fetchServices = async () => {
  try {
    const response = await api.get('/api/services/all');
    
    setServices(response.data);
  } catch (error) {
    console.error("خطأ في جلب الخدمات:", error);
  }
};

useEffect(() => {
  const loadData = async () => {
    setLoading(true);
    try {
      // تنفيذ الطلبات بالتوازي لسرعة الأداء
      // أضفنا دالة fetchAdminProfile لجلب بيانات المسؤول الحالي
      await Promise.all([
        fetchOrders(),
        fetchUsers(),
        fetchServices(),
        fetchAdminProfile() 
      ]);
    } catch (error) {
      console.error("حدث خطأ أثناء تحميل البيانات:", error);
    } finally {
      setLoading(false);
    }
  };
  loadData();
}, []);

// دالة إضافية لجلب بيانات الملف الشخصي للأدمن
const fetchAdminProfile = async () => {
  try {
    // نفترض وجود مسار في السيرفر يرجع بيانات المستخدم الحالي بناءً على التوكن
    const response = await api.get('/api/users/me'); 
    if (response.data) {
      setSettings(prev => ({
        ...prev,
        name: response.data.name // تعبئة الاسم تلقائياً في صفحة الإعدادات
      }));
    }
  } catch (error) {
    console.error("خطأ في جلب بيانات الملف الشخصي:", error);
  }
};


// --- الدوال المعدلة باستخدام showAlert ونظام التنبيه الخاص بك ---

  const handleDeleteUser = async (id) => {
    showAlert("هل أنت متأكد من حذف هذا المستخدم؟", "warning", async () => {
      try {
        await api.delete(`/api/users/delete/${id}`);
        fetchUsers();
        showAlert("تم حذف المستخدم بنجاح", "success");
      } catch (error) {
        showAlert("فشل إجراء عملية الحذف", "error");
      }
    });
  };

  const handleUpdateRole = async (id, newRole) => {
    try {
      await api.post('/api/users/update-role', { id, role: newRole });
      fetchUsers();
      showAlert("تم تحديث رتبة المستخدم بنجاح", "success");
    } catch (error) {
      showAlert("حدث خطأ أثناء تحديث الرتبة", "error");
    }
  };

  const handleAddOrder = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/orders/create', newOrder);
      if (response.status === 200 || response.status === 201) {
        setIsModalOpen(false);
        fetchOrders();
        showAlert("تمت إضافة الشحنة بنجاح", "success");
      }
    } catch (error) {
      showAlert("حدث خلل أثناء إضافة الشحنة", "error");
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/api/orders/update/${orderId}`, { status: newStatus });
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      showAlert("تم تغيير حالة الشحنة بنجاح", "success");
    } catch (error) {
      showAlert("حدث خطأ أثناء تحديث الحالة", "error");
    }
  };

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    const now = new Date();
    const timestamp = now.toLocaleDateString('ar-LY') + " " + now.toLocaleTimeString('ar-LY', {hour: '2-digit', minute:'2-digit'});
    const newEntry = `📍 ${updateText} (${timestamp})`;
    const finalDetail = selectedOrder.trackingDetails ? `${newEntry}\n${selectedOrder.trackingDetails}` : newEntry;

    try {
      await api.put(`/api/orders/update/${selectedOrder.id}`, { 
        status: selectedOrder.status, 
        trackingDetails: finalDetail 
      });
      setIsUpdateModalOpen(false);
      setUpdateText("");
      fetchOrders();
      showAlert("تمت إضافة تفاصيل التتبع بنجاح", "success");
    } catch (error) {
      showAlert("حدث خطأ أثناء تحديث التفاصيل", "error");
    }
  };

  const handleUpdateSettings = async (e) => {
  e.preventDefault();

  // 1. التحقق من تطابق كلمة المرور
  if (settings.newPassword) {
    if (settings.newPassword !== settings.confirmPassword) {
      showAlert("كلمات المرور غير متطابقة", "error");
      return;
    }
  }

  showAlert("هل أنت متأكد من حفظ التعديلات الجديدة؟", "warning", async () => {
    try {
      const dataToSend = { name: settings.name };
      // إذا أدخل كلمة مرور جديدة، نضيفها للطلب
      if (settings.newPassword) dataToSend.password = settings.newPassword;

      const response = await api.put('/api/users/update-profile', dataToSend);
      
      // --- إضافة مهمة: تحديث بيانات المستخدم في المتصفح ---
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, name: settings.name };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      // -----------------------------------------------

      showAlert("تم تحديث الملف الشخصي بنجاح", "success");
      
      // تنظيف حقول كلمة المرور فقط بعد النجاح
      setSettings(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
      
    } catch (error) {
      console.error(error);
      showAlert(error.response?.data?.message || "حدث خطأ أثناء التحديث", "error");
    }
  });
};



// --- حساب الإحصائيات الحقيقية ---
// 1. شحنات اليوم (فلترة الشحنات التي تاريخ إنشائها هو اليوم)
const today = new Date().toLocaleDateString('en-CA'); // صيغة YYYY-MM-DD
const ordersToday = orders.filter(order => 
  new Date(order.createdAt).toLocaleDateString('en-CA') === today
).length;

// 2. عدد المستخدمين الكلي
const totalUsers = users.length;

// 3. الشحنات النشطة (كل شيء عدا "جاهز للتسليم")
const activeOrders = orders.filter(o => o.status !== 'جاهز للتسليم').length;

// 4. تجهيز بيانات الرسم البياني لآخر 5 أيام
const getLast5DaysData = () => {
  const days = ['الأحد', 'الأثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const result = [];
  
  for (let i = 4; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayName = days[d.getDay()];
    const dateStr = d.toLocaleDateString('en-CA');
    
    const count = orders.filter(order => 
      new Date(order.createdAt).toLocaleDateString('en-CA') === dateStr
    ).length;
    
    result.push({ name: dayName, orders: count });
  }
  return result;
};

const dynamicChartData = getLast5DaysData();

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-73px)] bg-gray-100" dir="rtl">
      
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-[#0a1d37] text-white p-6 shadow-xl">
        <h2 className="text-[#ff6b00] font-black text-xl mb-8 border-b border-white/10 pb-4">تراكسوس برو</h2>
        <nav className="flex flex-col gap-2">
          <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-3 p-3 rounded-lg transition ${activeTab === 'overview' ? 'bg-[#ff6b00]' : 'hover:bg-white/5'}`}><span>📊</span> الإحصائيات</button>
          <button onClick={() => setActiveTab('orders')} className={`flex items-center gap-3 p-3 rounded-lg transition ${activeTab === 'orders' ? 'bg-[#ff6b00]' : 'hover:bg-white/5'}`}><span>📦</span> إدارة الشحنات</button>
          <button onClick={() => setActiveTab('users')} className={`flex items-center gap-3 p-3 rounded-lg transition ${activeTab === 'users' ? 'bg-[#ff6b00]' : 'hover:bg-white/5'}`}><span>👥</span> إدارة المستخدمين</button>
          <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-3 p-3 rounded-lg transition ${activeTab === 'settings' ? 'bg-[#ff6b00]' : 'hover:bg-white/5'}`}><span>⚙️</span> الإعدادات</button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-sm p-6 min-h-full">
          
          {/* 1. قسم الإحصائيات مع الرسم البياني الحقيقي */}
{activeTab === 'overview' && (
  <div className="space-y-8">
    <h1 className="text-2xl font-bold text-[#0a1d37]">تحليلات النظام</h1>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* شحنات اليوم */}
      <div className="bg-orange-50 p-6 rounded-xl border border-orange-100 shadow-sm">
        <p className="text-gray-500 text-sm font-bold">شحنات اليوم</p>
        <p className="text-3xl font-black text-[#ff6b00]">+{ordersToday}</p>
      </div>

      {/* إجمالي المستخدمين */}
      <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 shadow-sm">
        <p className="text-gray-500 text-sm font-bold">المستخدمين المسجلين</p>
        <p className="text-3xl font-black text-[#0a1d37]">{totalUsers}</p>
      </div>

      {/* شحنات قيد العمل */}
      <div className="bg-green-50 p-6 rounded-xl border border-green-100 shadow-sm">
        <p className="text-gray-500 text-sm font-bold">شحنات قيد المعالجة</p>
        <p className="text-3xl font-black text-green-600">{activeOrders}</p>
      </div>
    </div>

    {/* إطار الرسم البياني - نسخة واحدة فقط ومنظمة */}
    <div className="h-96 w-full bg-white p-4 md:p-6 rounded-xl border shadow-sm overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <p className="font-bold text-gray-700 text-sm border-r-4 border-[#ff6b00] pr-3">
          حجم الطلبات لآخر 5 أيام
        </p>
      </div>
      
      <div className="h-[calc(100%-60px)] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={dynamicChartData}
            margin={{ top: 10, right: 10, left: -25, bottom: 0 }} 
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#666', fontSize: 11}}
              interval={0}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#666', fontSize: 11}}
              allowDecimals={false}
            />
            <Tooltip 
              cursor={{fill: '#f0f0f0', opacity: 0.5}}
              contentStyle={{
                borderRadius: '8px', 
                border: 'none', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                direction: 'rtl',
                textAlign: 'right'
              }}
              wrapperStyle={{ zIndex: 1000 }}
            />
            <Bar 
              dataKey="orders" 
              fill="#ff6b00" 
              radius={[4, 4, 0, 0]} 
              barSize={window.innerWidth < 768 ? 25 : 40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
)}

          {/* 2. إدارة الشحنات (إضافة وتحديث) */}
          {activeTab === 'orders' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-[#0a1d37]">إدارة الشحنات</h1>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-[#ff6b00] text-white px-4 py-2 rounded-lg font-bold hover:shadow-lg transition"
                >
                  + إضافة شحنة جديدة
                </button>
              </div>
              <div className="w-full overflow-x-auto shadow-sm rounded-lg border border-gray-200">
                <div className="bg-white p-4 rounded-t-lg border-b flex flex-wrap gap-4 items-center justify-between">
          {/* محرك البحث */}
          <div className="relative flex-1 min-w-[250px]">
            <span className="absolute inset-y-0 right-3 flex items-center text-gray-400">🔍</span>
            <input 
              type="text"
              placeholder="ابحث برقم التتبع أو اسم العميل..."
              className="w-full pr-10 pl-4 py-2 border rounded-lg outline-none focus:border-[#ff6b00] text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* فلاتر التصفية */}
          <div className="flex gap-2 flex-wrap">
            <select 
              className="p-2 border rounded-lg text-xs outline-none focus:border-[#ff6b00]"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="الكل">جميع أنواع الشحن</option>
              <option value="شحن جوي">✈️ شحن جوي</option>
              <option value="شحن بحري">🚢 شحن بحري</option>
            </select>

            <select 
              className="p-2 border rounded-lg text-xs outline-none focus:border-[#ff6b00]"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="الكل">جميع الحالات</option>
              <option value="قيد المعالجة">قيد المعالجة</option>
              <option value="وصل للمخازن">وصل للمخازن</option>
              <option value="في الطريق">في الطريق</option>
              <option value="جاهز للتسليم">جاهز للتسليم</option>
            </select>
          </div>
        </div>
                <table className="w-full text-right border-collapse min-w-[700px]"> {/* min-w تضمن عدم تداخل الأعمدة في الهاتف */}
                  <thead>
                    <tr className="bg-gray-100 border-b">
                      <th className="p-4 text-center text-[#0a1d37] font-bold">رقم التتبع</th>
                      <th className="p-4 text-center text-[#0a1d37] font-bold">العميل</th>
                      <th className="p-4 text-center text-[#0a1d37] font-bold">نوع الشحن</th>
                      <th className="p-4 text-center text-[#0a1d37] font-bold">الحالة</th>
                      <th className="p-4 text-center text-[#0a1d37] font-bold">آخر التحديثات</th>
                      <th className="p-4 text-center text-[#0a1d37] font-bold">إجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-gray-50 transition text-sm text-center">
                        <td className="p-4 font-mono font-bold text-[#ff6b00]">{order.trackingNumber}</td>
                        <td className="p-4 font-semibold text-[#0a1d37]">{order.user?.name || 'عميل عام'}</td>
                        <td className="p-4 text-gray-600 whitespace-nowrap">
                          {order.shippingType === 'شحن جوي' ? '✈️ جوي' : '🚢 بحري'}
                        </td>
                        <td className="p-4">
                          <select 
                            value={order.status}
                            onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                            className={`p-1.5 rounded-lg text-[11px] font-bold cursor-pointer outline-none border mx-auto block ${
                              order.status === 'جاهز للتسليم' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-orange-50 border-orange-200 text-[#ff6b00]'
                            }`}
                          >
                            <option value="قيد المعالجة">قيد المعالجة</option>
                            <option value="وصل للمخازن">وصل للمخازن</option>
                            <option value="في الطريق">في الطريق</option>
                            <option value="جاهز للتسليم">جاهز للتسليم</option>
                          </select>
                        </td>
                        <td className="p-4 max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap text-gray-500 text-xs italic">
                          {order.trackingDetails?.split('\n')[0] || 'لا توجد تفاصيل'} {/* نعرض آخر سطر فقط في الجدول */}
                        </td>
                        <td className="p-4">
                          <button 
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsUpdateModalOpen(true);
                            }}
                            className="bg-[#0a1d37] text-white px-4 py-1.5 rounded shadow-sm hover:bg-[#ff6b00] transition flex items-center gap-2 mx-auto"
                          >
                            <span className="hidden md:inline text-xs">تحديث</span> 📝
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="6" className="text-center py-10 text-gray-400">
                          {searchTerm || filterStatus !== "الكل" || filterType !== "الكل" 
                            ? "لا توجد نتائج تطابق بحثك" 
                            : "لا توجد شحنات مسجلة حالياً"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
          )}
          {/* نافذة إضافة شحنة جديدة */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
              <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
                <div className="bg-[#0a1d37] p-4 text-white flex justify-between items-center">
                  <h3 className="font-bold">إضافة شحنة جديدة إلى Traxos</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-2xl">&times;</button>
                </div>
                
                <form onSubmit={handleAddOrder} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* اختيار العميل */}
                  <div className="flex flex-col">
                    <label className="text-sm mb-1 font-bold">العميل (User)</label>
                    <select 
                      required
                      className="border p-2 rounded-lg outline-none focus:border-[#ff6b00]"
                      onChange={(e) => setNewOrder({...newOrder, userId: e.target.value})}
                    >
                      <option value="">اختر العميل...</option>
                      {allUsers.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                    </select>
                  </div>

                  {/* اختيار الخدمة */}
                  <div className="flex flex-col">
                    <label className="text-sm mb-1 font-bold">نوع الشحن</label>
                    <select 
                      required
                      className="border p-2 rounded-lg outline-none focus:border-[#ff6b00]"
                      value={newOrder.shippingType}
                      onChange={(e) => setNewOrder({...newOrder, shippingType: e.target.value})}
                    >
                      <option value="شحن جوي">✈️ شحن جوي</option>
                      <option value="شحن بحري">🚢 شحن بحري</option>
                    </select>
                  </div>

                  {/* رقم التتبع */}
                  <div className="flex flex-col">
                    <label className="text-sm mb-1 font-bold">رقم التتبع (Tracking Number)</label>
                    <input 
                      type="text" 
                      placeholder="مثال: TRX-12345"
                      className="border p-2 rounded-lg outline-none focus:border-[#ff6b00]"
                      onChange={(e) => setNewOrder({...newOrder, trackingNumber: e.target.value})}
                    />
                  </div>

                  {/* شركة الشحن */}
                  <div className="flex flex-col">
                    <label className="text-sm mb-1 font-bold">شركة الشحن</label>
                    <input 
                      type="text" 
                      placeholder="مثال: الخطوط التركية / شركة الشحن البحري"
                      className="border p-2 rounded-lg outline-none focus:border-[#ff6b00]"
                      onChange={(e) => setNewOrder({...newOrder, shippingCompany: e.target.value})}
                    />
                  </div>

                  {/* تفاصيل التتبع - تأخذ عرض السطر بالكامل */}
                  <div className="flex flex-col md:col-span-2">
                    <label className="text-sm mb-1 font-bold">تفاصيل التتبع (الموقع الحالي للبضاعة)</label>
                    <textarea 
                      placeholder="مثال: البضاعة حالياً في مخازن إسطنبول، جاري التجهيز للشحن الجوي."
                      className="border p-2 rounded-lg outline-none focus:border-[#ff6b00] h-24"
                      onChange={(e) => setNewOrder({...newOrder, trackingDetails: e.target.value})}
                    ></textarea>
                  </div>

                  <div className="md:col-span-2 flex gap-2 mt-4">
                    <button type="submit" className="flex-1 bg-[#ff6b00] text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition">
                      حفظ الشحنة في النظام
                    </button>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 py-3 rounded-lg font-bold hover:bg-gray-200 transition">
                      إلغاء
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* 3. إدارة المستخدمين - النسخة المحدثة */}
          {activeTab === 'users' && (
            <div>
              <h1 className="text-2xl font-bold text-[#0a1d37] mb-6">قائمة المستخدمين المسجلين</h1>
              <div className="grid gap-4">
                {/* التأكد من وجود مستخدمين قبل عمل الـ Map */}
                {users.length > 0 ? (
                  users.map((user) => (
                    <div key={user.id} className="flex justify-between items-center p-4 border rounded-xl hover:bg-gray-50 transition shadow-sm bg-white">
                      <div>
                        <p className="font-bold text-gray-800">{user.name || 'مستخدم بدون اسم'}</p>
                        <p className="text-xs text-gray-500">
                          {user.email} | <span className={`font-bold ${user.role === 'ADMIN' ? 'text-red-500' : 'text-blue-500'}`}>{user.role}</span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                      {/* زر التبديل بين أدمن ومستخدم عادي */}
                      {user.role === 'ADMIN' ? (
                        <button 
                          onClick={() => handleUpdateRole(user.id, 'USER')}
                          className="bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700 transition"
                        >
                          تنزيل لمستخدم عادي
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleUpdateRole(user.id, 'ADMIN')}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition"
                        >
                          ترقية لأدمن
                        </button>
                      )}

                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="bg-red-50 text-red-600 px-3 py-1 rounded text-xs border border-red-100 hover:bg-red-600 hover:text-white transition"
                      >
                        حذف
                      </button>
                    </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-gray-400">
                    <p>لا يوجد مستخدمين حالياً أو جاري التحميل...</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
          <div className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h1 className="text-2xl font-bold text-[#0a1d37] mb-6 border-b pb-4">إعدادات الحساب</h1>
              
              <form onSubmit={handleUpdateSettings} className="space-y-6">
                {/* حقل الاسم */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">الاسم بالكامل</label>
                  <input 
                    type="text" 
                    value={settings.name}
                    onChange={(e) => setSettings({...settings, name: e.target.value})}
                    placeholder="أدخل الاسم الجديد هنا" 
                    className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#ff6b00] outline-none transition" 
                  />
                </div>

                {/* قسم تغيير كلمة المرور */}
                <div className="space-y-4 pt-4 border-t border-gray-50">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">كلمة المرور الجديدة</label>
                    <input 
                      type="password" 
                      value={settings.newPassword}
                      onChange={(e) => setSettings({...settings, newPassword: e.target.value})}
                      placeholder="اتركه فارغاً للحفاظ على القديمة" 
                      className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#ff6b00] outline-none transition" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">تأكيد كلمة المرور</label>
                    <input 
                      type="password" 
                      value={settings.confirmPassword}
                      onChange={(e) => setSettings({...settings, confirmPassword: e.target.value})}
                      placeholder="أعد كتابة كلمة المرور" 
                      className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#ff6b00] outline-none transition" 
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#0a1d37] text-white py-4 rounded-xl font-bold hover:bg-[#ff6b00] transition duration-300 shadow-lg mt-2"
                >
                  حفظ التغييرات
                </button>
              </form>
            </div>
          </div>
        )}

        </div>
      </div>
      {/* نافذة تحديث تفاصيل التتبع */}
{isUpdateModalOpen && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[110] p-4 backdrop-blur-sm">
    <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
      <div className="bg-[#0a1d37] p-4 text-white rounded-t-xl flex justify-between items-center">
        <h3 className="font-bold">تحديث مسار الشحنة: {selectedOrder?.trackingNumber}</h3>
        <button onClick={() => setIsUpdateModalOpen(false)} className="text-xl">&times;</button>
      </div>
      <form onSubmit={handleUpdateDetails} className="p-6">
        <label className="block text-sm font-bold mb-2">الموقع الحالي أو حالة الطرد:</label>
        <textarea 
          required
          className="w-full border p-3 rounded-lg outline-none focus:border-[#ff6b00] h-32 text-right"
          placeholder="مثال: البضاعة غادرت ميناء اسطنبول باتجاه الخمس"
          value={updateText}
          onChange={(e) => setUpdateText(e.target.value)}
        ></textarea>
        <p className="text-[10px] text-gray-400 mt-2 italic">* سيتم إضافة التاريخ والوقت تلقائياً عند الحفظ</p>
        <div className="flex gap-2 mt-6">
          <button type="submit" className="flex-1 bg-[#ff6b00] text-white py-2 rounded-lg font-bold hover:bg-orange-600 transition">
            حفظ التحديث
          </button>
          <button type="button" onClick={() => setIsUpdateModalOpen(false)} className="flex-1 bg-gray-100 py-2 rounded-lg font-bold">
            إلغاء
          </button>
        </div>
      </form>
    </div>
  </div>
)}

{/* نافذة التنبيهات المنبثقة بتصميم Hero الموحد */}
      {alertConfig.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-8 text-center shadow-2xl border-t-4 border-[#ff6b00] animate-in fade-in zoom-in duration-200">
            <div className="text-4xl mb-4">
              {alertConfig.type === 'success' ? '✅' : alertConfig.type === 'warning' ? '⚠️' : '❌'}
            </div>
            <h3 className="text-xl font-bold text-[#0a1d37] mb-6">{alertConfig.message}</h3>
            
            <div className="flex flex-col gap-2">
              {alertConfig.onConfirm ? (
                <>
                  <button 
                    onClick={() => {
                      alertConfig.onConfirm();
                      setAlertConfig({ ...alertConfig, show: false });
                    }}
                    className="bg-[#ff6b00] text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition shadow-lg"
                  >
                    تأكيد العملية
                  </button>
                  <button 
                    onClick={() => setAlertConfig({ ...alertConfig, show: false, onConfirm: null })}
                    className="bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition"
                  >
                    إلغاء
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setAlertConfig({ ...alertConfig, show: false })}
                  className="bg-[#0a1d37] text-white py-3 rounded-xl font-bold hover:bg-[#ff6b00] transition shadow-lg"
                >
                  حسناً
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}