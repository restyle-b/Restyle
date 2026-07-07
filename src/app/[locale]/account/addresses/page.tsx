import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/section-heading";
import { AddressesManager } from "@/components/account/addresses/addresses-manager";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getUserAddresses } from "@/lib/account/addresses";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account.addresses" });
  return { title: t("title") };
}

// תלוי ב-cookies()/Supabase לכל בקשה — אסור רינדור סטטי בזמן build.
export const dynamic = "force-dynamic";

/** /account/addresses — ux-spec.md §A4b: CRUD מלא + ברירת מחדל יחידה נאכפת. */
export default async function AccountAddressesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account.addresses" });

  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/account/addresses");
  }

  const addresses = await getUserAddresses(user.id);

  return (
    <>
      <SectionHeading light eyebrow={t("title")} title={t("title")} />
      <div className="mt-10">
        <AddressesManager initialAddresses={addresses} />
      </div>
    </>
  );
}
