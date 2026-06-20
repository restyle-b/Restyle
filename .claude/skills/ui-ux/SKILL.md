---
name: ui-ux
description: >-
  סקיל עיצוב UI/UX ותנועה (motion) לפרויקט Restyle — לחשוב כמו מעצב גרפי
  פרימיום לפני שכותבים קוד ממשק. Use this skill WHENEVER designing or refining
  visual UI, layout, micro-interactions, animations/transitions, hover states,
  page transitions, or overall "look & feel". Triggers: "אנימציות", "תנועה",
  "עיצוב", "מגניב", "חדשני", "UI", "UX", "hover", "transition", "animation",
  "תעצב", "תהפוך את זה ליפה", "micro-interaction".
---

# Skill: עיצוב ותנועה (UI/UX & Motion)

מטרה: ממשק פרימיום, נקי ועקבי, עם תנועה מכוונת שמשרתת את החוויה — לא קישוט.
**חשוב כמו מעצב גרפי**: קודם קונספט ושפה ויזואלית, אחר כך מימוש.

## 0. הקשר מותגי (לקרוא לפני כל עבודת עיצוב)
- מקור אמת: `docs/DESIGN.md`. השראה: menspire.com / orhayoon.com.
- אופי המותג: **פרימיום · גברי · מינימליסטי · עריכותי (editorial) · בטוח בעצמו**.
- פלטה: רקע כהה `ink` (#0E0E0E) + רקע בהיר `paper` (#FAFAF8), הדגשה אפור בהיר שטוח
  `accent` (#E5E5E5 / hover #CFCFCF). פינות חדות (`rounded-none` לכפתורי CTA),
  כותרות uppercase עם `tracking` רחב, גופן Assistant (he/en) / Cairo (ar).
- **"מגניב" ≠ עמוס.** בעולם הפרימיום, פחות זה יותר. תנועה מינימלית ומדויקת
  משדרת יוקרה; תנועה צעקנית/קפיצית מוזילה את המותג.

## 1. עקרונות תנועה (Motion principles)
1. **תכלית** — כל אנימציה עונה על "למה": כניסה שמכוונת מבט, hover שנותן משוב,
   מעבר שמסביר היררכיה. אין תנועה לשם תנועה.
2. **עדינות** — להעדיף `opacity` + `transform` קטן (translate ≤ 24px, scale 1↔1.08).
   לא להזיז דברים הרבה, לא להבהב, לא להקפיץ.
3. **ביצועים** — **רק `transform` ו-`opacity`** (GPU-composited). לעולם לא להנפיש
   `width/height/top/left/margin` (גורם reflow). `will-change` במשורה.
4. **עקביות** — סקאלת תזמון ו-easing אחידה (ראה §2), לא ערכים אקראיים.
5. **כיווניות (RTL)** — להעדיף ציר Y (translateY) לכניסות, כדי להימנע מבאגי
   כיוון בין עברית/ערבית (RTL) לאנגלית (LTR). אם בכל זאת ציר X — לוודא היפוך נכון.

## 2. סקאלת תנועה (Motion tokens — מוגדרת ב-globals.css)
- **Easing:**
  - `--ease-out` (כניסות): `cubic-bezier(0.16, 1, 0.3, 1)` — "expo-out", מתפרץ ונרגע, יוקרתי.
  - `--ease-in-out` (hover/דו-כיווני): `cubic-bezier(0.65, 0, 0.35, 1)`.
- **Duration:**
  - micro (hover/לחיצה): **150–200ms**
  - element (כניסת אלמנט בודד): **500ms**
  - section/hero (בלוק/כותרת): **700–900ms**
- **Stagger** (כניסה מדורגת של רשימה/גריד): ~**60–90ms** בין פריטים, עם תקרה
  (לא יותר מ-~6 פריטים מדורגים, אחרת נראה איטי).

## 3. ספרייה — מה קיים בפרויקט (להשתמש, לא להמציא מחדש)
- **`<Reveal>`** (`components/reveal.tsx`) — fade/slide-up בכניסה לגלילה
  (IntersectionObserver). props: `direction` (`up`/`down`/`left`/`right`/`scale`),
  `delay` (ms, ל-stagger). מכבד `prefers-reduced-motion`.
- **utility classes ב-globals.css**: `.animate-fade-up`, `.animate-fade-in`,
  `.animate-scale-in` (לכניסה בטעינה, למשל ה-Hero) — עם `animation-fill-mode: both`
  כך שתחת reduced-motion התוכן נשאר גלוי. שלב עם `[animation-delay:Nms]` ל-stagger.
- **`.btn-shine`** — הבזק אור אלכסוני שחולף על כפתור ב-hover (תחושת מתכת פרימיום).
- **`.link-underline`** — קו תחתון שנמתח ב-hover (origin מרכזי, ניטרלי-כיוון).
- **`.animate-hero-zoom`** — Ken Burns איטי לרקע ה-Hero.

## 4. נגישות בתנועה — חובה (לא אופציונלי)
- **`prefers-reduced-motion: reduce`** — ה-guard הגלובלי ב-globals.css מאפס
  משך אנימציות/מעברים. כל אנימציה חדשה חייבת להישאר במצב **גלוי וסופי** כשהיא
  מושבתת — לעולם לא להשאיר תוכן עם `opacity:0` קבוע שתלוי באנימציה כדי להופיע
  (להשתמש ב-`animation-fill-mode: both` + מצב בסיס גלוי, לא `opacity:0` קשיח).
- **ווידג'ט הנגישות** (`a11y-no-motion`) מאפס תנועה גם הוא — לוודא שזה ממשיך לעבוד.
- לבדוק תמיד את שני המצבים (reduced-motion דלוק/כבוי) לפני "סיימתי".
- אנימציות לא חוסמות אינטראקציה (אין pointer-events על שכבת קישוט; להשתמש ב-`pointer-events: none`).

## 5. תהליך עבודה (כמו מעצב)
1. **קונספט** — לנסח במשפט את שפת התנועה ("מינימליזם קינטי: כניסות עריכותיות,
   זום איטי, הבזק מתכתי"). לוודא שהוא תואם את `docs/DESIGN.md`.
2. **אינוונטר** — לאילו אלמנטים תנועה מוסיפה ערך (Hero, כפתורי CTA, גריד שירותים/גלריה,
   ניווט) ולאילו לא (טקסט גוף, טפסים — שם רק מצבי focus/validation).
3. **טוקנים** — להגדיר/לעדכן easing+duration ב-globals.css לפני קומפוננטות.
4. **מימוש** (סקיל `development`) — CSS-first; להוסיף תלות (framer-motion וכו')
   רק אם יש הצדקה ברורה ואישור — תלות = משקל bundle + שטח supply-chain (ראה `security`).
5. **בדיקה** (`qa`) — ויזואלית עם Playwright (desktop+mobile, he/en/ar),
   reduced-motion דלוק/כבוי, אין layout shift, 60fps תחושתית.
6. תיעוד החלטות ב-`docs/DESIGN.md` + עדכון `ROADMAP.md`.

## 6. אנטי-דפוסים (להימנע)
- אנימציות ארוכות (>1s) שמעכבות את המשתמש.
- Parallax/scroll-jacking אגרסיבי ששובר גלילה טבעית.
- תנועה על כל אלמנט בדף (עייפות תנועה) — לבחור מבטאים.
- הנפשת מאפיינים שגורמים reflow (`width`, `top`, `left`).
- תוכן שמסתתר מאחורי אנימציה שלא רצה (כשל נגישות/SEO).
- הוספת ספריית אנימציה כבדה כשאפשר ב-CSS.

> זרימה: `planning → ui-ux (קונספט+טוקנים) → development → security (אם תלות חדשה) → qa → ROADMAP`.
