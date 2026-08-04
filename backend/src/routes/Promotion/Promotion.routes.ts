import { Router } from 'express';
import { approveOrderPromotion, createOrderPromotion, deleteUnusedOrderPromotion, getOrderPromotions, updateOrderPromotionStatus, validateVoucher } from '../../controllers/Promotion/Promotion.controller.js';
import { UserRole } from '@prisma/client';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { authMiddleware, authorizeRoles } from '../../middleware/authMiddleware.js';

const router = Router();

router.post('/validate', asyncHandler(validateVoucher));

router.use(authMiddleware);

router.get('/order-vouchers', authorizeRoles(UserRole.ADMIN, UserRole.SALES), asyncHandler(getOrderPromotions));
router.post('/order-voucher', authorizeRoles(UserRole.ADMIN, UserRole.SALES), asyncHandler(createOrderPromotion));
router.patch('/order-vouchers/:id/approve', authorizeRoles(UserRole.ADMIN), asyncHandler(approveOrderPromotion));
router.patch('/order-vouchers/:id/status', authorizeRoles(UserRole.ADMIN), asyncHandler(updateOrderPromotionStatus));
router.delete('/order-vouchers/:id', authorizeRoles(UserRole.ADMIN), asyncHandler(deleteUnusedOrderPromotion));

export default router;
