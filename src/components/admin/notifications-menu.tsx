"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/** פעמון התראות — הזמנות/הרשמות ממתינות לתשלום/טיפול + מלאי נמוך. ספירה בלבד (ללא push/realtime). */
export function NotificationsMenu({
  pendingOrders,
  pendingEnrollments,
  lowStockProducts,
}: {
  pendingOrders: number;
  pendingEnrollments: number;
  lowStockProducts: number;
}) {
  const total = pendingOrders + pendingEnrollments + lowStockProducts;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-md text-neutral-300 transition-colors hover:bg-white/10 hover:text-white"
          aria-label={`התראות${total > 0 ? ` (${total} ממתינות)` : ""}`}
        >
          <Bell className="h-4.5 w-4.5" />
          {total > 0 && (
            <span
              className={cn(
                "absolute end-1.5 top-1.5 flex h-2 w-2 items-center justify-center rounded-full bg-accent",
              )}
              aria-hidden="true"
            />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>התראות</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {total === 0 ? (
          <p className="px-2.5 py-4 text-center text-sm text-neutral-500">אין התראות חדשות</p>
        ) : (
          <>
            {pendingOrders > 0 && (
              <DropdownMenuItem asChild>
                <Link href="/admin/orders?status=PENDING" className="flex-col items-start gap-0.5">
                  <span className="font-medium text-white">{pendingOrders} הזמנות ממתינות לתשלום</span>
                  <span className="text-xs text-neutral-500">לחצו לצפייה בהזמנות</span>
                </Link>
              </DropdownMenuItem>
            )}
            {pendingEnrollments > 0 && (
              <DropdownMenuItem asChild>
                <Link href="/admin/enrollments?status=PENDING" className="flex-col items-start gap-0.5">
                  <span className="font-medium text-white">{pendingEnrollments} הרשמות ממתינות לתשלום</span>
                  <span className="text-xs text-neutral-500">לחצו לצפייה בהרשמות</span>
                </Link>
              </DropdownMenuItem>
            )}
            {lowStockProducts > 0 && (
              <DropdownMenuItem asChild>
                <Link href="/admin/products?stock=low" className="flex-col items-start gap-0.5">
                  <span className="font-medium text-white">{lowStockProducts} מוצרים במלאי נמוך</span>
                  <span className="text-xs text-neutral-500">לחצו לצפייה במוצרים</span>
                </Link>
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
