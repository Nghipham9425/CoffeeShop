import { Router } from 'express';
import { createOrderPromotion, deleteUnusedOrderPromotion, getOrderPromotions, updateOrderPromotionStatus, validateVoucher } from '../../controllers/Promotion/Promotion.controller.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { authMiddleware, authorizeRoles } from '../../middleware/authMiddleware.js';

const router = Router();

router.post('/validate', asyncHandler(validateVoucher));

router.use(authMiddleware, authorizeRoles('ADMIN'));

router.post('/order-voucher', asyncHandler(createOrderPromotion));
router.get('/order-vouchers', asyncHandler(getOrderPromotions));
router.patch('/order-vouchers/:id/status', asyncHandler(updateOrderPromotionStatus));
router.delete('/order-vouchers/:id', asyncHandler(deleteUnusedOrderPromotion));

export default router;
