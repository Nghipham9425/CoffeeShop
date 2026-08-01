import { Router } from 'express';
import { createProductPromotion, createOrderPromotion, getOrderPromotions, getPriceHistory, validateVoucher } from '../../controllers/Promotion/Promotion.controller.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { authMiddleware, authorizeRoles } from '../../middleware/authMiddleware.js';

const router = Router();

router.post('/validate', asyncHandler(validateVoucher));

router.use(authMiddleware, authorizeRoles('ADMIN'));

router.post('/product-price', asyncHandler(createProductPromotion));
router.get('/price-history', asyncHandler(getPriceHistory));
router.post('/order-voucher', asyncHandler(createOrderPromotion));
router.get('/order-vouchers', asyncHandler(getOrderPromotions));

export default router;
