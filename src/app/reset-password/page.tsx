import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "איפוס סיסמה",
  description: "הגדרת סיסמה חדשה לאזור האישי באתר Restyle.",
};

export default function ResetPasswordPage() {
  return (
    <AuthCard eyebrow="כמעט סיימנו" title="הגדרת סיסמה חדשה">
      <ResetPasswordForm />
    </AuthCard>
  );
}
