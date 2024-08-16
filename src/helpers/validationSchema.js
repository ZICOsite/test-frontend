import { z } from "zod";

export const schema = z.object({
  email: z.string().email("Неверный формат электронной почты"),
  // number: z.string().min(6, { message: "Минимум 6 цифр" }),
});
