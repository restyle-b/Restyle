import { describe, expect, it } from "vitest";
import { createAddressSchema } from "./address-schema";

const messages = {
  labelRequired: "label required",
  lineRequired: "line required",
  cityRequired: "city required",
};

describe("createAddressSchema", () => {
  const schema = createAddressSchema(messages);

  it("accepts a full valid address", () => {
    const result = schema.safeParse({
      label: "בית",
      line: "הרצל 1",
      city: "תל אביב",
      notes: "קומה 3",
      isDefault: true,
    });
    expect(result.success).toBe(true);
  });

  it("accepts a minimal address without notes/isDefault", () => {
    const result = schema.safeParse({ label: "עבודה", line: "אלנבי 5", city: "חיפה" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isDefault).toBeUndefined();
    }
  });

  it("rejects an empty label", () => {
    const result = schema.safeParse({ label: "", line: "אלנבי 5", city: "חיפה" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(messages.labelRequired);
    }
  });

  it("rejects an empty line", () => {
    const result = schema.safeParse({ label: "בית", line: "", city: "חיפה" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(messages.lineRequired);
    }
  });

  it("rejects an empty city", () => {
    const result = schema.safeParse({ label: "בית", line: "אלנבי 5", city: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(messages.cityRequired);
    }
  });
});
