import { test, expect } from "@playwright/test";
import { registrationSchema } from "../../src/lib/schemas";

const validRegistration = {
  parentName: "Test Parent",
  parentIdNo: "",
  parentRelationship: "",
  parentEmail: "",
  parentPhone: "+90 555 123 4567",
  parentAddress: "",
  childName: "Test Child",
  childBirthDate: "",
  childGender: "",
  childHealthNotes: "",
  emergencyContact: "",
  branch: "painting",
  packageId: "",
  preferredLanguage: "en",
  message: "",
  consentKvkk: true,
  consentLiability: true,
  consentMedia: false,
};

test.describe("registration validation", () => {
  test("accepts blank optional relationship and gender fields", () => {
    expect(registrationSchema.safeParse(validRegistration).success).toBe(true);
  });

  test("still rejects invalid optional select values", () => {
    expect(
      registrationSchema.safeParse({
        ...validRegistration,
        parentRelationship: "friend",
        childGender: "unknown",
      }).success,
    ).toBe(false);
  });
});
