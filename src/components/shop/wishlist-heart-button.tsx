"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { toggleWishlistItem } from "@/server/actions/account/wishlist";
import { cn } from "@/lib/utils";

/**
 * לב הוספה/הסרה למועדפים על כרטיס מוצר — אחות של ה-Link ב-DOM (לא בתוכו),
 * כדי שלחיצה עליו לעולם לא תנווט לדף המוצר. טוגל אופטימי מקומי, אך תמיד
 * מתיישר לתשובת השרת (result.wishlisted) — כך שגם אם initialWishlisted לא
 * שיקף מצב אמיתי (למשל בעמודי קטלוג ציבוריים שלא טוענים מצב מועדפים לכל
 * מוצר), הלחיצה הראשונה מתקנת את עצמה. ראה docs/features/platform-upgrade/ux-spec.md §A5.
 */
export function WishlistHeartButton({
  productId,
  initialWishlisted = false,
  className,
  onToggled,
}: {
  productId: string;
  initialWishlisted?: boolean;
  className?: string;
  /** נקרא מיידית עם המצב האופטימי (לפני תשובת השרת) — משמש את עמוד המועדפים
   * להסרה אופטימית של הכרטיס מה-grid + טוסט undo, ראה ux-spec.md §A5. */
  onToggled?: (wishlisted: boolean) => void;
}) {
  const t = useTranslations("account.wishlist");
  const locale = useLocale();
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [isPending, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    const optimisticNext = !wishlisted;
    setWishlisted(optimisticNext);
    onToggled?.(optimisticNext);
    startTransition(async () => {
      const result = await toggleWishlistItem(productId, locale);
      if (result.ok) {
        setWishlisted(result.wishlisted);
      } else {
        setWishlisted(!optimisticNext);
        toast.error(result.error);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={wishlisted}
      aria-label={wishlisted ? t("heartRemove") : t("heartAdd")}
      className={cn(
        // הכרטיס תמיד כהה מעל תמונת מוצר בשני ה-themes (bg-ink/70 לא ב-override
        // של מצב יום, בכוונה). text-[#fff] גם הוא לא ב-override — לעומת
        // text-white, שהיה הופך לכהה במצב יום ויוצר לב שחור-על-שחור בלתי נראה.
        "flex h-9 w-9 items-center justify-center rounded-full bg-ink/70 text-[#fff] backdrop-blur transition-opacity duration-200",
        wishlisted ? "opacity-100" : "opacity-0 group-hover:opacity-100 max-md:opacity-100",
        className,
      )}
    >
      <Heart className={cn("h-4 w-4", wishlisted && "fill-accent text-accent")} aria-hidden="true" />
    </button>
  );
}
