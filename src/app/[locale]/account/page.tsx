import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/section-heading";
import { getCurrentUser } from "@/lib/auth/current-user";
import { ProfileNudgeCard } from "@/components/account/dashboard/profile-nudge-card";
import { RecentOrdersCard } from "@/components/account/dashboard/recent-orders-card";
import { QuickActionsCard } from "@/components/account/dashboard/quick-actions-card";
import { CoursesCard } from "@/components/account/dashboard/courses-card";
import { WishlistPreviewCard } from "@/components/account/dashboard/wishlist-preview-card";
import { RecommendedRail } from "@/components/account/dashboard/recommended-rail";
import { RecentlyViewedRail } from "@/components/account/recently-viewed-rail";
import { DashboardCardSkeleton } from "@/components/account/dashboard/card-skeleton";

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

/**
 * דשבורד האזור האישי — ux-spec.md §A2. הצ'רום (auth+redirect, sidebar/tab bar)
 * כבר ב-account/layout.tsx; כאן רק הכרטיסים. כל כרטיס תלוי-DB עטוף ב-Suspense
 * משלו כדי שהעמוד יזרום מיידית ולא ימתין לאיטי שבהם (streaming עצמאי לפי כרטיס).
 * סדר DOM תואם לסדר הנייד המפורש בספק ("nudge → orders → quick actions →
 * courses → wishlist → recommended → viewed"); בדסקטופ כל כרטיס מזיז את עצמו
 * חזותית עם lg:order-N כדי להתאים לפריסה הממוספרת של הספק (ראה כל קומפוננטת
 * כרטיס), בלי ליצור "חורים" ב-grid מריצוף DOM גולמי.
 */
export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account.dashboard" });

  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/account");
  }

  const fullName = user.name ?? user.email;
  const firstName = fullName.split(" ")[0] ?? fullName;
  const missingName = !user.name;
  const missingPhone = !user.phone;

  return (
    <>
      <SectionHeading light eyebrow={t("eyebrow")} title={t("greeting", { firstName })} />

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {(missingName || missingPhone) && (
          <ProfileNudgeCard locale={locale} missingName={missingName} missingPhone={missingPhone} />
        )}

        <Suspense fallback={<DashboardCardSkeleton className="lg:order-1 lg:col-span-2" />}>
          <RecentOrdersCard userId={user.id} locale={locale} />
        </Suspense>

        <Suspense fallback={<DashboardCardSkeleton className="lg:order-5 lg:col-span-3" rows={1} />}>
          <QuickActionsCard locale={locale} />
        </Suspense>

        <Suspense fallback={<DashboardCardSkeleton className="lg:order-3" rows={2} />}>
          <CoursesCard userId={user.id} locale={locale} />
        </Suspense>

        <Suspense fallback={<DashboardCardSkeleton className="lg:order-4 lg:col-span-2" rows={1} />}>
          <WishlistPreviewCard userId={user.id} locale={locale} />
        </Suspense>

        <Suspense fallback={<DashboardCardSkeleton className="lg:order-6 lg:col-span-3" rows={1} />}>
          <RecommendedRail userId={user.id} locale={locale} />
        </Suspense>

        <RecentlyViewedRail />
      </div>
    </>
  );
}
