import { test, expect } from "@playwright/test";
import {
  STEPS,
  advance,
  askFor,
  birthDate,
  nextStep,
  stepByKey,
  toRegistrationInput,
  type Answers,
  type Input,
  type Lang,
} from "../../src/lib/telegram/flow";
import { registrationSchema } from "../../src/lib/schemas";

/**
 * The Telegram registration conversation, driven end to end without a bot
 * token or a database. flow.ts is deliberately pure so this is possible: if the
 * questions and the schema ever drift apart, a parent registering by chat gets
 * a record the studio cannot act on, and these tests are where that shows up.
 */

const LANGS: Lang[] = ["tr", "en", "ru"];

/** A complete, valid answer for every question in the flow. */
const ANSWERS: Record<string, Input> = {
  parentName: { kind: "text", text: "Ayşe Yılmaz" },
  parentRelationship: { kind: "choice", step: "parentRelationship", value: "mother" },
  parentPhone: { kind: "text", text: "+90 532 123 45 67" },
  parentEmail: { kind: "text", text: "ayse@example.com" },
  parentIdNo: { kind: "skip", step: "parentIdNo" },
  parentAddress: { kind: "skip", step: "parentAddress" },
  childName: { kind: "text", text: "Elif Yılmaz" },
  childBirthDate: { kind: "text", text: "12.04.2018" },
  childGender: { kind: "choice", step: "childGender", value: "female" },
  emergencyContact: { kind: "text", text: "Fatma, +90 532 987 65 43" },
  authorizedPickup: { kind: "text", text: "Mother; grandmother Fatma" },
  childHealthNotes: { kind: "skip", step: "childHealthNotes" },
  consentHealth: { kind: "choice", step: "consentHealth", value: "yes" },
  branch: { kind: "choice", step: "branch", value: "painting" },
  packageId: { kind: "choice", step: "packageId", value: "pack8" },
  message: { kind: "skip", step: "message" },
  privacyNoticeAccepted: { kind: "choice", step: "privacyNoticeAccepted", value: "yes" },
  termsAccepted: { kind: "choice", step: "termsAccepted", value: "yes" },
  consentMediaWebsite: { kind: "choice", step: "consentMediaWebsite", value: "no" },
  consentMediaSocial: { kind: "choice", step: "consentMediaSocial", value: "yes" },
};

interface RunResult {
  answers: Answers;
  visited: string[];
}

/** Walks the conversation to the review screen, failing on any unexpected retry. */
function run(lang: Lang, overrides: Record<string, Input> = {}): RunResult {
  const inputs = { ...ANSWERS, ...overrides };
  let answers: Answers = {};
  let step = nextStep(answers);
  const visited: string[] = [];

  for (let guard = 0; guard < 60; guard++) {
    if (!step) throw new Error("ran out of steps before reaching review");
    visited.push(step.key);

    const input = inputs[step.key];
    if (!input) throw new Error(`no test answer defined for step "${step.key}"`);

    const result = advance(step, answers, input, lang);
    answers = result.answers;

    if (result.status === "review") return { answers, visited };
    if (result.status === "retry") throw new Error(`unexpected retry at "${step.key}"`);
    step = result.step;
  }

  throw new Error("conversation did not terminate");
}

