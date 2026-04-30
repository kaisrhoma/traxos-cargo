import express from 'express';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';
import { 
  createOrder, 
  getAllOrders, 
  updateOrderStatus, 
  trackOrder // استيراد الدالة الجديدة هنا
} from '../controllers/orderController.js';
import { sendContactEmail } from '../utils/sendEmail.js';

const router = express.Router();

// مسارات الأدمن
router.post('/create', verifyToken, isAdmin, createOrder);
router.get('/all', verifyToken, isAdmin, getAllOrders);
router.put('/update/:id', verifyToken, isAdmin, updateOrderStatus);

// مسار التتبع (يستخدم نفس دالة الـ controller)
router.get('/track/:trackingNumber', verifyToken, trackOrder);


// router.post('/contact', verifyToken, async (req, res) => {
//   const { name, message } = req.body;
//   try {
//     await sendContactEmail(name, message);
//     res.status(200).json({ message: "تم إرسال الرسالة بنجاح" });
//   } catch (error) {
//     res.status(500).json({ message: "فشل إرسال الرسالة" });
//   }
// });

router.post('/contact', verifyToken, async (req, res) => {
  const { name, message } = req.body;
  
  // فحص بسيط للبيانات قبل البدء
  if (!name || !message) {
    return res.status(400).json({ message: "الاسم والرسالة مطلوبان" });
  }

  try {
    console.log(`⏳ جاري محاولة إرسال بريد لـ: ${name}...`);
    await sendContactEmail(name, message);
    console.log("✅ تمت العملية بنجاح");
    res.status(200).json({ message: "تم إرسال الرسالة بنجاح" });
  } catch (error) {
    // طباعة تفاصيل الخطأ في Render Logs
    console.error("❌ تفاصيل فشل الإرسال:", {
      message: error.message,
      code: error.code,
      command: error.command
    });
    
    res.status(500).json({ 
      message: "فشل إرسال الرسالة",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

export default router;