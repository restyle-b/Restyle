import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * סמליל המותג — תמונת הלוגו הרשמית של ReStyle (לבן על שקוף).
 * משמש ב-header וב-footer. שם המותג לטקסט/SEO נשאר `siteConfig.name`.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <Image
      src="/restyle-logo.png"
      alt="ReStyle"
      width={574}
      height={172}
      priority
      className={cn("logo-mark w-auto", className)}
    />
  );
}
