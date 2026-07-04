import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Lock, ChevronLeft } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { ProfileForm } from "@/components/account/profile-form";
import { cn } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth/current-user";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account.profile" });
  return { title: t("title") };
}

// תלוי ב-cookies()/Supabase לכל בקשה — אסור רינדור סטטי בזמן build.
export const dynamic = "force-dynamic";

/** /account/profile — ux-spec.md §A4: פרטים אישיים + אבטחה (בלי טופס סיסמה
 * בעמוד — קישור לזרימת האיפוס הקיימת) + קישור לספר הכתובות. */
export default async function AccountProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account.profile" });

  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/account/profile");
  }

  return (
    <div className="max-w-xl">
      <SectionHeading light eyebrow={t("title")} title={t("title")} />

      <section className="mt-8 space-y-5">
        <h2 className="font-display text-lg font-semibold text-white">{t("personalTitle")}</h2>
        <ProfileForm initialName={user.name ?? ""} initialPhone={user.phone ?? ""} />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-300">{t("emailLabel")}</label>
          <div className="flex items-center gap-2 rounded-md border border-line-dark bg-ink-soft/60 px-4 py-2.5 text-neutral-400">
            <Lock className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span dir="ltr" className="truncate">
              {user.email}
            </span>
          </div>
          <p className="mt-1.5 text-xs text-neutral-500">{t("emailReadonlyNote")}</p>
        </div>
      </section>

      <section className="mt-10 space-y-3 border-t border-line-dark pt-8">
        <h2 className="font-display text-lg font-semibold text-white">{t("securityTitle")}</h2>
        <p className="text-sm text-neutral-400">{t("securityDescription")}</p>
        <Link href="/forgot-password" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          {t("resetPasswordCta")}
        </Link>
      </section>

      <section className="mt-10 border-t border-line-dark pt-8">
        <Link
          href="/account/addresses"
          className="inline-flex items-center gap-1 text-sm text-neutral-400 transition-colors hover:text-white"
        >
          {t("addressesLinkCta")}
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
