import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
}

const DEV_AUTH_PAYLOAD: AuthPayload = {
  userId: "dev-agent-user",
  email: "dev-agent@libra.local",
  role: "teacher",
};

function isDevAuthBypassEnabled() {
  return !process.env.NODE_ENV || process.env.NODE_ENV === "development";
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

/**
 * Middleware that requires a valid JWT in the Authorization header.
 * Attaches `req.user` with { userId, email, role }.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, config.jwtSecret) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token." });
    return;
  }
}

export function requireAuthOrDev(req: Request, res: Response, next: NextFunction) {
  const isDev = isDevAuthBypassEnabled();
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    if (isDev) {
      req.user = DEV_AUTH_PAYLOAD;
      next();
      return;
    }

    res.status(401).json({ error: "Authentication required." });
    return;
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, config.jwtSecret) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    if (isDev) {
      req.user = DEV_AUTH_PAYLOAD;
      next();
      return;
    }

    res.status(401).json({ error: "Invalid or expired token." });
    return;
  }
}
