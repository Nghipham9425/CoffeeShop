import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { UserRole } from "@prisma/client";
import { env } from "../config/env.js";
import type { JwtUserPayload } from "../models/Auth/User.model.js";

declare module "express-serve-static-core" {
  interface Request {
    user?: JwtUserPayload;
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Ban can dang nhap de tiep tuc" });
    return;
  }

  try {
    const token = header.replace("Bearer ", "");
    req.user = jwt.verify(token, env.jwtSecret) as JwtUserPayload;
    next();
  } catch {
    res.status(401).json({ message: "Token khong hop le hoac da het han" });
  }
}

export function authorizeRoles(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: "Ban khong co quyen thuc hien thao tac nay" });
      return;
    }

    next();
  };
}

export function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next();
    return;
  }

  try {
    req.user = jwt.verify(header.replace("Bearer ", ""), env.jwtSecret) as JwtUserPayload;
    next();
  } catch {
    res.status(401).json({ message: "Token invalid or expired" });
  }
}
