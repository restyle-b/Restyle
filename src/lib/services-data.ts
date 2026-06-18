/** סלאגים של שירותי המספרה — שם/תיאור מתורגמים ב-messages.servicesData. */
export const serviceSlugs = ["haircut", "beard", "coloring", "treatment", "kids", "vip"] as const;

export type ServiceSlug = (typeof serviceSlugs)[number];
