/**
 * סלאגים של קורסי אקדמיית ReStyle (תוכן בלבד — ללא הרשמה/רכישה, זו הרחבה עתידית).
 * שם/תיאור/משך/רמה מתורגמים ב-messages.academyData.
 */
export const courseSlugs = [
  "barbering-foundations",
  "advanced-fades",
  "beard-design",
  "masterclass",
] as const;

export type CourseSlug = (typeof courseSlugs)[number];
