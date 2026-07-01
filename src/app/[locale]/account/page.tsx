import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/section-heading";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "אזור אישי",
  description: "האזור האישי שלך באתר ReStyle.",
};

// העמוד תלוי ב-cookies()/Supabase לכל בקשה — אסור ל-Next לנסות לרנדר אותו
// סטטית בזמן build (זה היה גורם לקריסת build כשמשתני הסביבה חסרים, עוד לפני
// שה-cookies() נקראת ומסמנת לעמוד שהוא דינמי).
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  // הגנה כפולה — ה-middleware מפנה כבר ל-/login, אך לא לסמוך על שכבה אחת בלבד
  if (!data.user) {
    redirect("/login?next=/account");
  }

  const name = (data.user.user_metadata?.name as string | undefined) ?? data.user.email;

  return (
    <Container className="py-20">
      <SectionHeading light eyebrow="האזור האישי שלך" title={`שלום, ${name}`} />

      <dl className="mt-8 max-w-md space-y-3 text-neutral-300">
        <div className="flex gap-3">
          <dt className="font-medium text-white">אימייל:</dt>
          <dd>{data.user.email}</dd>
        </div>
      </dl>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link href="/account/orders" className={cn(buttonVariants({ size: "lg" }))}>
          ההזמנות שלי
        </Link>
        <SignOutButton />
      </div>
    </Container>
  );
}
