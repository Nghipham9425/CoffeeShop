export type ContactMessageModel = {
  id: number;
  fullName: string;
  email: string | null;
  phone: string | null;
  subject: string | null;
  message: string;
  isRead: boolean;
  createdAt: Date;
};
