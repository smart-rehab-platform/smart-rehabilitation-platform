import assert from "node:assert/strict";
import { describe, it } from "node:test";
import ar from "../../../i18n/ar.json" with { type: "json" };
import en from "../../../i18n/en.json" with { type: "json" };
import {
  applySpecialistProfileLocalization,
  getProfileRoleLabel,
  getSpecialistProfilePageLabels,
  getSpecialistProfileValidationMessages,
} from "./specialistProfileLocalization.js";
import { validateSpecialistProfileForm } from "./specialistProfileFormUtils.js";

function tFactory(locale) {
  const messages = locale === "ar" ? ar : en;
  return (key, params) => {
    const parts = key.split(".");
    let value = messages;
    for (const part of parts) {
      value = value?.[part];
    }
    if (typeof value !== "string") {
      return key;
    }
    return Object.entries(params || {}).reduce(
      (result, [name, paramValue]) => result.replace(`{${name}}`, String(paramValue)),
      value,
    );
  };
}

describe("specialistProfileLocalization", () => {
  it("maps profile labels in EN/AR", () => {
    assert.equal(getSpecialistProfilePageLabels(tFactory("en")).title, "Profile");
    assert.equal(getSpecialistProfilePageLabels(tFactory("ar")).title, "الملف الشخصي");
    assert.equal(getSpecialistProfilePageLabels(tFactory("ar")).fullName, "الاسم الكامل");
  });

  it("maps edit profile labels in EN/AR", () => {
    assert.equal(getSpecialistProfilePageLabels(tFactory("en")).editTitle, "Edit Profile");
    assert.equal(getSpecialistProfilePageLabels(tFactory("ar")).editTitle, "تعديل الملف الشخصي");
    assert.equal(getSpecialistProfilePageLabels(tFactory("ar")).saveChanges, "حفظ التغييرات");
  });

  it("preserves existing user values unchanged", () => {
    const profile = applySpecialistProfileLocalization({
      fullName: "Dr. Sami Nasser",
      email: "sami@example.com",
      specialization: "Speech Therapy",
      bio: "Experienced clinician",
      role: "specialist",
    }, { t: tFactory("ar") });
    assert.equal(profile.fullName, "Dr. Sami Nasser");
    assert.equal(profile.specialization, "Speech Therapy");
    assert.equal(profile.bio, "Experienced clinician");
  });

  it("maps validation messages in EN/AR", () => {
    const enErrors = validateSpecialistProfileForm({ fullName: "" }, tFactory("en"));
    const arErrors = validateSpecialistProfileForm({ fullName: "" }, tFactory("ar"));
    assert.equal(enErrors.fullName, "Full name is required");
    assert.equal(arErrors.fullName, "الاسم الكامل مطلوب");
    assert.equal(
      getSpecialistProfileValidationMessages(tFactory("ar")).yearsInvalid,
      "يجب أن تكون سنوات الخبرة رقمًا صالحًا",
    );
  });

  it("localizes role display while keeping raw role value", () => {
    const profile = applySpecialistProfileLocalization({
      role: "specialist",
      roleLabel: "Specialist",
    }, { t: tFactory("ar") });
    assert.equal(profile.role, "specialist");
    assert.equal(getProfileRoleLabel("specialist", tFactory("ar")), "الأخصائي");
    assert.equal(profile.roleLabel, "الأخصائي");
  });

  it("falls back to English when translation key is missing", () => {
    const brokenT = () => "specialist.profile.title";
    assert.equal(getSpecialistProfilePageLabels(brokenT).title, "Profile");
  });
});
