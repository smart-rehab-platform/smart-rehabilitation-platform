/**
 * Smoke test for AI report PDF branding and wrapping helpers.
 * Run: node scripts/test-ai-report-pdf-branding.js
 */
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const {
  addAiReportHeader,
  addAiSectionTitle,
  addAiReportInformation,
  addAiParagraph,
  addAiBulletList,
  AI_PDF_COLORS,
  AI_PDF_LAYOUT,
  AI_REPORT_LOGO_PATH,
  getAiPageMetrics,
  getSafeTextWidth,
  preparePdfText,
  parseAiSummary,
} = require("../src/modules/aiReports/aiReportPdf.generator");

let passed = 0;
const pass = (label) => {
  passed += 1;
  console.log(`  ✓ ${label}`);
};

(async () => {
  assert.ok(fs.existsSync(AI_REPORT_LOGO_PATH), "logo asset must exist for PDF header");
  pass("logo asset present");

  const doc = new PDFDocument({ size: "A4", margin: AI_PDF_LAYOUT.pageMargin });
  const metrics = getAiPageMetrics(doc);
  assert.ok(Math.abs(metrics.pageWidth - 595.28) < 0.01);
  assert.strictEqual(metrics.leftMargin, 50);
  assert.strictEqual(metrics.rightMargin, 50);
  assert.ok(Math.abs(metrics.contentWidth - 495.28) < 0.01);
  assert.ok(Math.abs(getSafeTextWidth(doc, 50) - 495.28) < 0.01);
  pass("A4 metrics and safe content width calculated");

  const longToken = "X".repeat(120);
  const prepared = preparePdfText(longToken);
  assert.ok(prepared.includes("\u200B"), "long unbroken tokens receive break opportunities");
  pass("long unbroken strings prepared for safe wrapping");

  const parsed = parseAiSummary(JSON.stringify({
    executive_summary: "Sample summary",
    recommendations: ["Continue therapy"],
    next_steps: ["Schedule follow-up"],
  }));
  assert.strictEqual(parsed.isJson, true);
  pass("parseAiSummary unchanged");

  const outputDir = path.join(__dirname, "phase-b-fixtures");
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, "ai-report-branding-smoke.pdf");

  await new Promise((resolve, reject) => {
    const pdf = new PDFDocument({ size: "A4", margin: AI_PDF_LAYOUT.pageMargin });
    const stream = fs.createWriteStream(outputPath);
    pdf.pipe(stream);

    addAiReportHeader(pdf);
    addAiSectionTitle(pdf, "Report Information");
    addAiReportInformation(pdf, [
      ["Patient", "Omar Alaa with an unusually long patient display name that should wrap inside the left column safely"],
      ["Report Type", "Monthly"],
      ["Period Start", "Aug 1, 2026"],
      ["Period End", "Aug 20, 2026"],
      ["Generated Date", "Aug 20, 2026"],
    ]);

    addAiSectionTitle(pdf, "Executive Summary");
    addAiParagraph(pdf, "Clinical narrative sentence. ".repeat(80));

    addAiSectionTitle(pdf, "Clinical Notes");
    addAiBulletList(pdf, [
      "First insight with enough words to wrap across multiple lines while preserving a clean hanging indent and staying inside the page margins.",
      longToken,
      "Second note about phoneme patterns /s/ /r/ /l/ and continued therapeutic focus areas for the patient.",
    ]);

    addAiSectionTitle(pdf, "Recommendations");
    addAiBulletList(pdf, [
      "Continue structured speech therapy sessions three times per week with parent-supported home practice.",
      "Review pacing and reinforcement for exercise adherence during weekends and school breaks.",
    ]);

    addAiSectionTitle(pdf, "Next Steps");
    addAiBulletList(pdf, [
      "Schedule follow-up and reassess progress after the next reporting period ends.",
    ]);

    pdf.end();
    stream.on("finish", resolve);
    stream.on("error", reject);
    pdf.on("error", reject);
  });

  const stats = fs.statSync(outputPath);
  assert.ok(stats.size > 1000, "generated PDF should not be empty");
  pass("stress-case multi-section PDF generated");

  console.log(`\n${passed} checks passed.`);
})().catch((error) => {
  console.error("\nFAILED:", error);
  process.exit(1);
});
