import { InstagramIcon } from "@/components/icons/instagram-icon";
import { cn } from "@/lib/utils";

const tileClass =
  "flex items-center gap-3 border border-line-light bg-white px-[18px] py-4 text-ink transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-[#c9c4b8] hover:shadow-[0_10px_24px_rgb(0_0_0/0.08)]";

function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="shrink-0">
      <path d="M6.62 10.79a15.5 15.5 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24 11.4 11.4 0 0 0 3.57.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.24 1.02l-2.2 2.2z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="shrink-0">
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.607z" />
    </svg>
  );
}

function WazeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M12 21s-7-5.2-7-11a7 7 0 0 1 14 0c0 5.8-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

/**
 * 4 כרטיסי יצירת קשר מהירה (טלפון/וואטסאפ/וייז/אינסטגרם) — עיצוב "כרטיס לבן
 * על רקע כהה" לפי handoff העיצוב מ-2026-07-03. גריד 2 עמודות, עמודה אחת
 * מתחת ל-480px. קישורים מגיעים מ-getContactLinks (מקור אמת יחיד).
 */
export function ContactTiles({
  tel,
  whatsapp,
  waze,
  instagram,
  labels,
}: {
  tel: { href: string; sub: string };
  whatsapp: { href: string; sub: string };
  waze: { href: string; sub: string };
  instagram?: { href: string; sub: string };
  labels: { call: string; whatsapp: string; waze: string; instagram: string };
}) {
  return (
    <div className="grid max-w-[460px] grid-cols-2 gap-3 max-[480px]:grid-cols-1">
      <a href={tel.href} className={tileClass}>
        <PhoneIcon />
        <div>
          <div className="text-[14.5px] font-bold">{labels.call}</div>
          <div className="text-[12.5px] text-[#8a8578]" dir="ltr">
            {tel.sub}
          </div>
        </div>
      </a>
      <a href={whatsapp.href} target="_blank" rel="noopener noreferrer" className={tileClass}>
        <WhatsAppIcon />
        <div>
          <div className="text-[14.5px] font-bold">{labels.whatsapp}</div>
          <div className="text-[12.5px] text-[#8a8578]">{whatsapp.sub}</div>
        </div>
      </a>
      <a href={waze.href} target="_blank" rel="noopener noreferrer" className={tileClass}>
        <WazeIcon />
        <div>
          <div className="text-[14.5px] font-bold">{labels.waze}</div>
          <div className="text-[12.5px] text-[#8a8578]">{waze.sub}</div>
        </div>
      </a>
      {instagram && (
        <a href={instagram.href} target="_blank" rel="noopener noreferrer" className={tileClass}>
          <InstagramIcon className={cn("h-5 w-5 shrink-0")} />
          <div>
            <div className="text-[14.5px] font-bold">{labels.instagram}</div>
            <div className="text-[12.5px] text-[#8a8578]" dir="ltr">
              {instagram.sub}
            </div>
          </div>
        </a>
      )}
    </div>
  );
}