test.describe("telegram registration flow", () => {
  for (const lang of LANGS) {
    test(`completes in ${lang} and produces a payload the schema accepts`, () => {
      const { answers } = run(lang);
      const parsed = registrationSchema.safeParse(toRegistrationInput(answers, lang));

      if (!parsed.success) {
        throw new Error(
          `schema rejected the collected answers: ${parsed.error.issues
            .map((i) => `${i.path.join(".")} ${i.message}`)
            .join("; ")}`,
        );
      }

      expect(parsed.data.preferredLanguage).toBe(lang);
      expect(parsed.data.packageId).toBe("pack8");
      expect(parsed.data.childBirthDate).toBe("2018-04-12");
      // Independent choices must survive as two distinct values.
      expect(parsed.data.consentMediaWebsite).toBe(false);
      expect(parsed.data.consentMediaSocial).toBe(true);
    });

    test(`asks every question in ${lang} with text, and an example where relevant`, () => {
      for (const step of STEPS) {
        const reply = askFor(step, lang, { childHealthNotes: "x" });
        expect(reply.text.length).toBeGreaterThan(10);
        if (step.example) expect(reply.text).toContain(step.example[lang]);
        // Anything that isn't free text must offer buttons to tap.
        if (step.kind !== "text") expect(reply.buttons?.length).toBeGreaterThan(0);
        if (step.optional) {
          const labels = reply.buttons?.flat().map((b) => b.label) ?? [];
          expect(labels.some((l) => /Atla|Skip|Пропустить/.test(l))).toBe(true);
        }
      }
    });
  }

  test("skips the health-consent question when no health note is given", () => {
    const { visited } = run("en");
    expect(visited).not.toContain("consentHealth");
  });

  test("asks for health consent once a health note is entered", () => {
    const { visited, answers } = run("en", {
      childHealthNotes: { kind: "text", text: "Peanut allergy" },
    });
    expect(visited).toContain("consentHealth");
    expect(answers.childHealthNotes).toBe("Peanut allergy");
    expect(answers.consentHealth).toBe("yes");
  });

  test("declining health consent drops the note instead of blocking", () => {
    const { answers } = run("en", {
      childHealthNotes: { kind: "text", text: "Peanut allergy" },
      consentHealth: { kind: "choice", step: "consentHealth", value: "no" },
    });
    expect(answers.childHealthNotes).toBe("");
    const parsed = registrationSchema.safeParse(toRegistrationInput(answers, "en"));
    expect(parsed.success).toBe(true);
  });

  test("rejects an invalid answer and asks the same question again", () => {
    const step = stepByKey("parentEmail")!;
    const result = advance(step, {}, { kind: "text", text: "not-an-email" }, "en");

    expect(result.status).toBe("retry");
    if (result.status !== "retry") return;
    expect(result.step.key).toBe("parentEmail");
    expect(result.answers.parentEmail).toBeUndefined();
    expect(result.replies[0].text).toContain("⚠️");
  });

  test("refuses to skip a required question", () => {
    const step = stepByKey("childName")!;
    const result = advance(step, {}, { kind: "skip", step: "childName" }, "en");
    expect(result.status).toBe("retry");
  });

  test("cannot decline the privacy notice or the terms", () => {
    for (const key of ["privacyNoticeAccepted", "termsAccepted"]) {
      const step = stepByKey(key)!;
      const result = advance(step, {}, { kind: "choice", step: key, value: "no" }, "en");
      expect(result.status, `${key} must not be declinable`).toBe("retry");
    }
  });

  test("ignores a stale button from an earlier question", () => {
    const step = stepByKey("branch")!;
    const result = advance(
      step,
      { parentName: "Ayşe" },
      { kind: "choice", step: "childGender", value: "male" },
      "en",
    );
    expect(result.status).toBe("retry");
    expect(result.answers.childGender).toBeUndefined();
  });

  test("tells the user to tap a button when they type at a choice question", () => {
    const step = stepByKey("branch")!;
    const result = advance(step, {}, { kind: "text", text: "painting please" }, "en");
    expect(result.status).toBe("retry");
    expect(result.answers.branch).toBeUndefined();
  });

  test("accepts typed skip words for optional questions", () => {
    const step = stepByKey("parentAddress")!;
    for (const word of ["skip", "Atla", "пропустить", "-"]) {
      const result = advance(step, {}, { kind: "text", text: word }, "en");
      expect(result.status, `"${word}" should skip`).toBe("ask");
      if (result.status === "ask") expect(result.answers.parentAddress).toBe("");
    }
  });

  test("normalises the date formats parents actually type", () => {
    for (const raw of ["12.04.2018", "12/04/2018", "2018-04-12", "2018-4-12"]) {
      const result = birthDate(raw);
      expect(result.ok, `${raw} should parse`).toBe(true);
      if (result.ok) expect(result.value).toBe("2018-04-12");
    }
  });

  test("rejects impossible or future birth dates", () => {
    for (const raw of ["31.02.2018", "2200-01-01", "hello", "12.04", "0000-00-00"]) {
      expect(birthDate(raw).ok, `${raw} should be rejected`).toBe(false);
    }
  });

  test("every step the schema requires is actually asked", () => {
    const asked = new Set(STEPS.map((s) => s.key));
    for (const key of [
      "parentName",
      "parentRelationship",
      "parentPhone",
      "parentEmail",
      "childName",
      "childBirthDate",
      "childGender",
      "emergencyContact",
      "authorizedPickup",
      "branch",
      "packageId",
      "privacyNoticeAccepted",
      "termsAccepted",
    ]) {
      expect(asked.has(key), `flow never asks for required field "${key}"`).toBe(true);
    }
  });

  test("callback payloads stay inside Telegram's 64-byte limit", () => {
    for (const step of STEPS) {
      for (const button of askFor(step, "ru", { childHealthNotes: "x" }).buttons?.flat() ?? []) {
        if ("data" in button) {
          expect(Buffer.byteLength(button.data, "utf8")).toBeLessThanOrEqual(64);
        }
      }
    }
  });
});
