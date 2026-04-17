import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email.")
    .email("Please enter a valid email address."),
  password: z.string().trim().min(1, "Please enter your password.")
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
