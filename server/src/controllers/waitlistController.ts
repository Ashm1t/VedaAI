import { Request, Response } from "express";
import { WaitlistModel } from "../models/Waitlist.js";

export async function joinWaitlist(req: Request, res: Response) {
  const { email } = req.body;

  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "A valid email is required." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email address." });
  }

  try {
    await WaitlistModel.create({ email: email.toLowerCase().trim() });
    return res.status(201).json({ message: "You're on the list!" });
  } catch (err: unknown) {
    // MongoDB duplicate key error
    if ((err as { code?: number }).code === 11000) {
      return res.status(409).json({ error: "This email is already on the waitlist." });
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
