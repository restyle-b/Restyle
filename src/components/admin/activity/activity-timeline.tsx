import {
  Package,
  ShoppingCart,
  GraduationCap,
  BookOpen,
  Quote,
  Images,
  FileText,
  Settings,
  Tags,
  Activity as ActivityIcon,
} from "lucide-react";
import type { ActivityLog } from "@prisma/client";
import { cn } from "@/lib/utils";

const ICON_BY_ENTITY: Record<string, React.ComponentType<{ className?: string }>> = {
  product: Package,
  order: ShoppingCart,
  enrollment: GraduationCap,
  course: BookOpen,
  testimonial: Quote,
  gallery: Images,
  content: FileText,
  settings: Settings,
  category: Tags,
};

function actorLabel(actorEmail: string | null): string {
  if (actorEmail === "payment") return "תשלום (אוטומטי)";
  if (!actorEmail || actorEmail === "system") return "מערכת";
  return actorEmail;
}

export function ActivityTimeline({ events }: { events: ActivityLog[] }) {
  if (events.length === 0) {
    return <p className="mt-8 text-center text-neutral-400">אין פעילות בסינון זה.</p>;
  }

  return (
    <ol className="relative ms-2 mt-6 space-y-6 border-s border-line-dark ps-8">
      {events.map((event) => {
        const Icon = ICON_BY_ENTITY[event.entityType] ?? ActivityIcon;
        return (
          <li key={event.id} className="relative">
            <span
              className={cn(
                "absolute top-0 -start-[2.6rem] flex h-8 w-8 items-center justify-center rounded-full border border-line-dark bg-ink-soft text-neutral-400",
              )}
              aria-hidden="true"
            >
              <Icon className="h-4 w-4" />
            </span>
            <p className="text-sm text-white">{event.summary}</p>
            <p className="mt-1 text-xs text-neutral-500">
              {actorLabel(event.actorEmail)} ·{" "}
              <span className="[direction:ltr] [font-variant-numeric:tabular-nums]">
                {new Date(event.createdAt).toLocaleString("he-IL", { dateStyle: "short", timeStyle: "short" })}
              </span>
            </p>
          </li>
        );
      })}
    </ol>
  );
}
