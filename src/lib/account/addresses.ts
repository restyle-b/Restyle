import { db } from "@/lib/db";

/** כתובות שמורות של המשתמש — ברירת מחדל קודם, אח"כ החדשה ביותר. */
export async function getUserAddresses(userId: string) {
  return db.userAddress.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}
