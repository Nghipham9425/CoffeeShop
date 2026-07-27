import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../../config/env.js";
import { userData } from "../../data/Auth/User.data.js";
import type { LoginInput, RegisterInput } from "../../validators/Auth/Auth.validator.js";
import type { AddressInput, ChangePasswordInput, UpdateAddressInput, UpdateProfileInput } from "../../validators/Auth/Auth.validator.js";

function signToken(payload: { userId: number; role: string }) {
  const options: SignOptions = {
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, env.jwtSecret, options);
}

export const authService = {
  async register(input: RegisterInput) {
    const existingUser = await userData.findByEmail(input.email);

    if (existingUser) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await userData.create({
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      passwordHash,
    });
    const token = signToken({ userId: user.id, role: user.role });

    return { user, token };
  },

  async login(input: LoginInput) {
    const user = await userData.findByEmail(input.email);

    if (!user || !user.isActive) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const token = signToken({ userId: user.id, role: user.role });

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
      },
      token,
    };
  },

  async profile(userId: number) {
    const user = await userData.findProfileById(userId);
    if (!user) throw new Error("USER_NOT_FOUND");

    const { _count, ...profile } = user;
    return { ...profile, orderCount: _count.orders };
  },

  async updateProfile(userId: number, input: UpdateProfileInput) {
    return userData.updateProfile(userId, input);
  },

  async changePassword(userId: number, input: ChangePasswordInput) {
    const user = await userData.findPasswordById(userId);
    if (!user || !(await bcrypt.compare(input.currentPassword, user.passwordHash))) {
      throw new Error("INVALID_CURRENT_PASSWORD");
    }

    await userData.updatePassword(userId, await bcrypt.hash(input.newPassword, 10));
  },

  listAddresses(userId: number) {
    return userData.listAddresses(userId);
  },

  createAddress(userId: number, input: AddressInput) {
    return userData.createAddress(userId, input);
  },

  updateAddress(userId: number, addressId: number, input: UpdateAddressInput) {
    return userData.updateAddress(userId, addressId, input);
  },

  deleteAddress(userId: number, addressId: number) {
    return userData.deleteAddress(userId, addressId);
  },
};
