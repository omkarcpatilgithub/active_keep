import { z } from "zod";

/** Accepts "+91 98765-43210" style input; normalises to E.164 ("+919876543210"). */
export const mobileSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s\-().]/g, ""))
  .pipe(z.string().regex(/^\+[1-9]\d{7,14}$/, "Enter a valid number in international format, e.g. +14155552671"));

export const profileSchema = z.object({ mobileNumber: mobileSchema });

export const chatRequestSchema = z.object({
  conversationId: z.string().uuid().optional(),
  message: z.string().trim().min(1, "Message is empty").max(4000, "Message is too long"),
});

export const renameSchema = z.object({ title: z.string().trim().min(1).max(200) });

export const idSchema = z.string().uuid();
