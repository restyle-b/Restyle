import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/section-heading";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth/current-user";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account.dashboard" });
  return { title: t("eyebrow") };
}

// העמוד תלוי ב-cookies()/Supabase לכל בקשה — אסור ל-Next לנסות לרנדר אותו
// סטטית בזמן build (זה היה גורם לקריסת build כשמשתני הסביבה חסרים, עוד לפני
// שה-cookies() נקראת ומסמנת לעמוד שהוא דינמי).
export const dynamic = "force-dynamic";

// גרסה מפושטת שמיגרה למרחב השמות account.dashboard (היה הארד-קוד עברי,
// בניגוד ל-account/orders/page.tsx ודומיו) — הדשבורד המלא (כרטיסי סקירה,
// wishlist, מוצרים מומלצים וכו') נבנה בקומיט הבא על גבי אותו מרחב שמות.
export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account.dashboard" });
  const tNav = await getTranslations({ locale, namespace: "account.nav" });

  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/account");
  }

  const fullName = user.name ?? user.email;
  const firstName = fullName.split(" ")[0] ?? fullName;

  return (
    <Container className="py-20">
      <SectionHeading light eyebrow={t("eyebrow")} title={t("greeting", { firstName })} />

      <dl className="mt-8 max-w-md space-y-3 text-neutral-300">
        <div className="flex gap-3">
          <dt className="font-medium text-white">{t("emailLabel")}:</dt>
          <dd>{user.email}</dd>
        </div>
      </dl>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link href="/account/orders" className={cn(buttonVariants({ size: "lg" }))}>
          {tNav("orders")}
        </Link>
        <Link href="/account/courses" className={cn(buttonVariants({ size: "lg", variant: "outline" }))}>
          {tNav("courses")}
        </Link>
      </div>
    </Container>
  );
}
