import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/section-heading";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "הצהרת נגישות",
  description: "הצהרת הנגישות של אתר Restyle — רמת התאמה, הסדרים ופרטי רכז נגישות.",
};

const { coordinatorName, phone, email, lastUpdated } = siteConfig.accessibility;

export default function AccessibilityPage() {
  return (
    <Container className="py-20">
      <SectionHeading eyebrow="מחויבות לכולם" title="הצהרת נגישות" />

      <div className="mt-10 max-w-3xl space-y-8 text-neutral-300">
        <p>
          מספרת Restyle רואה חשיבות רבה במתן שירות שוויוני לכלל הלקוחות, ופועלת להנגשת אתר
          האינטרנט שלה כדי לאפשר שימוש נוח וזמין גם לאנשים עם מוגבלות.
        </p>

        <section>
          <h2 className="font-display text-xl font-bold text-white">רמת הנגישות באתר</h2>
          <p className="mt-3">
            האתר הונגש בהתאם להוראות תקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות
            לשירות), התשע&quot;ג–2013, ובהתאם לתקן הישראלי ת&quot;י 5568 המבוסס על הנחיות
            הנגישות לתכני אינטרנט WCAG 2.0 ברמה AA.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-white">הסדרי הנגישות באתר</h2>
          <ul className="mt-3 list-disc space-y-2 pr-5">
            <li>תפריט נגישות זמין בכל עמודי האתר (כפתור קבוע בפינת המסך).</li>
            <li>אפשרות להגדלת והקטנת גודל הטקסט.</li>
            <li>מצבי ניגודיות גבוהה וגווני אפור.</li>
            <li>הדגשת קישורים ופונט קריא.</li>
            <li>עצירת אנימציות ותנועה.</li>
            <li>סמן עכבר מוגדל.</li>
            <li>קישור &quot;דלג לתוכן הראשי&quot; וניווט מלא באמצעות מקלדת.</li>
            <li>מבנה סמנטי, טקסט חלופי לתמונות וסימון מצב מיקוד (focus) ברור.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-white">מגבלות ידועות</h2>
          <p className="mt-3">
            ייתכן שחלקים מסוימים באתר טרם הונגשו במלואם. אנו ממשיכים לשפר את הנגישות באופן
            שוטף. אם נתקלתם בתוכן שאינו נגיש — נשמח שתעדכנו אותנו ונפעל לתקן בהקדם.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-white">פניות בנושא נגישות</h2>
          <p className="mt-3">
            לכל בקשה, הצעה או דיווח על תקלת נגישות, ניתן לפנות לרכז/ת הנגישות:
          </p>
          <dl className="mt-4 space-y-2">
            <div className="flex gap-3">
              <dt className="font-medium text-white">שם:</dt>
              <dd>{coordinatorName}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="font-medium text-white">טלפון:</dt>
              <dd>
                <a href={`tel:${phone}`} className="hover:text-accent">
                  {phone}
                </a>
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="font-medium text-white">אימייל:</dt>
              <dd>
                <a href={`mailto:${email}`} className="hover:text-accent">
                  {email}
                </a>
              </dd>
            </div>
          </dl>
        </section>

        <p className="text-sm text-neutral-500">הצהרת נגישות זו עודכנה בתאריך {lastUpdated}.</p>
      </div>
    </Container>
  );
}
