/**
 * namespaces ב-messages/*.json שניתנים לעריכה מ-Admin (Phase 8.4) — דרך
 * ContentBlock, ממוזג ל-messages ב-src/i18n/request.ts. לא כל namespace
 * נכלל: nav/footer/layout הם chrome מבני, ו-servicesData/academyData/
 * testimonialsData עברו ל-CRUD מבני (Service/Course/Testimonial, Phase 8.2/8.3).
 */
export const EDITABLE_NAMESPACES = [
  "home",
  "about",
  "accessibility",
  "privacy",
  "terms",
] as const;

export type EditableNamespace = (typeof EDITABLE_NAMESPACES)[number];

export function isEditableNamespace(value: string): value is EditableNamespace {
  return (EDITABLE_NAMESPACES as readonly string[]).includes(value);
}
