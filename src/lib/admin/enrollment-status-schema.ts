import { z } from "zod";

export const enrollmentStatusSchema = z.enum(["PENDING", "DEPOSIT_PAID", "PAID", "CANCELLED", "FAILED"]);

export type EnrollmentStatusInput = z.infer<typeof enrollmentStatusSchema>;
