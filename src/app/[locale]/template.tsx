/**
 * מעבר בין עמודים — "וילון גזירה". template.tsx נטען מחדש בכל ניווט (בניגוד
 * ל-layout), ולכן אנימציית ה-CSS של הווילון רצה בכל מעבר עמוד. שני פאנלים כהים
 * נפגשים במרכז עם מספריים שגוזרות, ואז נפתחים (top מעלה / bottom מטה) וחושפים
 * את העמוד החדש. כולו CSS — אין צורך ב-client JS. דקורטיבי (aria-hidden) ו-
 * pointer-events:none כך שלא חוסם אינטראקציה. תחת prefers-reduced-motion הווילון
 * נשאר במצב "פתוח" (מצב הבסיס) — בלי מעבר.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <div className="page-curtain" aria-hidden="true">
        <span className="page-curtain__panel page-curtain__panel--top" />
        <span className="page-curtain__panel page-curtain__panel--bottom" />
        <span className="page-curtain__scissors">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <g className="scissors-blade curtain-blade-r">
              <circle cx="15.5" cy="5" r="2.3" />
              <path
                d="M12.9,10.2 C13.3,12 13.0,16 12.3,19.5 C12.15,20.2 11.85,20.6 11.6,21 C11.4,20.5 11.55,18 11.7,15 C11.85,12.5 11.6,10.6 11.1,10.1 C11.5,9.85 12.5,9.85 12.9,10.2 Z"
                fill="currentColor"
                stroke="none"
              />
            </g>
            <g className="scissors-blade curtain-blade-l">
              <circle cx="8.5" cy="5" r="2.3" />
              <path
                d="M11.1,10.2 C10.7,12 11.0,16 11.7,19.5 C11.85,20.2 12.15,20.6 12.4,21 C12.6,20.5 12.45,18 12.3,15 C12.15,12.5 12.4,10.6 12.9,10.1 C12.5,9.85 11.5,9.85 11.1,10.2 Z"
                fill="currentColor"
                stroke="none"
              />
            </g>
            <circle cx="12" cy="10" r="0.9" fill="currentColor" stroke="none" />
          </svg>
        </span>
      </div>
    </>
  );
}
