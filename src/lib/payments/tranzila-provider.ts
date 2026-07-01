import type { CheckoutInput, CheckoutResult, PaymentProvider, PaymentResult, RefundResult } from "@/lib/payments/types";

/**
 * מתאם Tranzila — שלד קוד-שלם לפי הזרימה החובה ב-
 * .claude/skills/tranzila-payments/SKILL.md, אך **לא מחובר בפועל**: אין
 * credentials אמיתיים (TRANZILA_TERMINAL/TRANZILA_TERMINAL_PASSWORD).
 * לא ניתן לבדיקה חיה — רק אחרי שהמשתמש יספק חשבון/סוד אמיתי מרשות
 * הסליקה. נבחר אוטומטית רק כש-PAYMENT_PROVIDER==="tranzila" (ראה
 * get-provider.ts + env.ts שדורש את שני משתני הטרמינל אז).
 *
 * ⚠️ שמות ה-endpoints/פרמטרים כאן הם best-effort לפי מחקר על docs.tranzila.com
 * ו-SKILL.md §7 — **חובה לאמת מול תיעוד חי לפני חיבור אמיתי ראשון**.
 *
 * מסלול אינטגרציה: iframe/handshake (SAQ-A, PCI מינימלי) — לא Hosted
 * Fields ולא API V2 (כרטיס בשרת שלנו). פרטי כרטיס לעולם לא עוברים דרך
 * הקוד הזה, רק טוקן handshake ומזהי התייחסות של טרנזילה.
 */

function getTranzilaCredentials() {
  const terminal = process.env.TRANZILA_TERMINAL;
  const password = process.env.TRANZILA_TERMINAL_PASSWORD;
  if (!terminal || !password) {
    throw new Error(
      "TranzilaProvider נבחר אך TRANZILA_TERMINAL/TRANZILA_TERMINAL_PASSWORD חסרים — ראה docs/SETUP.md §7",
    );
  }
  return { terminal, password };
}

/** המרה חד-כיוונית אגורות→שקלים עם נקודה עשרונית (טרנזילה מצפה לשקלים). */
function agorotToShekelString(amountAgorot: number): string {
  const shekels = amountAgorot / 100;
  const rounded = Math.round(shekels * 100) / 100;
  // בדיקת עיגול: אם ה-agorot לא היה שלם בשקלים*100, יש כאן קלט חשוד (לא
  // אמור לקרות כי המקור תמיד Int agorot) — עדיף לזרוק מאשר לשלוח סכום שגוי.
  if (Math.round(rounded * 100) !== amountAgorot) {
    throw new Error(`agorotToShekelString: round-trip mismatch for ${amountAgorot}`);
  }
  return rounded.toFixed(2);
}

export const tranzilaProvider: PaymentProvider = {
  async createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
    const { terminal, password } = getTranzilaCredentials();

    // שלב 1: בקשת handshake token מטרנזילה (server-to-server) — הסכום
    // מחושב בשרת שלנו בלבד (input.amountAgorot כבר מגיע מ-create-order.ts,
    // לא מהקליינט). orderNumber מועבר כ-reference לצורך התאמה בצד טרנזילה.
    const response = await fetch("https://secure5.tranzila.com/cgi-bin/tranzila71u.cgi", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        supplier: terminal,
        TranzilaPW: password,
        sum: agorotToShekelString(input.amountAgorot),
        currency: "1", // ILS
        myid: input.orderNumber,
        email: input.customerEmail,
        hp_lang: input.locale === "he" ? "il" : input.locale,
      }),
    });

    if (!response.ok) {
      throw new Error(`Tranzila handshake failed: HTTP ${response.status}`);
    }
    const text = await response.text();
    const params = new URLSearchParams(text.trim());
    const token = params.get("thtk");
    if (!token) {
      throw new Error("Tranzila handshake response missing thtk token");
    }

    const iframeUrl = new URL(`https://direct.tranzila.com/${terminal}/iframenew.php`);
    iframeUrl.searchParams.set("thtk", token);
    iframeUrl.searchParams.set("sum", agorotToShekelString(input.amountAgorot));
    iframeUrl.searchParams.set("currency", "1");
    iframeUrl.searchParams.set("myid", input.orderNumber);
    iframeUrl.searchParams.set("success_url_address", input.returnUrls.success);
    iframeUrl.searchParams.set("fail_url_address", input.returnUrls.cancel);

    return { redirectUrl: iframeUrl.toString(), providerRef: token };
  },

  async verifyCallback(req: Request): Promise<PaymentResult> {
    const { terminal, password } = getTranzilaCredentials();
    const body = (await req.json()) as Record<string, unknown>;
    const orderId = typeof body.orderId === "string" ? body.orderId : "";
    const orderNumber = typeof body.myid === "string" ? body.myid : "";
    const providerRef = typeof body.confirmation_code === "string" ? body.confirmation_code : "";

    if (!orderId || !orderNumber) {
      return { ok: false, orderId, reason: "missing orderId/orderNumber in callback" };
    }

    // per SKILL.md: לא סומכים על ה-callback body בלבד (client-side redirect
    // אינו הוכחת תשלום) — קריאת אימות server-to-server נוספת (Inquire) לפני
    // שמסמנים כ-paid.
    const inquireResponse = await fetch("https://secure5.tranzila.com/cgi-bin/tranzila71u.cgi", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        supplier: terminal,
        TranzilaPW: password,
        myid: orderNumber,
        query: "1",
      }),
    });
    if (!inquireResponse.ok) {
      return { ok: false, orderId, reason: `Inquire call failed: HTTP ${inquireResponse.status}` };
    }
    const inquireText = await inquireResponse.text();
    const inquireParams = new URLSearchParams(inquireText.trim());
    const errorCode = inquireParams.get("Response");
    if (errorCode !== "000" && errorCode !== "0") {
      return { ok: false, orderId, reason: `Tranzila error_code=${errorCode ?? "unknown"}` };
    }

    const amountShekels = Number(inquireParams.get("sum") ?? "0");
    const amountAgorot = Math.round(amountShekels * 100);
    const last4 = inquireParams.get("ccno")?.slice(-4);

    return { ok: true, orderId, providerRef: providerRef || orderNumber, amountAgorot, last4 };
  },

  async refund(providerRef: string, amountAgorot: number): Promise<RefundResult> {
    const { terminal, password } = getTranzilaCredentials();
    const response = await fetch("https://secure5.tranzila.com/cgi-bin/tranzila71u.cgi", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        supplier: terminal,
        TranzilaPW: password,
        myid: providerRef,
        sum: agorotToShekelString(amountAgorot),
        credit: "1", // refund flag
      }),
    });
    if (!response.ok) {
      return { ok: false, reason: `Tranzila refund HTTP ${response.status}` };
    }
    const text = await response.text();
    const params = new URLSearchParams(text.trim());
    const errorCode = params.get("Response");
    if (errorCode !== "000" && errorCode !== "0") {
      return { ok: false, reason: `Tranzila refund error_code=${errorCode ?? "unknown"}` };
    }
    return { ok: true, refundRef: params.get("ConfirmationCode") ?? providerRef };
  },
};
