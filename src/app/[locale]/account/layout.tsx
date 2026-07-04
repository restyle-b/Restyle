import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { AccountNav } from "@/components/account/account-nav";
import { AccountMobileNav } from "@/components/account/account-mobile-nav";
import { getCurrentUser } from "@/lib/auth/current-user";

// תלוי ב-cookies()/Supabase לכל בקשה — אסור רינדור סטטי בזמן build.
export const dynamic = "force-dynamic";

/**
 * מעטפת האזור האישי — מרכזת את בדיקת ה-auth+redirect שהייתה משוכפלת בכל
 * עמוד (account/page.tsx, orders, orders/[orderNumber], courses) לנקודה
 * אחת. עמודי הבן מניחים כעת שמשתמש מחובר קיים (עדיין קוראים ל-getCurrentUser()
 * בעצמם לצורך ה-id/ownership check שלהם — לא סומכים על prop-drilling מה-layout,
 * ש-Next.js ממילא לא תומך בו בין layout לעמוד).
 */
export default async function AccountLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // הגנה כפולה — ה-middleware כבר חוסם /account למשתמש לא מחובר, זו שכבה שנייה.
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/account");
  }

  const t = await getTranslations({ locale, namespace: "account.nav" });
  const isAdmin = user.role === "ADMIN";

  const items = [
    { href: "/account", label: t("dashboard") },
    { href: "/account/orders", label: t("orders") },
    { href: "/account/courses", label: t("courses") },
    { href: "/account/wishlist", label: t("wishlist") },
    { href: "/account/addresses", label: t("addresses") },
    { href: "/account/profile", label: t("profile") },
  ];

  const labels = {
    dashboard: t("dashboard"),
    orders: t("orders"),
    courses: t("courses"),
    wishlist: t("wishlist"),
    addresses: t("addresses"),
    profile: t("profile"),
    more: t("more"),
    adminPanel: t("adminPanel"),
  };

  return (
    <Container className="py-10 md:py-16">
      {/* גריד דו-טורי בדסקטופ: הסיידבר ממוקם חזותית ראשון (md:order-1) כדי
          לשבת בצד ה-RTL-מוביל (ימין), בעוד התוכן נשאר ראשון ב-DOM — משתמשי
          קורא-מסך מגיעים ישר לתוכן ולא לניווט שחוזר על עצמו בכל עמוד. הקו
          המפריד לכן יושב על התוכן (border-s), לא על הסיידבר כמו באדמין
          (border-e), ששם הסיידבר גם חזותית וגם ב-DOM ראשון. */}
      <div className="grid gap-8 pb-24 md:grid-cols-[15rem_1fr] md:items-start md:pb-0">
        <div className="min-w-0 md:order-2 md:border-s md:border-line-dark md:ps-8">{children}</div>
        <aside className="hidden md:sticky md:top-24 md:order-1 md:flex md:h-fit md:flex-col md:gap-1">
          <AccountNav items={items} isAdmin={isAdmin} adminLabel={labels.adminPanel} />
        </aside>
      </div>
      <AccountMobileNav labels={labels} isAdmin={isAdmin} />
    </Container>
  );
}
