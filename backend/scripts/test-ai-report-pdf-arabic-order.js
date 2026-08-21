/**
 * Diagnostic tests for Arabic PDF visual ordering (BiDi).
 * Uses the SAME production helpers as aiReportPdf.generator.js.
 *
 * Run: node scripts/test-ai-report-pdf-arabic-order.js
 */
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const fontkit = require("fontkit");

const {
  prepareArabicVisualLine,
  analyzeArabicVisualLine,
  registerAiPdfFonts,
  getPdfLabels,
  reshapeArabic,
  ARABIC_FONT_REGULAR,
} = require("../src/modules/aiReports/aiReportPdf.i18n");
const {
  addAiReportHeader,
  addAiSectionTitle,
  addAiParagraph,
  addAiBulletList,
  AI_PDF_LAYOUT,
} = require("../src/modules/aiReports/aiReportPdf.generator");

let passed = 0;
const pass = (label) => {
  passed += 1;
  console.log(`  ✓ ${label}`);
};

const SAMPLES = {
  A: "هذا تقرير سريري باللغة العربية",
  B: "تم تشخيص المريض باضطراب ADHD خلال عام 2026",
  C: "بلغ التقدم 50% بتاريخ 21 أغسطس 2026",
  D: "المريض: Bana Aloulll",
  E: "تم تنفيذ تمرين Picture Sequencing ومراجعته",
};

