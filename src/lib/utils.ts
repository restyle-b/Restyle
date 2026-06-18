import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** מיזוג מחלקות Tailwind בבטחה (תבנית shadcn). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * מאשרת שנתיב הפניה (מ-query param כמו `?next=`) הוא נתיב פנימי יחסי בלבד —
 * מונע open redirect. חוסם:
 *  - URL מוחלט (`https://evil.com`)
 *  - protocol-relative (`//evil.com`)
 *  - עקיפת backslash (`/\evil.com`) שדפדפנים מפרשים כ-`//evil.com`
 */
export function safeRedirectPath(path: string | null | undefined, fallback: string): string {
  if (!path || path[0] !== "/" || path[1] === "/" || path[1] === "\\") return fallback;
  return path;
}
