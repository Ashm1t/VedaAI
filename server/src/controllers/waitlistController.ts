import { Request, Response } from "express";
import { WaitlistModel } from "../models/Waitlist.js";
import { UserModel } from "../models/User.js";

export async function joinWaitlist(req: Request, res: Response) {
  const { email } = req.body;

  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "A valid email is required." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email address." });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    // Add to waitlist
    await WaitlistModel.create({ email: normalizedEmail });

    // Auto-approve this email for login
    await UserModel.findOneAndUpdate(
      { email: normalizedEmail },
      { $set: { approved: true }, $setOnInsert: { email: normalizedEmail } },
      { upsert: true, new: true }
    );

    return res.status(201).json({ message: "You're in! Redirecting to sign in..." });
  } catch (err: unknown) {
    // MongoDB duplicate key error — already on waitlist, still approved
    if ((err as { code?: number }).code === 11000) {
      // Make sure they're approved even if they were already on the waitlist
      await UserModel.findOneAndUpdate(
        { email: normalizedEmail },
        { $set: { approved: true }, $setOnInsert: { email: normalizedEmail } },
        { upsert: true, new: true }
      );
      return res.status(200).json({ message: "You're already signed up! Redirecting to sign in..." });
    }
    console.error("Waitlist error:", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}

export async function getWaitlist(_req: Request, res: Response) {
  try {
    const entries = await WaitlistModel.find({}, { email: 1, createdAt: 1 }).sort({ createdAt: -1 });
    return res.json({ count: entries.length, entries });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch waitlist." });
  }
}
