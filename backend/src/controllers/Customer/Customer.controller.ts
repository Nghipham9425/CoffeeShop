import type { Request, Response } from "express";
import { customerService } from "../../services/Customer/Customer.service.js";
import {
  createBusinessCustomerSchema,
  customerQuerySchema,
  updateBusinessCustomerSchema,
  updateRetailCustomerSchema,
} from "../../validators/Customer/Customer.validator.js";

export const customerController = {
  async getRetailCustomers(req: Request, res: Response) {
    const query = customerQuerySchema.parse(req.query);
    res.json(await customerService.getRetailCustomers(query));
  },

  async updateRetailCustomer(req: Request, res: Response) {
    const payload = updateRetailCustomerSchema.parse(req.body);
    res.json(await customerService.updateRetailCustomer(Number(req.params.id), payload));
  },

  async getBusinessCustomers(req: Request, res: Response) {
    const query = customerQuerySchema.parse(req.query);
    res.json(await customerService.getBusinessCustomers(query));
  },

  async createBusinessCustomer(req: Request, res: Response) {
    const payload = createBusinessCustomerSchema.parse(req.body);
    res.status(201).json(await customerService.createBusinessCustomer(payload));
  },

  async updateBusinessCustomer(req: Request, res: Response) {
    const payload = updateBusinessCustomerSchema.parse(req.body);
    res.json(await customerService.updateBusinessCustomer(Number(req.params.id), payload));
  },
};
