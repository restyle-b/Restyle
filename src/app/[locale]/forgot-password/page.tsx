import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "שכחתי סיסמה",
  description: "איפוס סיסמה לאזור האישי באתר ReStyle.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      eyebrow="לא נורא, קורה"
      title="שכחתי סיסמה"
      description="נשלח לך מייל עם קישור לאיפוס הסיסמה."
      footer={{ href: "/login", text: "נזכרת?", linkText: "התחברות" }}
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
