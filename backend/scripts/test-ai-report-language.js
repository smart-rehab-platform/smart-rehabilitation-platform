/**
 * Language validation, prompt, fallback, and Arabic PDF smoke tests.
 * Run: node scripts/test-ai-report-language.js
 */
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const {
  DEFAULT_AI_REPORT_LANGUAGE,
  normalizeAiReportLanguage,
  parseAiReportLanguage,
} = require("../src/modules/aiReports/aiReportLanguage");
const {
  validateGenerateReport,
} = require("../src/modules/aiReports/aiReports.validation");
const {
  buildReportPrompt,
  buildRuleBasedReportFallback,
} = require("../src/modules/aiReports/aiReports.service");
const {
  addAiReportHeader,
  addAiSectionTitle,
  addAiReportInformation,
  addAiParagraph,
  addAiBulletList,
  AI_PDF_LAYOUT,
  preparePdfText,
} = require("../src/modules/aiReports/aiReportPdf.generator");
const {
  getPdfLabels,
  hasArabicFonts,
  preparePdfDisplayText,
} = require("../src/modules/aiReports/aiReportPdf.i18n");

let passed = 0;
const pass = (label) => {
  passed += 1;
  console.log(`  ✓ ${label}`);
};

const yesterday = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
};

const lastWeekStart = () => {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date.toISOString().slice(0, 10);
};

const runValidate = (body) =>
  new Promise((resolve) => {
    const req = { body: { ...body } };
    const res = {
      statusCode: 200,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.body = payload;
        resolve({ req, res, next: false });
        return this;
      },
    };
    validateGenerateReport(req, res, () => resolve({ req, res, next: true }));
  });

const emptyContext = {
  diagnoses: [],
  assessments: [],
  treatmentPlans: [],
  goals: [],
  goalProgress: [],
  assignedExercises: [],
  exerciseSubmissions: [],
  exerciseReviews: [],
  progressSnapshots: [],
  speechAnalyses: [],
  aiRecommendations: [],
  aiProgressNotes: [],
};

