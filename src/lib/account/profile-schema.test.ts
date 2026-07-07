import { describe, expect, it } from "vitest";
import { createProfileSchema } from "./profile-schema";

const messages = { nameTooShort: "name too short", phoneTooShort: "phone too short" };

describe("createProfileSchema", () => {
  const schema = createProfileSchema(messages);

  it("accepts a valid name+phone and trims whitespace", () => {
    const result = schema.safeParse({ name: "  ישראל ישראלי  ", phone: " 0501234567 " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("ישראל ישראלי");
      expect(result.data.phone).toBe("0501234567");
    }
  });

  it("rejects a name shorter than 2 chars", () => {
    const result = schema.safeParse({ name: "א", phone: "0501234567" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(messages.nameTooShort);
    }
  });

  it("rejects a phone shorter than 7 chars", () => {
    const result = schema.safeParse({ name: "ישראל ישראלי", phone: "123" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(messages.phoneTooShort);
    }
  });

  it("rejects names/phones exceeding max length", () => {
    const result = schema.safeParse({ name: "א".repeat(101), phone: "0" });
    expect(result.success).toBe(false);
  });
});
