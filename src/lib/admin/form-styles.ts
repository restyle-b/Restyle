import { cn } from "@/lib/utils";

export const adminInputClass =
  "w-full rounded-md border border-line-dark bg-ink-soft px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-accent focus:outline-none";

export const adminTextareaClass = cn(adminInputClass, "min-h-[80px]");

export const adminInputClassLg =
  "w-full rounded-md border border-line-dark bg-ink-soft px-4 py-2.5 text-white placeholder:text-neutral-500 focus:border-accent focus:outline-none";
