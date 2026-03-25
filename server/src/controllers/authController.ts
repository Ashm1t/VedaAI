import type { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/User.js";
import { config } from "../config/index.js";

const googleClient = new OAuth2Client(config.googleClientId);

/**
 * POST /api/auth/google
 * Body: { credential: string } — the Google ID token from the frontend
 *
 * Flow:
 * 1. Verify Google token
 * 2. Check if user email is approved
 * 3. Create/update user record
 * 4. Issue JWT
 */
export async function googleLogin(req: Request, res: Response) {
  const { credential } = req.body;

  if (!credential) {
    res.status(400).json({ error: "Google credential is required." });
    return;
  }

  try {
    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: config.googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      res.status(400).json({ error: "Invalid Google token." });
      return;
    }

    const { email, name, picture, sub: googleId } = payload;

    // Check if user exists and is approved
    let user = await UserModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Auto-approve admin emails from env
      const adminEmails = config.adminEmails;
      const isAdmin = adminEmails.includes(email.toLowerCase());

      if (!isAdmin) {
        res.status(403).json({
          error: "Your account is not approved. Contact the administrator.",
        });
        return;
      }

      // Create admin user
      user = await UserModel.create({
        email: email.toLowerCase(),
        name: name || "",
        avatar: picture || "",
        googleId,
        role: "admin",
        approved: true,
        lastLoginAt: new Date(),
      });
    } else if (!user.approved) {
      res.status(403).json({
        error: "Your account is not approved yet. Please wait for admin approval.",
      });
      return;
    } else {
      // Update existing user info on each login
      user.name = name || user.name;
      user.avatar = picture || user.avatar;
      user.googleId = googleId || user.googleId;
      user.lastLoginAt = new Date();
      await user.save();
    }

    // Issue JWT
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      config.jwtSecret,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(500).json({ error: "Authentication failed." });
  }
}

/**
 * GET /api/auth/me
 * Returns the current user's profile (requires auth).
 */
export async function getMe(req: Request, res: Response) {
  const user = await UserModel.findById(req.user!.userId);
  if (!user) {
    res.status(404).json({ error: "User not found." });
    return;
  }
  res.json({ user: user.toJSON() });
}

/**
 * POST /api/auth/approve
 * Body: { email: string }
 * Admin-only: approves an email for login.
 */
export async function approveUser(req: Request, res: Response) {
  if (req.user!.role !== "admin") {
    res.status(403).json({ error: "Admin access required." });
    return;
  }

  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: "Email is required." });
    return;
  }

  // Upsert: create if not exists, set approved = true
  const user = await UserModel.findOneAndUpdate(
    { email: email.toLowerCase().trim() },
    { $set: { approved: true }, $setOnInsert: { email: email.toLowerCase().trim() } },
    { upsert: true, new: true }
  );

  res.json({ message: `${email} has been approved.`, user: user.toJSON() });
}
