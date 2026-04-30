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


router.post('/contact', verifyToken, async (req, res) => {
  const { name, message } = req.body;
  try {
    await sendContactEmail(name, message);
    res.status(200).json({ message: "تم إرسال الرسالة بنجاح" });
  } catch (error) {
    res.status(500).json({ message: "فشل إرسال الرسالة" });
  }
});

export default router;