(async () => {
  assert.strictEqual(DEFAULT_AI_REPORT_LANGUAGE, "en");
  assert.strictEqual(parseAiReportLanguage(undefined), "en");
  assert.strictEqual(parseAiReportLanguage("en-US"), "en");
  assert.strictEqual(parseAiReportLanguage("ar-SA"), "ar");
  assert.strictEqual(parseAiReportLanguage("ar_PS"), "ar");
  assert.strictEqual(parseAiReportLanguage("fr"), null);
  assert.strictEqual(normalizeAiReportLanguage("ar", { fallbackToDefault: true }), "ar");
  assert.strictEqual(normalizeAiReportLanguage("xx", { fallbackToDefault: true }), "en");
  pass("language parse/normalize accepts en/ar and rejects unsupported");

  const missing = await runValidate({
    patient_id: "p1",
    period_start: lastWeekStart(),
    period_end: yesterday(),
  });
  assert.strictEqual(missing.next, true);
  assert.strictEqual(missing.req.body.language, "en");
  pass("missing language defaults to en");

  const arabic = await runValidate({
    patient_id: "p1",
    period_start: lastWeekStart(),
    period_end: yesterday(),
    language: "ar-PS",
  });
  assert.strictEqual(arabic.next, true);
  assert.strictEqual(arabic.req.body.language, "ar");
  pass("generation validation normalizes ar-PS to ar");

  const bad = await runValidate({
    patient_id: "p1",
    period_start: lastWeekStart(),
    period_end: yesterday(),
    language: "fr",
  });
  assert.strictEqual(bad.next, false);
  assert.strictEqual(bad.res.statusCode, 400);
  pass("unsupported language is rejected");

  const promptAr = buildReportPrompt({
    patient: { full_name: "Test Patient" },
    context: emptyContext,
    type: "weekly",
    periodStart: lastWeekStart(),
    periodEnd: yesterday(),
    language: "ar",
  });
  assert.ok(promptAr.includes("Modern Standard Arabic"));
  assert.ok(promptAr.includes("Do NOT translate JSON property"));
  assert.ok(promptAr.includes('"language": "ar"'));
  pass("Gemini prompt receives Arabic language instruction");

  const promptEn = buildReportPrompt({
    patient: { full_name: "Test Patient" },
    context: emptyContext,
    type: "weekly",
    periodStart: lastWeekStart(),
    periodEnd: yesterday(),
    language: "en",
  });
  assert.ok(promptEn.includes("professional clinical English"));
  pass("English prompt preserves English narrative instruction");

  const fallbackAr = buildRuleBasedReportFallback({
    patient: { full_name: "أحمد" },
    context: emptyContext,
    type: "weekly",
    language: "ar",
  });
  assert.ok(Object.keys(fallbackAr).includes("executive_summary"));
  assert.ok(Object.keys(fallbackAr).includes("clinical_insights"));
  assert.ok(/[\u0600-\u06FF]/.test(fallbackAr.executive_summary));
  assert.ok(/[\u0600-\u06FF]/.test(fallbackAr.recommendations[0]));
  pass("Arabic fallback uses Arabic narrative with English JSON keys");

  const fallbackEn = buildRuleBasedReportFallback({
    patient: { full_name: "Omar" },
    context: emptyContext,
    type: "weekly",
    language: "en",
  });
  assert.ok(fallbackEn.executive_summary.includes("Omar"));
  assert.ok(!/[\u0600-\u06FF]/.test(fallbackEn.executive_summary));
  pass("English fallback remains English");

  assert.ok(hasArabicFonts(), "Arabic PDF fonts must be present");
  const arLabels = getPdfLabels("ar");
  assert.strictEqual(arLabels.brandTitle, "Smart Rehabilitation");
  assert.ok(/[\u0600-\u06FF]/.test(arLabels.executiveSummary));
  assert.ok(/[\u0600-\u06FF]/.test(arLabels.reportInformation));
  pass("Arabic PDF static labels localized (brand name unchanged)");

  const shaped = preparePdfDisplayText("الملخص التنفيذي", "ar");
  assert.ok(shaped.length > 0);
  assert.notStrictEqual(shaped, "الملخص التنفيذي");
  pass("Arabic PDF text is reshaped/reordered for correct glyph joining");

  {
    const fontkit = require("fontkit");
    const {
      prepareArabicVisualLine,
      splitMixedFontRuns,
      registerAiPdfFonts: reg,
      usesArabicFont,
    } = require("../src/modules/aiReports/aiReportPdf.i18n");
    const PDFDocument = require("pdfkit");
    const arabicFont = fontkit.openSync(
      require("path").join(__dirname, "../assets/fonts/NotoNaskhArabic-Regular.ttf")
    );
    const mixed =
      "يُظهر المريض تحسنًا مع ADHD بنسبة 50% في 21 أغسطس 2026.";
    const visual = prepareArabicVisualLine(mixed);
    const fonts = reg(new PDFDocument());
    const runs = splitMixedFontRuns(visual, { fonts });
    assert.ok(runs.some((run) => run.font.includes("Helvetica")), "Latin fallback run present");
    assert.ok(runs.some((run) => run.font.includes("Arabic")), "Arabic font run present");
    let missing = 0;
    for (const run of runs) {
      for (const ch of run.text) {
        const cp = ch.codePointAt(0);
        if (run.font.includes("Arabic")) {
          const glyph = arabicFont.glyphForCodePoint(cp);
          if (!glyph || glyph.id === 0) {
            missing += 1;
          }
        } else if (usesArabicFont(cp)) {
          missing += 1;
        }
      }
    }
    assert.strictEqual(missing, 0, "no missing glyphs in mixed Arabic/Latin line");
    pass("mixed Arabic + Latin/numbers use dual fonts with zero missing glyphs");
  }

  const outputDir = path.join(__dirname, "phase-b-fixtures");
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, "ai-report-arabic-smoke.pdf");

  await new Promise((resolve, reject) => {
    const pdf = new PDFDocument({ size: "A4", margin: AI_PDF_LAYOUT.pageMargin });
    const { registerAiPdfFonts, getPdfLabels: labelsFn } = require("../src/modules/aiReports/aiReportPdf.i18n");
    const fonts = registerAiPdfFonts(pdf);
    pdf.__aiPdfTheme = {
      language: "ar",
      isRtl: true,
      align: "right",
      fonts,
      labels: labelsFn("ar"),
    };

    const stream = fs.createWriteStream(outputPath);
    pdf.pipe(stream);

    addAiReportHeader(pdf);
    addAiSectionTitle(pdf, arLabels.reportInformation);
    addAiReportInformation(pdf, [
      [arLabels.patient, "أحمد علي"],
      [arLabels.reportType, "أسبوعي"],
      [arLabels.periodStart, "2026-08-01"],
      [arLabels.periodEnd, "2026-08-07"],
    ]);
    addAiSectionTitle(pdf, arLabels.executiveSummary);
    addAiParagraph(
      pdf,
      "يُظهر المريض تحسنًا واضحًا في الالتزام بالتمارين خلال الفترة المطلوبة مع حاجة لمتابعة نطق الأصوات المستهدفة."
    );
    addAiSectionTitle(pdf, arLabels.recommendations);
    addAiBulletList(pdf, [
      "الاستمرار في جلسات العلاج النطقي ثلاث مرات أسبوعيًا.",
      "مراجعة صعوبة التمارين المنزلية مع ولي الأمر.",
    ]);
    addAiSectionTitle(pdf, arLabels.nextSteps);
    addAiBulletList(pdf, ["جدولة متابعة بعد انتهاء دورة التقرير التالية."]);

    const sample = preparePdfText("نص عربي طويل ".repeat(40), "ar");
    assert.ok(sample.length > 0);

    pdf.end();
    stream.on("finish", resolve);
    stream.on("error", reject);
    pdf.on("error", reject);
  });

  const stats = fs.statSync(outputPath);
  assert.ok(stats.size > 1000, "Arabic PDF should not be empty");
  pass("Arabic RTL PDF smoke file generated");

  console.log(`\n${passed} checks passed.`);
})().catch((error) => {
  console.error("\nFAILED:", error);
  process.exit(1);
});
