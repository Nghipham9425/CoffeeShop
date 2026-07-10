import type { Request, Response } from "express";
import { orderService } from "../../services/Order/Order.service.js";
import {
  checkoutSchema,
  orderQuerySchema,
  updateOrderStatusSchema,
  updatePaymentStatusSchema,
  upsertShipmentSchema,
} from "../../validators/Order/Order.validator.js";

export const orderController = {
  async checkout(req: Request, res: Response) {
    const payload = checkoutSchema.parse(req.body);

    try {
      const order = await orderService.checkout(payload);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
        return;
      }

      throw error;
    }
  },

  async getOrders(req: Request, res: Response) {
    const query = orderQuerySchema.parse(req.query);
    res.json(await orderService.getOrders(query));
  },

  async getOrderById(req: Request, res: Response) {
    const order = await orderService.getOrderById(Number(req.params.id));
    if (!order) {
      res.status(404).json({ message: "Không tìm thấy đơn hàng" });
      return;
    }

    res.json(order);
  },

  async updateOrderStatus(req: Request, res: Response) {
    const payload = updateOrderStatusSchema.parse(req.body);

    try {
      res.json(await orderService.updateOrderStatus(Number(req.params.id), payload));
    } catch (error) {
      if (error instanceof Error && error.message === "ORDER_NOT_FOUND") {
        res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        return;
      }

      throw error;
    }
  },

  async updatePaymentStatus(req: Request, res: Response) {
    const payload = updatePaymentStatusSchema.parse(req.body);
    res.json(await orderService.updatePaymentStatus(Number(req.params.id), payload));
  },

  async upsertShipment(req: Request, res: Response) {
    const payload = upsertShipmentSchema.parse(req.body);

    try {
      res.json(await orderService.upsertShipment(Number(req.params.id), payload));
    } catch (error) {
      if (error instanceof Error && error.message === "ORDER_NOT_FOUND") {
        res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        return;
      }

      throw error;
    }
  },
};
