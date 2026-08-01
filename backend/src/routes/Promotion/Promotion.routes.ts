import { Router } from 'express';
import { createProductPromotion, createOrderPromotion } from '../../controllers/Promotion/Promotion.controller.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { authMiddleware, authorizeRoles } from '../../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware, authorizeRoles('ADMIN'));

router.post('/product-price', asyncHandler(createProductPromotion));
router.post('/order-voucher', asyncHandler(createOrderPromotion));

export default router;