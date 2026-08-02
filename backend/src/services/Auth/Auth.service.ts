import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import jwt, { type SignOptions } from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { env } from "../../config/env.js";
import { userData } from "../../data/Auth/User.data.js";
import { mailService } from "../Mail/Mail.service.js";
import type { ForgotPasswordInput, GoogleLoginInput, LoginInput, RegisterInput, ResetPasswordInput } from "../../validators/Auth/Auth.validator.js";
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

  async loginWithGoogle(input: GoogleLoginInput) {
    if (!env.googleClientId) throw new Error("GOOGLE_AUTH_NOT_CONFIGURED");

    let payload;
    try {
      const client = new OAuth2Client(env.googleClientId);
      const ticket = await client.verifyIdToken({
        idToken: input.credential,
        audience: env.googleClientId,
      });
      payload = ticket.getPayload();
    } catch (error) {
      // Only log Google's verification reason; never log the ID token itself.
      console.error("[Google OAuth] ID token verification failed:", error instanceof Error ? error.message : error);
      throw new Error("INVALID_GOOGLE_CREDENTIAL");
    }

    if (!payload?.sub || !payload.email || !payload.email_verified) {
      throw new Error("INVALID_GOOGLE_CREDENTIAL");
    }

    const randomPasswordHash = await bcrypt.hash(randomBytes(32).toString("hex"), 10);
    const user = await userData.findOrCreateGoogleUser({
      providerUserId: payload.sub,
      email: payload.email,
      fullName: payload.name?.trim() || payload.email.split("@")[0],
      passwordHash: randomPasswordHash,
    });

    if (!user.isActive) throw new Error("ACCOUNT_DISABLED");

    return {
      user,
      token: signToken({ userId: user.id, role: user.role }),
    };
  },

  async forgotPassword(input: ForgotPasswordInput) {
    const user = await userData.findActiveByEmailInsensitive(input.email);
    if (!user) return;

    const token = randomBytes(32).toString("hex");
    const tokenHash = hashResetToken(token);
    const expiresAt = new Date(Date.now() + env.resetPasswordExpiresMinutes * 60_000);
    await userData.createPasswordResetToken(user.id, tokenHash, expiresAt);

    const resetUrl = new URL("/dat-lai-mat-khau", env.clientAppUrl);
    resetUrl.searchParams.set("token", token);

    try {
      await mailService.sendPasswordResetEmail({
        email: user.email,
        fullName: user.fullName,
        resetUrl: resetUrl.toString(),
      });
    } catch (error) {
      console.error("[Mail] Password reset email failed:", error instanceof Error ? error.message : error);
      throw new Error("MAIL_DELIVERY_FAILED");
    }
  },

  async resetPassword(input: ResetPasswordInput) {
    const tokenRecord = await userData.findPasswordResetToken(hashResetToken(input.token));
    if (!tokenRecord || tokenRecord.usedAt || tokenRecord.expiresAt <= new Date()) {
      throw new Error("INVALID_RESET_TOKEN");
    }

    const passwordHash = await bcrypt.hash(input.newPassword, 10);
    const consumed = await userData.consumePasswordResetToken(tokenRecord.id, tokenRecord.userId, passwordHash);
    if (!consumed) throw new Error("INVALID_RESET_TOKEN");
  },

  async profile(userId: number) {
    const user = await userData.findProfileById(userId);
    if (!user) throw new Error("USER_NOT_FOUND");

    const { _count, loyaltyProfile, ...profile } = user;
    return {
      ...profile,
      orderCount: _count.orders,
      loyaltyProfile: loyaltyProfile
        ? { ...loyaltyProfile, totalSpent: Number(loyaltyProfile.totalSpent) }
        : null,
    };
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

  async orderHistory(userId: number) {
    await userData.claimGuestOrders(userId);
    const orders = await userData.listOrderHistory(userId);
    return orders.map((order) => ({
      id: order.id,
      orderCode: order.orderCode,
      status: order.status,
      totalAmount: Number(order.totalAmount),
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        unit: item.product.unit,
        quantity: item.quantity,
        review: order.reviews.find((review) => review.productId === item.productId) ?? null,
      })),
      payment: order.payments[0]
        ? { method: order.payments[0].method, status: order.payments[0].status, paidAt: order.payments[0].paidAt }
        : null,
      shipment: order.shipment,
      returnRequest: order.returnRequests[0] ?? null,
    }));
  },
};

function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
