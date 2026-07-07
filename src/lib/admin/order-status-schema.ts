import { z } from "zod";

// TypeScript מאכיף את הטיפוס הזה רק בזמן קומפילציה — קריאה ישירה ל-server
// action (בעקיפין ל-client bundle) יכולה לשלוח כל string. ולידציה מפורשת
// כאן היא ההגנה בפועל, לא רק הסתמכות על allow-list/Prisma enum כ-backstop עקיף.
export const orderStatusSchema = z.enum(["PENDING", "PAID", "FULFILLED", "COMPLETED", "CANCELLED", "FAILED"]);

export type OrderStatusInput = z.infer<typeof orderStatusSchema>;
