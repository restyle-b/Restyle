import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/section-heading";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "מדיניות פרטיות",
  description: "מדיניות הפרטיות של אתר Restyle — איזה מידע נאסף, כיצד נעשה בו שימוש וזכויותיכם.",
};

export default function PrivacyPage() {
  return (
    <Container className="py-20">
      <SectionHeading eyebrow="שקיפות ואמון" title="מדיניות פרטיות" />

      <div className="mt-10 max-w-3xl space-y-8 text-neutral-300">
        <p>
          מספרת Restyle (&quot;אנחנו&quot;) מכבדת את פרטיות המבקרים באתר. מדיניות זו מסבירה
          איזה מידע נאסף, למה הוא משמש, וכיצד תוכלו לממש את זכויותיכם. השימוש באתר מהווה
          הסכמה למדיניות זו.
        </p>

        <section>
          <h2 className="font-display text-xl font-bold text-white">איזה מידע נאסף</h2>
          <p className="mt-3">
            המידע היחיד הנאסף הוא הפרטים שאתם בוחרים למסור בטופס &quot;צור קשר&quot;: שם,
            כתובת אימייל, מספר טלפון (אופציונלי) ותוכן ההודעה. איננו אוספים מידע זה ללא
            מסירה יזומה מצדכם.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-white">מטרת השימוש במידע</h2>
          <p className="mt-3">
            המידע משמש אך ורק לצורך מענה לפנייתכם וחזרה אליכם. איננו עושים בו שימוש שיווקי
            ואיננו מעבירים אותו לצדדים שלישיים למטרות פרסום.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-white">העברת מידע לספקי שירות</h2>
          <p className="mt-3">
            לצורך תפעול האתר אנו נעזרים בספקי תשתית מקובלים: שירות אירוח האתר (Vercel) ושירות
            שליחת דואר אלקטרוני (Resend), שדרכו נשלחת אלינו הודעת הפנייה. ספקים אלו מעבדים את
            המידע אך ורק לצורך אספקת השירות.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-white">הגדרות נגישות ועוגיות</h2>
          <p className="mt-3">
            הגדרות תפריט הנגישות נשמרות באחסון המקומי (localStorage) של הדפדפן שלכם בלבד, אינן
            נשלחות אלינו ואינן מזהות אתכם. נכון למועד זה האתר אינו עושה שימוש בעוגיות מעקב או
            בכלי אנליטיקה. אם ייווסף בעתיד כלי כזה — מדיניות זו תעודכן בהתאם.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-white">אבטחת מידע</h2>
          <p className="mt-3">
            התקשורת עם האתר מאובטחת בהצפנה (HTTPS). אנו נוקטים אמצעים סבירים להגנה על המידע,
            אך אין באפשרותנו להבטיח הגנה מוחלטת מפני כל סיכון.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-white">זכויותיכם</h2>
          <p className="mt-3">
            בהתאם לחוק הגנת הפרטיות, התשמ&quot;א–1981, עומדת לכם הזכות לעיין במידע שנמסר
            אודותיכם, לבקש את תיקונו או מחיקתו. לפניות בנושא ניתן ליצור קשר:
          </p>
          <dl className="mt-4 space-y-2">
            <div className="flex gap-3">
              <dt className="font-medium text-white">טלפון:</dt>
              <dd>
                <a href={`tel:${siteConfig.contact.phone}`} className="hover:text-accent">
                  {siteConfig.contact.phone}
                </a>
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="font-medium text-white">אימייל:</dt>
              <dd>
                <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-accent">
                  {siteConfig.contact.email}
                </a>
              </dd>
            </div>
          </dl>
        </section>

        <p className="text-sm text-neutral-500">
          מדיניות פרטיות זו עודכנה בתאריך {siteConfig.accessibility.lastUpdated}.
        </p>
      </div>
    </Container>
  );
}
