import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** מיזוג מחלקות Tailwind בבטחה (תבנית shadcn). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
