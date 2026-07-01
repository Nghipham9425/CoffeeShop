import { contactMessageData } from "../../data/ContactMessage/ContactMessage.data.js";
import type { ContactMessageModel } from "../../models/ContactMessage/ContactMessage.model.js";
import type {
  ContactMessageQueryInput,
  CreateContactMessageInput,
  UpdateContactMessageReadStatusInput,
} from "../../validators/ContactMessage/ContactMessage.validator.js";

type ContactMessageRecord = Awaited<ReturnType<typeof contactMessageData.findMany>>[number];

function mapContactMessage(message: ContactMessageRecord): ContactMessageModel {
  return {
    id: message.id,
    fullName: message.fullName,
    email: message.email,
    phone: message.phone,
    subject: message.subject,
    message: message.message,
    isRead: message.isRead,
    createdAt: message.createdAt,
  };
}

export const contactMessageService = {
  async getContactMessages(query: ContactMessageQueryInput) {
    const messages = await contactMessageData.findMany(query);
    return messages.map(mapContactMessage);
  },

  async getContactMessageById(id: number) {
    const message = await contactMessageData.findById(id);
    return message ? mapContactMessage(message) : null;
  },

  async createContactMessage(input: CreateContactMessageInput) {
    const message = await contactMessageData.create(input);
    return mapContactMessage(message);
  },

  async updateReadStatus(id: number, input: UpdateContactMessageReadStatusInput) {
    const existingMessage = await contactMessageData.findById(id);

    if (!existingMessage) {
      throw new Error("CONTACT_MESSAGE_NOT_FOUND");
    }

    const message = await contactMessageData.updateReadStatus(id, input.isRead);
    return mapContactMessage(message);
  },

  async deleteContactMessage(id: number) {
    const existingMessage = await contactMessageData.findById(id);

    if (!existingMessage) {
      throw new Error("CONTACT_MESSAGE_NOT_FOUND");
    }

    await contactMessageData.delete(id);
  },
};
