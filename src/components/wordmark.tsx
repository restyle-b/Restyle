import { cn } from "@/lib/utils";

/**
 * סמליל המותג — מוצג כ-"ReStyle" בגופן הלוגו (Playfair Display).
 * משמש ב-header וב-footer. שם המותג לטקסט/SEO נשאר `siteConfig.name`.
 */
export function Wordmark({ className }: { className?: string }) {
  return <span className={cn("font-logo", className)}>ReStyle</span>;
}
