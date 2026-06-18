import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "התחברות",
  description: "התחברות לאזור האישי באתר ReStyle.",
};

export default function LoginPage() {
  return (
    <AuthCard
      eyebrow="ברוכים השבים"
      title="התחברות"
      footer={{ href: "/register", text: "אין לך חשבון?", linkText: "הרשמה" }}
    >
      <Suspense>
        <LoginForm />
      </Suspense>
      <p className="mt-4 text-center text-sm">
        <a href="/forgot-password" className="text-accent hover:underline">
          שכחת סיסמה?
        </a>
      </p>
    </AuthCard>
  );
}
