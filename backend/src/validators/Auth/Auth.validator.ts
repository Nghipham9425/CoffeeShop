import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự.").max(120, "Họ tên không được vượt quá 120 ký tự."),
  email: z.string().email("Email không đúng định dạng.").max(160, "Email không được vượt quá 160 ký tự."),
  phone: z.string().min(8, "Số điện thoại phải có ít nhất 8 ký tự.").max(20, "Số điện thoại không được vượt quá 20 ký tự.").optional(),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự.").max(80, "Mật khẩu không được vượt quá 80 ký tự."),
});

export const loginSchema = z.object({
  email: z.string().email("Email không đúng định dạng.").max(160, "Email không được vượt quá 160 ký tự."),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự.").max(80, "Mật khẩu không được vượt quá 80 ký tự."),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự.").max(120, "Họ tên không được vượt quá 120 ký tự.").optional(),
  phone: z.string().min(8, "Số điện thoại phải có ít nhất 8 ký tự.").max(20, "Số điện thoại không được vượt quá 20 ký tự.").nullable().optional(),
}).refine((value) => value.fullName !== undefined || value.phone !== undefined, {
  message: "Cần cập nhật ít nhất một trường thông tin",
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, "Mật khẩu hiện tại phải có ít nhất 6 ký tự.").max(80, "Mật khẩu hiện tại không được vượt quá 80 ký tự."),
  newPassword: z.string().min(8, "Mật khẩu mới phải có ít nhất 8 ký tự.").max(80),
  confirmPassword: z.string().min(8, "Xác nhận mật khẩu phải có ít nhất 8 ký tự.").max(80, "Xác nhận mật khẩu không được vượt quá 80 ký tự."),
}).refine((value) => value.currentPassword !== value.newPassword, { message: "Mật khẩu mới phải khác mật khẩu hiện tại.", path: ["newPassword"] })
  .refine((value) => value.newPassword === value.confirmPassword, { message: "Xác nhận mật khẩu chưa khớp.", path: ["confirmPassword"] });

export const addressSchema = z.object({
  receiverName: z.string().min(2, "Tên người nhận phải có ít nhất 2 ký tự.").max(120, "Tên người nhận không được vượt quá 120 ký tự."),
  phone: z.string().min(8, "Số điện thoại phải có ít nhất 8 ký tự.").max(20, "Số điện thoại không được vượt quá 20 ký tự."),
  province: z.string().min(2, "Vui lòng nhập tỉnh/thành phố.").max(120, "Tỉnh/thành phố không được vượt quá 120 ký tự."),
  district: z.string().min(2, "Vui lòng nhập quận/huyện.").max(120, "Quận/huyện không được vượt quá 120 ký tự."),
  ward: z.string().min(2, "Vui lòng nhập phường/xã.").max(120, "Phường/xã không được vượt quá 120 ký tự."),
  detail: z.string().min(4, "Địa chỉ chi tiết phải có ít nhất 4 ký tự.").max(255, "Địa chỉ chi tiết không được vượt quá 255 ký tự."),
  isDefault: z.boolean().optional(),
});

export const updateAddressSchema = addressSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: "Cần cập nhật ít nhất một trường địa chỉ",
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
