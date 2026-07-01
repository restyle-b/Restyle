"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart/cart-context";

/** אייקון עגלה + badge כמות בכותרת. */
export function CartIconLink() {
  const t = useTranslations("cart");
  const { itemCount } = useCart();

  return (
    <Link
      href="/cart"
      aria-label={t("cartAria")}
      className="relative flex h-9 w-9 items-center justify-center rounded-full text-neutral-300 transition-colors hover:bg-current/10 hover:text-white"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M3 3h2l.4 2M7 13h10l3-8H5.4M7 13 5.4 5M7 13l-2.3 4.6A1 1 0 0 0 5.6 19H17" />
        <circle cx="9" cy="21" r="1" />
        <circle cx="17" cy="21" r="1" />
      </svg>
      {itemCount > 0 && (
        <span className="bg-accent text-ink absolute -top-1 -end-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
