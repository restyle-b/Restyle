import Link from "next/link";
import { cn } from "@/lib/utils";

/** בונה querystring לעמוד נתון תוך שימור פרמטרים קיימים (status/q). */
function pageHref(basePath: string, params: Record<string, string | undefined>, page: number): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  if (page > 1) search.set("page", String(page));
  const qs = search.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function Pagination({
  basePath,
  params,
  page,
  pageSize,
  total,
}: {
  basePath: string;
  params: Record<string, string | undefined>;
  page: number;
  pageSize: number;
  total: number;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="pagination" className="mt-6 flex items-center justify-between gap-4 text-sm">
      <Link
        href={pageHref(basePath, params, page - 1)}
        aria-disabled={page <= 1}
        className={cn(
          "rounded-md border border-line-dark px-4 py-1.5 transition-colors",
          page <= 1
            ? "pointer-events-none text-neutral-600"
            : "text-neutral-300 hover:border-accent hover:text-white",
        )}
      >
        הקודם
      </Link>
      <span className="text-neutral-400">
        עמוד {page} מתוך {totalPages}
      </span>
      <Link
        href={pageHref(basePath, params, page + 1)}
        aria-disabled={page >= totalPages}
        className={cn(
          "rounded-md border border-line-dark px-4 py-1.5 transition-colors",
          page >= totalPages
            ? "pointer-events-none text-neutral-600"
            : "text-neutral-300 hover:border-accent hover:text-white",
        )}
      >
        הבא
      </Link>
    </nav>
  );
}
