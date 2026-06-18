import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "הרשמה",
  description: "הרשמה לאזור האישי באתר ReStyle.",
};

export default function RegisterPage() {
  return (
    <AuthCard
      eyebrow="הצטרפו אלינו"
      title="הרשמה"
      footer={{ href: "/login", text: "יש לך כבר חשבון?", linkText: "התחברות" }}
    >
      <RegisterForm />
    </AuthCard>
  );
}
