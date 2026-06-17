import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/section-heading";
import { ImagePlaceholder } from "@/components/image-placeholder";

export const metadata: Metadata = {
  title: "אודות",
  description: "הסיפור של Restyle — מספרה, אקדמיה וחנות פרימיום.",
};

export default function AboutPage() {
  return (
    <Container className="py-20">
      <SectionHeading
        eyebrow="הסיפור שלנו"
        title="יותר ממספרה"
        description="Restyle נוסדה מתוך אמונה שעיצוב שיער הוא מקצוע — שילוב של אומנות, טכניקה ושירות אישי."
      />

      <div className="mt-12 grid items-start gap-12 lg:grid-cols-2">
        <ImagePlaceholder label="תמונת הצוות" className="aspect-[4/3] rounded-lg" />
        <div className="space-y-6 text-neutral-300">
          <p>
            התחלנו כסטודיו קטן עם חזון פשוט: לתת לכל לקוח חוויה מדויקת ואישית, ברמה שמוכרת
            ממספרות הבוטיק הטובות בעולם. עם השנים, Restyle צמחה למותג שמשלב מספרה, אקדמיה
            להכשרת מעצבי שיער, וחנות מוצרי טיפוח נבחרים.
          </p>
          <p>
            הצוות שלנו מורכב ממעצבי שיער מוסמכים ומנוסים, שמחויבים להמשיך ולהתפתח — ומעבירים
            את הידע הזה גם לדור הבא של אנשי המקצוע באקדמיה שלנו.
          </p>
        </div>
      </div>
    </Container>
  );
}
