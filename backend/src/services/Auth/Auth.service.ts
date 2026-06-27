import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../../config/env.js";
import { userData } from "../../data/Auth/User.data.js";
import type { LoginInput, RegisterInput } from "../../validators/Auth/Auth.validator.js";

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
        role: user.role,
        isActive: user.isActive,
      },
      token,
    };
  },
};
