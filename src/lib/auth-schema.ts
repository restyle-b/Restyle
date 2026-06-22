import { z } from "zod";

const email = z.string().trim().min(1, "נדרשת כתובת אימייל").email("כתובת אימייל לא תקינה");
const password = z.string().min(8, "הסיסמה צריכה להיות באורך 8 תווים לפחות");

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "נדרש שם בן 2 תווים לפחות"),
  email,
  password,
  // honeypot אנטי-ספאם — שדה מוסתר שמשתמש אנושי לא ימלא. מוגבל באורך (אנטי-DoS)
  // אך מילוי לא תקין לא חוסם את הוולידציה — מטופל ב-server action בהתעלמות שקטה.
  company: z.string().max(256).optional().or(z.literal("")),
});
export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "נדרשת סיסמה"),
});
export type SignInInput = z.infer<typeof signInSchema>;

export const requestPasswordResetSchema = z.object({ email });
export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;

export const updatePasswordSchema = z.object({ password });
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
