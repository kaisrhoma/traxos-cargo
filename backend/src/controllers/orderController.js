import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// 1. إنشاء طلب جديد (تعديل ليدعم نوع الشحن والبيانات الإضافية)
export const createOrder = async (req, res) => {
  try {
    const { userId, shippingType, shippingCompany, trackingNumber, trackingDetails, status } = req.body;
    
    const newOrder = await prisma.order.create({
      data: {
        userId: userId || req.user.userId,
        shippingType, // (شحن جوي أو شحن بحري)
        shippingCompany,
        trackingNumber: trackingNumber || `TRX-${Math.floor(100000 + Math.random() * 900000)}`,
        trackingDetails,
        status: status || 'قيد المعالجة'
      }
    });

    res.status(201).json(newOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "خطأ في إنشاء الطلب" });
  }
};

// 2. جلب جميع الطلبات (تعديل الـ include لضمان جلب اسم العميل)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { 
        user: { select: { name: true } } // نجلب فقط اسم المستخدم
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "خطأ في جلب البيانات" });
  }
};

// 3. تحديث حالة الطلب وتفاصيل التتبع (للأدمن)
export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status, trackingDetails } = req.body;
  
  try {
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { 
        status, 
        trackingDetails 
      }
    });
    res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ message: "خطأ في تحديث بيانات الشحنة" });
  }
};

// البحث عن شحنة برقم التتبع
export const trackOrder = async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    const order = await prisma.order.findUnique({
      where: { trackingNumber: trackingNumber }
    });

    if (!order) {
      return res.status(404).json({ message: "رقم التتبع غير موجود" });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "خطأ في السيرفر أثناء البحث" });
  }
};