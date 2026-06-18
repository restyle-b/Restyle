import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/section-heading";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "תקנון ותנאי שימוש",
  description: "תנאי השימוש באתר Restyle.",
};

export default function TermsPage() {
  return (
    <Container className="py-20">
      <SectionHeading eyebrow="הכללים שלנו" title="תקנון ותנאי שימוש" />

      <div className="mt-10 max-w-3xl space-y-8 text-neutral-300">
        <p>
          ברוכים הבאים לאתר Restyle. השימוש באתר כפוף לתנאים שלהלן. אנא קראו אותם בעיון;
          המשך השימוש באתר מהווה הסכמה לתנאים אלה.
        </p>

        <section>
          <h2 className="font-display text-xl font-bold text-white">אופי האתר</h2>
          <p className="mt-3">
            האתר משמש להצגת המספרה, השירותים והאקדמיה של Restyle וליצירת קשר. קביעת תורים
            מתבצעת באמצעות אפליקציית Restyle הייעודית, אליה מפנים הקישורים שבאתר.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-white">תוכן ומידע</h2>
          <p className="mt-3">
            אנו משתדלים שהמידע באתר (שירותים, קורסים, שעות פעילות ופרטי קשר) יהיה מדויק
            ומעודכן, אך ייתכנו שינויים, טעויות או אי-דיוקים. המידע אינו מהווה התחייבות, וייתכן
            שיתעדכן מעת לעת ללא הודעה מוקדמת. מחירים ופרטי קורסים סופיים יימסרו בפנייה ישירה.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-white">קניין רוחני</h2>
          <p className="mt-3">
            כל התכנים באתר — לרבות טקסטים, עיצוב, לוגו ותמונות — הם רכושה של Restyle ומוגנים
            בזכויות יוצרים. אין להעתיק, לשכפל או לעשות בהם שימוש מסחרי ללא אישור בכתב.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-white">פרטיות</h2>
          <p className="mt-3">
            השימוש במידע שנמסר באתר כפוף ל
            <Link href="/privacy" className="text-accent hover:underline">
              מדיניות הפרטיות
            </Link>{" "}
            שלנו.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-white">יצירת קשר</h2>
          <p className="mt-3">
            לשאלות בנוגע לתקנון ניתן לפנות אלינו בטלפון{" "}
            <a href={`tel:${siteConfig.contact.phone}`} className="hover:text-accent">
              {siteConfig.contact.phone}
            </a>{" "}
            או באימייל{" "}
            <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-accent">
              {siteConfig.contact.email}
            </a>
            .
          </p>
        </section>

        <p className="text-sm text-neutral-500">
          תקנון זה עודכן בתאריך {siteConfig.accessibility.lastUpdated}.
        </p>
      </div>
    </Container>
  );
}
