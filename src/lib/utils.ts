import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** מיזוג מחלקות Tailwind בבטחה (תבנית shadcn). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * מאשרת שנתיב הפניה (מ-query param כמו `?next=`) הוא נתיב פנימי יחסי בלבד —
 * מונע open redirect (למשל `?next=https://evil.com` או `?next=//evil.com`).
 */
export function safeRedirectPath(path: string | null | undefined, fallback: string): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return fallback;
  return path;
}
