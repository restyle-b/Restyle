import "../globals.css";

// /webgl-demo יושב מחוץ ל-[locale] (לא מתורגם, דמו טכני בלבד), ולכן אין לו
// root layout משותף עם שאר האתר — הוא חייב להגדיר <html>/<body> בעצמו,
// אחרת Tailwind (globals.css) לא נטען.
export default function WebglDemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
