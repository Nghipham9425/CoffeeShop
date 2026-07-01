import type { Request, Response } from "express";
import { contactMessageService } from "../../services/ContactMessage/ContactMessage.service.js";
import {
  contactMessageQuerySchema,
  createContactMessageSchema,
  updateContactMessageReadStatusSchema,
} from "../../validators/ContactMessage/ContactMessage.validator.js";

export const contactMessageController = {
  async getContactMessages(req: Request, res: Response) {
    const query = contactMessageQuerySchema.parse(req.query);
    const messages = await contactMessageService.getContactMessages(query);
    res.json(messages);
  },

  async getContactMessageById(req: Request, res: Response) {
    const message = await contactMessageService.getContactMessageById(Number(req.params.id));

    if (!message) {
      res.status(404).json({ message: "Không tìm thấy tin nhắn liên hệ" });
      return;
    }

    res.json(message);
  },

  async createContactMessage(req: Request, res: Response) {
    const payload = createContactMessageSchema.parse(req.body);
    const message = await contactMessageService.createContactMessage(payload);
    res.status(201).json(message);
  },

  async updateReadStatus(req: Request, res: Response) {
    const messageId = Number(req.params.id);
    const payload = updateContactMessageReadStatusSchema.parse(req.body);

    try {
      const message = await contactMessageService.updateReadStatus(messageId, payload);
      res.json(message);
    } catch (error) {
      if (error instanceof Error && error.message === "CONTACT_MESSAGE_NOT_FOUND") {
        res.status(404).json({ message: "Không tìm thấy tin nhắn liên hệ" });
        return;
      }

      throw error;
    }
  },

  async deleteContactMessage(req: Request, res: Response) {
    const messageId = Number(req.params.id);

    try {
      await contactMessageService.deleteContactMessage(messageId);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === "CONTACT_MESSAGE_NOT_FOUND") {
        res.status(404).json({ message: "Không tìm thấy tin nhắn liên hệ" });
        return;
      }

      throw error;
    }
  },
};
