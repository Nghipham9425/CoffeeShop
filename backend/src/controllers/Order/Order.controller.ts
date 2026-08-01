import type { Request, Response } from "express";
import { orderService } from "../../services/Order/Order.service.js";
import {
  checkoutSchema,
  orderQuerySchema,
  updateOrderStatusSchema,
  updatePaymentStatusSchema,
  upsertShipmentSchema,
  cancelCustomerOrderSchema,
  createReturnRequestSchema,
  updateReturnRequestSchema,
} from "../../validators/Order/Order.validator.js";

export const orderController = {
  async checkout(req: Request, res: Response) {
    const payload = checkoutSchema.parse(req.body);

    try {
      const order = await orderService.checkout(payload, req.user?.userId);
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

  async cancelCustomerOrder(req: Request, res: Response) {
    const input = cancelCustomerOrderSchema.parse(req.body);
    try { res.json(await orderService.cancelCustomerOrder(Number(req.params.id), req.user!.userId, input.reason)); }
    catch (error) {
      if (error instanceof Error) {
        const messages: Record<string, string> = {
          ORDER_NOT_FOUND: "Không tìm thấy đơn hàng của bạn.",
          ORDER_NOT_CANCELLABLE: "Chỉ có thể tự hủy đơn đang chờ xác nhận.",
          PAID_ORDER_REQUIRES_REFUND_REQUEST: "Đơn đã thanh toán cần gửi yêu cầu hoàn tiền.",
        };
        if (messages[error.message]) { res.status(400).json({ message: messages[error.message] }); return; }
      }
      throw error;
    }
  },

  async createReturnRequest(req: Request, res: Response) {
    const input = createReturnRequestSchema.parse(req.body);
    try { res.status(201).json(await orderService.createReturnRequest(Number(req.params.id), req.user!.userId, input)); }
    catch (error) {
      if (error instanceof Error) {
        const messages: Record<string, string> = {
          ORDER_NOT_FOUND: "Không tìm thấy đơn hàng của bạn.",
          RETURN_REQUIRES_COMPLETED_ORDER: "Chỉ gửi yêu cầu đổi/trả cho đơn đã hoàn tất.",
          RETURN_REQUEST_ALREADY_EXISTS: "Đơn hàng đang có một yêu cầu được xử lý.",
        };
        if (messages[error.message]) { res.status(400).json({ message: messages[error.message] }); return; }
      }
      throw error;
    }
  },

  async getReturnRequests(_req: Request, res: Response) {
    res.json(await orderService.listReturnRequests());
  },

  async updateReturnRequest(req: Request, res: Response) {
    try { res.json(await orderService.updateReturnRequest(Number(req.params.id), updateReturnRequestSchema.parse(req.body))); }
    catch (error) {
      if (error instanceof Error && error.message === "RETURN_REQUEST_NOT_FOUND") { res.status(404).json({ message: "Không tìm thấy yêu cầu." }); return; }
      if (error instanceof Error && error.message === "INVALID_RETURN_STATUS_TRANSITION") { res.status(409).json({ message: "Không thể chuyển yêu cầu sang trạng thái này." }); return; }
      throw error;
    }
  },

  async getPublicPaymentStatus(req: Request, res: Response) {
    const orderCode = String(req.query.orderCode ?? "").trim();
    const result = await orderService.getPublicPaymentStatus(Number(req.params.id), orderCode);
    if (!result) {
      res.status(404).json({ message: "Không tìm thấy thông tin thanh toán của đơn hàng" });
      return;
    }

    res.json(result);
  },

  async trackOrder(req: Request, res: Response) {
    const trackingCode = String(req.query.trackingCode ?? "").trim();
    if (!trackingCode) {
      res.status(400).json({ message: "Vui lòng nhập mã vận đơn." });
      return;
    }
    const order = await orderService.trackOrder(trackingCode);
    if (!order) {
      res.status(404).json({ message: "Không tìm thấy vận đơn phù hợp." });
      return;
    }
    res.json(order);
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

      if (error instanceof Error && ["INVALID_ORDER_STATUS_TRANSITION", "PAYMENT_MUST_BE_CONFIRMED", "SHIPMENT_MUST_BE_SHIPPED", "SHIPMENT_MUST_BE_DELIVERED"].includes(error.message)) {
        const messages: Record<string, string> = {
          INVALID_ORDER_STATUS_TRANSITION: "Trạng thái đơn hàng không thể chuyển theo nghiệp vụ hiện tại.",
          PAYMENT_MUST_BE_CONFIRMED: "Cần xác nhận thanh toán trước khi duyệt đơn chuyển khoản/SePay.",
          SHIPMENT_MUST_BE_SHIPPED: "Cần bàn giao cho đơn vị vận chuyển trước khi chuyển đơn sang đang giao.",
          SHIPMENT_MUST_BE_DELIVERED: "Cần xác nhận giao hàng trước khi hoàn tất đơn.",
        };
        res.status(400).json({ message: messages[error.message] });
        return;
      }

      throw error;
    }
  },

  async updatePaymentStatus(req: Request, res: Response) {
    const payload = updatePaymentStatusSchema.parse(req.body);
    try {
      res.json(await orderService.updatePaymentStatus(Number(req.params.id), payload));
    } catch (error) {
      if (error instanceof Error && ["PAYMENT_NOT_FOUND", "SEPAY_PAYMENT_MANAGED_BY_WEBHOOK", "COD_CAN_ONLY_BE_PAID_AFTER_DELIVERY", "REFUND_REQUIRES_CANCELLED_ORDER"].includes(error.message)) {
        const messages: Record<string, string> = {
          PAYMENT_NOT_FOUND: "Không tìm thấy giao dịch thanh toán.",
          SEPAY_PAYMENT_MANAGED_BY_WEBHOOK: "Giao dịch SePay chỉ được xác nhận tự động qua webhook.",
          COD_CAN_ONLY_BE_PAID_AFTER_DELIVERY: "Chỉ đánh dấu COD đã thu sau khi đơn giao thành công.",
          REFUND_REQUIRES_CANCELLED_ORDER: "Chỉ hoàn tiền sau khi đơn hàng đã được hủy.",
        };
        res.status(400).json({ message: messages[error.message] });
        return;
      }
      throw error;
    }
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
