import { test, expect } from "@playwright/test";
import { registrationSchema } from "../../src/lib/schemas";

// The required fields below are the ones the signed participation agreement's
// questionnaire asks for; the blank ones are extras the paper form does not
// collect and must therefore stay optional.
const validRegistration = {
  parentName: "Test Parent",
  parentIdNo: "",
  parentRelationship: "mother",
  parentEmail: "parent@example.com",
  parentPhone: "+90 555 123 4567", // WhatsApp
  parentAddress: "",
  childName: "Test Child",
  childBirthDate: "2018-04-12",
  childGender: "female",
  childHealthNotes: "",
  emergencyContact: "Grandmother, +90 555 987 6543",
  authorizedPickup: "Mother; Grandmother Ayşe, +90 555 987 6543",
  branch: "painting",
  packageId: "pack8",
  preferredLanguage: "en",
  message: "",
  privacyNoticeAccepted: true,
  termsAccepted: true,
  consentHealth: false,
  consentMediaWebsite: false,
  consentMediaSocial: false,
};

test.describe("registration validation", () => {
  test("accepts a submission with only the genuinely optional fields blank", () => {
    expect(registrationSchema.safeParse(validRegistration).success).toBe(true);
  });

  test("still rejects invalid select values", () => {
    expect(
      registrationSchema.safeParse({
        ...validRegistration,
        parentRelationship: "friend",
        childGender: "unknown",
      }).success,
    ).toBe(false);
  });

  // Questionnaire fields from the signed agreement. Dropping any of them would
  // leave the web record thinner than the paper one it is supposed to mirror.
  for (const field of [
    "parentEmail",
    "childBirthDate",
    "emergencyContact",
    "authorizedPickup",
    "packageId",
    "parentRelationship",
    "childGender",
  ] as const) {
    test(`rejects a submission missing ${field}`, () => {
      expect(
        registrationSchema.safeParse({ ...validRegistration, [field]: "" }).success,
      ).toBe(false);
    });
  }

  test("rejects a malformed email", () => {
    expect(
      registrationSchema.safeParse({ ...validRegistration, parentEmail: "not-an-email" }).success,
    ).toBe(false);
  });

  test("keeps website and social-media consent independent and optional", () => {
    const websiteOnly = registrationSchema.parse({
      ...validRegistration,
      consentMediaWebsite: true,
    });

    expect(websiteOnly.consentMediaWebsite).toBe(true);
    expect(websiteOnly.consentMediaSocial).toBe(false);
  });
});