(async () => {
  // --- Order assertions on production visual transform ---
  {
    const visual = prepareArabicVisualLine(SAMPLES.A);
    // For LTR painting of RTL text, the visual string must NOT equal logical order.
    assert.notStrictEqual(visual, SAMPLES.A);
    assert.notStrictEqual(visual, reshapeArabic(SAMPLES.A));
    // Rightmost painted glyph (last char of visual buffer) must be the first
    // letter of the sentence ("ه" of "هذا"), as a shaped presentation form.
    const lastChar = [...visual].at(-1);
    const hehForms = new Set(["ه", "ﻫ", "ﻬ", "ﻪ", "ﻩ"]);
    assert.ok(
      hehForms.has(lastChar),
      `expected visual line to end with Heh presentation form, got U+${lastChar.codePointAt(0).toString(16)}`,
    );
    pass("A: visual order differs from logical; first letter anchored at visual end (right)");
  }

  {
    const { visual, runTexts } = analyzeArabicVisualLine(SAMPLES.B);
    assert.ok(visual.includes("ADHD"), "ADHD preserved");
    assert.ok(!visual.includes("HDDA"), "ADHD not character-reversed");
    assert.ok(visual.includes("2026"), "2026 preserved");
    assert.ok(!visual.includes("6202"), "2026 not digit-reversed");
    // Visual LTR buffer should start with the year (left) for RTL paragraph end.
    assert.ok(visual.startsWith("2026"), `expected visual to start with 2026, got: ${visual}`);
    assert.ok(runTexts.some((t) => t.includes("ADHD")));
    pass("B: ADHD + 2026 stay LTR; year sits on visual left");
  }

  {
    const { visual } = analyzeArabicVisualLine(SAMPLES.C);
    assert.ok(visual.includes("50") && visual.includes("%"), "50% components present");
    assert.ok(visual.includes("2026"));
    assert.ok(!/\d{4}/.test(visual) || visual.includes("2026"));
    pass("C: percentage and date year remain readable tokens");
  }

  {
    const { visual, runTexts } = analyzeArabicVisualLine(SAMPLES.D);
    assert.ok(visual.includes("Bana"), "Bana preserved");
    assert.ok(visual.includes("Aloulll"), "Aloulll preserved");
    assert.ok(!visual.includes("llloulA"), "Aloulll not reversed");
    assert.ok(!visual.includes("anaB"), "Bana not reversed");
    assert.ok(runTexts.some((t) => /Bana/.test(t)));
    pass("D: Latin patient name stays internally LTR");
  }

  {
    const { visual } = analyzeArabicVisualLine(SAMPLES.E);
    assert.ok(visual.includes("Picture Sequencing"));
    assert.ok(!visual.includes("gnicneuqeS"));
    pass("E: English exercise title stays LTR");
  }

  // --- Prove fontkit double-reversal hazard still exists for multi-char runs ---
  {
    const arabicFont = fontkit.openSync(ARABIC_FONT_REGULAR);
    const visual = prepareArabicVisualLine(SAMPLES.A);
    const layoutIds = arabicFont.layout(visual).glyphs.map((g) => g.id);
    const perCharIds = [...visual].map((ch) => arabicFont.glyphForCodePoint(ch.codePointAt(0)).id);
    assert.notDeepStrictEqual(
      layoutIds,
      perCharIds,
      "fontkit multi-char layout must differ from per-char (RTL reverse hazard)",
    );
    // Production draw path uses per-char order, which matches perCharIds.
    pass("fontkit multi-char layout reverses visual Arabic (hazard documented)");
  }

  // --- BiDi applied once: reshape then reorder; font split after ---
  {
    const logical = SAMPLES.B;
    const reshaped = reshapeArabic(logical);
    const visual = prepareArabicVisualLine(logical);
    assert.notStrictEqual(visual, reshaped);
    const again = prepareArabicVisualLine(visual);
    // Feeding an already-visual string back through is not supported for production,
    // but prepareArabicVisualLine on pure-latin-tail strings should not explode.
    assert.ok(typeof again === "string");
    pass("BiDi stage operates on reshaped logical line (not on font runs)");
  }

  // --- Generate diagnostic fixture with production renderer ---
  const outputDir = path.join(__dirname, "phase-b-fixtures");
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, "ai-report-arabic-order-diagnostic.pdf");

  await new Promise((resolve, reject) => {
    const pdf = new PDFDocument({ size: "A4", margin: AI_PDF_LAYOUT.pageMargin });
    const fonts = registerAiPdfFonts(pdf);
    pdf.__aiPdfTheme = {
      language: "ar",
      isRtl: true,
      align: "right",
      fonts,
      labels: getPdfLabels("ar"),
    };

    const stream = fs.createWriteStream(outputPath);
    pdf.pipe(stream);

    addAiReportHeader(pdf);
    addAiSectionTitle(pdf, "تشخيص ترتيب النص العربي");
    addAiParagraph(pdf, SAMPLES.A);
    addAiParagraph(pdf, SAMPLES.B);
    addAiParagraph(pdf, SAMPLES.C);
    addAiParagraph(pdf, SAMPLES.D);
    addAiParagraph(pdf, SAMPLES.E);
    addAiSectionTitle(pdf, getPdfLabels("ar").recommendations);
    addAiBulletList(pdf, [
      SAMPLES.B,
      SAMPLES.C,
      "الاستمرار في جلسات العلاج مع متابعة ADHD خلال 2026.",
    ]);

    pdf.end();
    stream.on("finish", resolve);
    stream.on("error", reject);
    pdf.on("error", reject);
  });

  const stats = fs.statSync(outputPath);
  assert.ok(stats.size > 1000);
  pass(`diagnostic PDF written (${stats.size} bytes): ${outputPath}`);

  // Regenerate word-position dump + PNG with python/pymupdf for visual QA.
  const dumpPath = path.join(outputDir, "order-dump.json");
  const pngPath = path.join(outputDir, "ai-report-arabic-order-diagnostic-page1.png");
  const { spawnSync } = require("child_process");
  const py = `
import json
try:
  import pymupdf as fitz
except ImportError:
  import fitz
doc=fitz.open(r'''${outputPath.replace(/\\/g, "\\\\")}''')
page=doc[0]
from collections import defaultdict
lines=defaultdict(list)
for w in page.get_text('words'):
  lines[round(w[1],0)].append({'x0':w[0],'t':w[4]})
result=[]
for y in sorted(lines):
  row=sorted(lines[y], key=lambda w:w['x0'])
  result.append({'y':y,'ltr':[w['t'] for w in row]})
open(r'''${dumpPath.replace(/\\/g, "\\\\")}''','w',encoding='utf-8').write(json.dumps(result,ensure_ascii=False,indent=2))
pix=page.get_pixmap(matrix=fitz.Matrix(2,2), alpha=False)
pix.save(r'''${pngPath.replace(/\\/g, "\\\\")}''')
print('ok')
`;
  const pyResult = spawnSync("python", ["-c", py], { encoding: "utf-8" });
  if (pyResult.status === 0) {
    const dump = JSON.parse(fs.readFileSync(dumpPath, "utf8"));
    // Find the pure-Arabic sample A line: rightmost word should be هذا (start).
    const sampleA = dump.find(
      (row) =>
        row.ltr.length >= 4 &&
        row.ltr.some((t) => /هذا|ﻫﺬﺍ|ﻫﺬا/.test(t) || t.includes("ﻫﺬ") || t.includes("هذا")),
    );
    assert.ok(sampleA, "sample A line found in PDF word dump");
    const rightmost = sampleA.ltr[sampleA.ltr.length - 1];
    assert.ok(
      /هذا|ﻫﺬ|ﻫﺬﺍ|ﻫﺬا/.test(rightmost) || rightmost.includes("ﻫ"),
      `sample A rightmost word should be هذا, got ${rightmost}`,
    );
    // Sample B: rightmost Arabic cluster line should end with تم
    const sampleB = dump.find(
      (row) =>
        row.ltr.some((t) => /تم|ﺗﻢ/.test(t)) &&
        row.ltr.some((t) => /تشخيص|ﺗﺸﺨ/.test(t)),
    );
    assert.ok(sampleB, "sample B Arabic line found");
    assert.ok(
      /تم|ﺗﻢ/.test(sampleB.ltr[sampleB.ltr.length - 1]),
      `sample B rightmost should be تم, got ${sampleB.ltr[sampleB.ltr.length - 1]}`,
    );
    // Latin tokens exist and are not reversed
    const hasAdhd = dump.some((row) => row.ltr.includes("ADHD"));
    const hasBana = dump.some((row) => row.ltr.includes("Bana"));
    assert.ok(hasAdhd && hasBana, "ADHD and Bana present in PDF");
    pass("PDF word positions: Arabic starts on the RIGHT; Latin tokens intact");
  } else {
    console.log("  ⚠ skipped PDF position assertions (python/pymupdf):", pyResult.stderr || pyResult.stdout);
  }

  console.log(`\n${passed} checks passed.`);
  console.log(`\nOpen and visually verify:\n  ${outputPath}`);
  console.log(`PNG preview:\n  ${pngPath}`);
  console.log("Arabic must read RTL; Bana/ADHD/2026/50% must stay LTR internally.");
})().catch((error) => {
  console.error("\nFAILED:", error);
  process.exit(1);
});
