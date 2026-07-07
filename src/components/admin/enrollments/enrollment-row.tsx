"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { Enrollment, CoursePayment, EnrollmentStatusEvent } from "@prisma/client";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EnrollmentStatusMenu } from "@/components/admin/enrollments/enrollment-status-menu";
import { StatusHistory } from "@/components/admin/status-history";
import { formatAgorot } from "@/lib/format";
import { cn } from "@/lib/utils";

const ENROLLMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "ממתין לתשלום",
  DEPOSIT_PAID: "מקדמה שולמה",
  PAID: "שולם במלואו",
  CANCELLED: "בוטל",
  FAILED: "נכשל",
};

const PLAN_LABELS: Record<string, string> = { DEPOSIT: "מקדמה", FULL: "תשלום מלא" };
const KIND_LABELS: Record<string, string> = { DEPOSIT: "מקדמה", BALANCE: "יתרה", FULL: "תשלום מלא" };
const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "ממתין",
  SUCCEEDED: "שולם",
  FAILED: "נכשל",
  REFUNDED: "זוכה",
  PARTIALLY_REFUNDED: "זוכה חלקית",
};

type EnrollmentRowData = Enrollment & {
  payments: CoursePayment[];
  statusEvents: EnrollmentStatusEvent[];
};

export function EnrollmentRow({ enrollment }: { enrollment: EnrollmentRowData }) {
  const [expanded, setExpanded] = useState(false);
  const balance = enrollment.coursePriceAgorot - enrollment.amountPaidAgorot;

  return (
    <>
      <TableRow className="cursor-pointer" onClick={() => setExpanded((v) => !v)}>
        <TableCell>
          <ChevronDown className={cn("h-4 w-4 text-neutral-500 transition-transform", expanded && "rotate-180")} />
        </TableCell>
        <TableCell>
          <Link
            href={`/admin/enrollments/${enrollment.enrollmentNumber}`}
            onClick={(e) => e.stopPropagation()}
            className="font-medium text-white hover:text-accent hover:underline"
          >
            {enrollment.enrollmentNumber}
          </Link>
        </TableCell>
        <TableCell>
          <p className="text-white">{enrollment.courseNameHeSnapshot}</p>
          <p className="text-xs text-neutral-500">{enrollment.customerName}</p>
        </TableCell>
        <TableCell>
          <Badge tone="outline">{PLAN_LABELS[enrollment.plan] ?? enrollment.plan}</Badge>
        </TableCell>
        <TableCell className="text-neutral-400">
          {formatAgorot(enrollment.amountPaidAgorot, "he")} / {formatAgorot(enrollment.coursePriceAgorot, "he")}
        </TableCell>
        <TableCell className="text-neutral-400 [direction:ltr] [font-variant-numeric:tabular-nums]">
          {new Date(enrollment.createdAt).toLocaleDateString("he-IL")}
        </TableCell>
        <TableCell onClick={(e) => e.stopPropagation()}>
          <EnrollmentStatusMenu enrollmentNumber={enrollment.enrollmentNumber} status={enrollment.status} />
        </TableCell>
      </TableRow>

      {expanded && (
        <TableRow className="bg-white/[0.02] hover:bg-white/[0.02]">
          <TableCell colSpan={7}>
            <div className="grid gap-6 py-2 lg:grid-cols-3">
              <div>
                <h4 className="text-xs font-medium tracking-wide text-neutral-500 uppercase">פרטי קשר ותשלום</h4>
                <p className="mt-2 text-sm text-neutral-300">{enrollment.customerEmail}</p>
                <p className="text-sm text-neutral-300">{enrollment.customerPhone}</p>
                <div className="mt-3 space-y-1 border-t border-line-dark pt-2 text-sm text-neutral-400">
                  <div className="flex justify-between">
                    <span>מחיר קורס</span>
                    <span className="text-white">{formatAgorot(enrollment.coursePriceAgorot, "he")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>שולם</span>
                    <span className="text-white">{formatAgorot(enrollment.amountPaidAgorot, "he")}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-white">יתרה</span>
                    <span className="text-accent">{formatAgorot(balance, "he")}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-medium tracking-wide text-neutral-500 uppercase">תשלומים</h4>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {enrollment.payments.map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-4">
                      <span className="text-neutral-300">
                        {KIND_LABELS[p.kind] ?? p.kind} · {formatAgorot(p.amountAgorot, "he")}
                      </span>
                      <span className="text-neutral-500">{PAYMENT_STATUS_LABELS[p.status] ?? p.status}</span>
                    </li>
                  ))}
                  {enrollment.payments.length === 0 && <p className="text-sm text-neutral-500">אין תשלומים.</p>}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-medium tracking-wide text-neutral-500 uppercase">היסטוריית סטטוס</h4>
                <div className="mt-3">
                  <StatusHistory events={enrollment.statusEvents} labels={ENROLLMENT_STATUS_LABELS} />
                </div>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
