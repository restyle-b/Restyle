---
name: security
description: >-
  סקיל אבטחת מידע לפרויקט Restyle. Use this skill WHENEVER code touches auth,
  user data, payments, admin access, file uploads, env/secrets, or external
  input — to review for OWASP Top 10, access control, PCI-related handling, and
  Israeli privacy compliance. Triggers: "אבטחה", "האם זה מאובטח", "security
  review", "auth", "תשלומים", "הרשאות", "secrets", "GDPR", "פרטיות".
---

# Skill: אבטחת מידע (Security)

מטרה: שהאתר יהיה מאובטח ברמת פרודקשן — הגנה על משתמשים, תשלומים ונתונים.
הפעל אוטומטית על כל קוד שנוגע ב: התחברות, נתוני משתמש, תשלומים, אדמין, העלאת קבצים, סודות, או קלט חיצוני.

## עקרונות יסוד
- **Least privilege** — כל משתמש/role רואה ופועל רק על מה שמותר לו.
- **Never trust client input** — ולידציה (zod) + סניטציה על כל קלט בשרת.
- **Secrets בשרת בלבד** — לעולם לא מפתח/סוד בקוד קליינט או בקומיט. ENV מאומת ב-`lib/env.ts`.
- **Defense in depth** — RLS ב-Supabase + בדיקת הרשאה ב-server action, לא להסתמך על שכבה אחת.
- **Fail closed** — בספק, לדחות גישה.

## Checklist בקרת גישה (Access Control)
- [ ] כל server action / route בודק שהמשתמש מאומת ומורשה.
- [ ] בדיקת **בעלות על משאב** — משתמש לא יכול לקרוא/לערוך הזמנה/פרופיל של אחר (IDOR).
- [ ] נתיבי `admin/*` חסומים ל-role אדמין בלבד (middleware + בדיקה בשרת).
- [ ] Supabase RLS מופעל על כל טבלה עם נתוני משתמש.

## OWASP Top 10 — נקודות לבדיקה
- **Injection:** Prisma (parametrized) בלבד; אין SQL גולמי עם קלט. סניטציה ל-HTML שמוזן (XSS).
- **Auth:** סיסמאות/OTP דרך Supabase; session tokens מאובטחים; rate limiting להתחברות.
- **Sensitive data:** הצפנה ב-transit (HTTPS) ו-at rest; אין לוג של PII/כרטיסי אשראי.
- **Access control:** ראה checklist למעלה.
- **Security misconfig:** Security headers (CSP, HSTS, X-Frame-Options), CORS מצומצם.
- **SSRF/Upload:** העלאות דרך presigned URL ל-R2, בדיקת סוג/גודל קובץ, ללא הרצת קבצים.

## תשלומים (קריטי)
- **לא לאחסן פרטי כרטיס אשראי** — Tranzila/HYP מטפלים בכך (hosted fields / redirect). אנחנו שומרים רק token/מזהה עסקה.
- **אימות webhook/callback** — בדיקת חתימה/HMAC על כל החזרה מספק התשלום.
- **Idempotency** — callback כפול לא יוצר הזמנה/חיוב כפול.
- **סכום מאומת בשרת** — לעולם לא לסמוך על סכום שמגיע מהקליינט; לחשב מחדש מה-DB.

## פרטיות וחוק (ישראל)
- מדיניות פרטיות ותנאי שימוש; הסכמה לעוגיות.
- מינימיזציה של נתונים; זכות עיון/מחיקה (חוק הגנת הפרטיות / GDPR-like).
- גיבויים מוצפנים; תיעוד מי ניגש לנתונים רגישים.

## תהליך
1. עבור על ה-checklists הרלוונטיים לקוד הנוכחי.
2. דווח ממצאים בחומרה (Critical/High/Med/Low) עם תיקון מוצע.
3. Critical/High חוסמים שחרור — חזרה ל-`development`.
4. תעד החלטות אבטחה ב-`docs/ARCHITECTURE.md` (סעיף אבטחה).

> ניתן גם להריץ את הסקיל המובנה `/security-review` על diff לפני merge.
