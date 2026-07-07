import type { EnrollmentStatus } from "@prisma/client";

/**
 * מעברי סטטוס הרשמה מותרים לעדכון ידני ע"י אדמין — allow-list מפורש.
 * לא נוגע ב-CoursePayment ולא מפעיל refund (scope עתידי). PENDING/FAILED
 * נקבעים ע"י זרימת התשלום; אדמין בעיקר מבטל או משלים ידנית.
 */
export const ALLOWED_ENROLLMENT_TRANSITIONS: Record<EnrollmentStatus, EnrollmentStatus[]> = {
  PENDING: ["CANCELLED"],
  DEPOSIT_PAID: ["PAID", "CANCELLED"],
  PAID: ["CANCELLED"],
  CANCELLED: [],
  FAILED: [],
};
