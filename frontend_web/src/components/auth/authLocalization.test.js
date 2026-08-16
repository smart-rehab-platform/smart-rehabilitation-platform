import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createTranslator } from "../../i18n/index.js";
import {
  formatAuthExperienceYears,
  getAuthCreateAccountLabel,
  getAuthInvalidEmailMessage,
  getAuthRoleLabel,
  getAuthSignInLabel,
  getPasswordStrength,
  getStrongPasswordMessage,
  validateWizardForSubmission,
} from "./authLocalization.js";

describe("authLocalization", () => {
  const translateEn = createTranslator("en");
  const translateAr = createTranslator("ar");

  it("translates sign in labels EN/AR", () => {
    assert.equal(getAuthSignInLabel(translateEn), "Sign In");
    assert.equal(getAuthSignInLabel(translateAr), "تسجيل الدخول");
    assert.equal(getAuthCreateAccountLabel(translateEn), "Create Account");
    assert.equal(getAuthCreateAccountLabel(translateAr), "إنشاء حساب");
  });

  it("translates signup role labels and descriptions", () => {
    assert.equal(getAuthRoleLabel("parent", translateEn), "Parent");
    assert.equal(getAuthRoleLabel("parent", translateAr), "ولي الأمر");
    assert.equal(getAuthRoleLabel("specialist", translateEn), "Specialist");
    assert.equal(getAuthRoleLabel("specialist", translateAr), "الأخصائي");
    assert.equal(translateEn("auth.roles.parentDescription").length > 0, true);
    assert.equal(translateAr("auth.roles.parentDescription"), "تابع تقدم طفلك، تواصل مع الأخصائيين، وأكمل تمارين المنزل.");
  });

  it("translates forgot, reset, and verify email labels", () => {
    assert.equal(translateEn("auth.forgotPassword.title"), "Forgot Password");
    assert.equal(translateAr("auth.forgotPassword.title"), "نسيت كلمة المرور");
    assert.equal(translateEn("auth.resetPassword.title"), "Reset Password");
    assert.equal(translateAr("auth.resetPassword.title"), "إعادة تعيين كلمة المرور");
    assert.equal(translateEn("auth.verifyEmail.checkTitle"), "Check Your Email");
    assert.equal(translateAr("auth.verifyEmail.checkTitle"), "تحقق من بريدك الإلكتروني");
  });

  it("translates auth validation labels", () => {
    assert.equal(getAuthInvalidEmailMessage(translateAr), "عنوان بريد إلكتروني غير صالح");
    assert.match(getStrongPasswordMessage(translateAr), /8 أحرف/);
    const strength = getPasswordStrength("Aa1!aaaa", translateAr);
    assert.equal(strength.isStrong, true);
    assert.equal(strength.rules[0].label, "8 أحرف على الأقل");
  });

  it("preserves backend role enum values during wizard validation", () => {
    const result = validateWizardForSubmission(
      {
        role: "parent",
        full_name: "",
        email: "bad",
        phone: "",
        password: "",
        confirmPassword: "",
        acceptedTerms: false,
      },
      translateEn,
    );

    assert.equal(result.valid, false);
    assert.equal(result.step, 2);
  });

  it("falls back to English when translator is unavailable", () => {
    assert.equal(getAuthSignInLabel(null), "Sign In");
    assert.equal(formatAuthExperienceYears(3, null), "3 years");
  });

  it("formats experience years with locale", () => {
    assert.equal(formatAuthExperienceYears(1, translateEn), "1 year");
    assert.equal(formatAuthExperienceYears(3, translateAr), "3 سنوات");
  });

  it("renders auth hero Arabic headline as one natural sentence", () => {
    const line1 = translateAr("auth.hero.leadLine1");
    const highlight = translateAr("auth.hero.leadHighlight");
    const line2 = translateAr("auth.hero.leadLine2");
    const headline = `${line1} ${highlight}${line2 ? ` ${line2}` : ""}`.replace(/\s+/g, " ").trim();

    assert.equal(headline, "نُمكّن كل رحلة إعادة التأهيل");
  });
});
