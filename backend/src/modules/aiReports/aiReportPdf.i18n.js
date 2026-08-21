const path = require("path");
const fs = require("fs");

const backendRoot = path.resolve(__dirname, "../../..");

const ARABIC_FONT_REGULAR = path.join(
  backendRoot,
  "assets",
  "fonts",
  "NotoNaskhArabic-Regular.ttf"
);
const ARABIC_FONT_BOLD = path.join(
  backendRoot,
  "assets",
  "fonts",
  "NotoNaskhArabic-Bold.ttf"
);

const PDF_LABELS = {
  en: {
    brandTitle: "Smart Rehabilitation",
    brandSubtitle: "AI Clinical Report",
    reportInformation: "Report Information",
    patient: "Patient",
    reportType: "Report Type",
    periodStart: "Period Start",
    periodEnd: "Period End",
    generatedDate: "Generated Date",
    diagnosis: "Diagnosis",
    diagnosed: "Diagnosed",
    treatmentPlan: "Treatment Plan",
    title: "Title",
    status: "Status",
    startDate: "Start Date",
    endDate: "End Date",
    executiveSummary: "Executive Summary",
    clinicalNotes: "Clinical Notes",
    patientProgress: "Patient Progress",
    speechAnalysis: "Speech Analysis",
    exerciseAdherence: "Exercise Adherence",
    progressAnalysis: "Progress Analysis",
    recommendations: "Recommendations",
    nextSteps: "Next Steps",
    goalsProgress: "Goals Progress",
    risksOrRegressions: "Risks & Regressions",
    notAvailable: "Not available",
    noProgressRecorded: "No progress recorded",
    achieved: "Achieved",
    inProgress: "In progress",
    footerAssisted: "AI Assisted Clinical Report",
    footerGeneratedPrefix: "Generated on",
    footerGeneratedBy: "by",
    footerPlatform: "Smart Rehabilitation Platform",
    period: "period",
    completed: "Completed",
    avgPerformance: "Avg performance",
    improvement: "Improvement",
  },
  ar: {
    brandTitle: "Smart Rehabilitation",
    brandSubtitle: "تقرير سريري بالذكاء الاصطناعي",
    reportInformation: "معلومات التقرير",
    patient: "المريض",
    reportType: "نوع التقرير",
    periodStart: "بداية الفترة",
    periodEnd: "نهاية الفترة",
    generatedDate: "تاريخ الإنشاء",
    diagnosis: "التشخيص",
    diagnosed: "تاريخ التشخيص",
    treatmentPlan: "خطة العلاج",
    title: "العنوان",
    status: "الحالة",
    startDate: "تاريخ البداية",
    endDate: "تاريخ النهاية",
    executiveSummary: "الملخص التنفيذي",
    clinicalNotes: "الملاحظات السريرية",
    patientProgress: "تقدم المريض",
    speechAnalysis: "تحليل النطق",
    exerciseAdherence: "الالتزام بالتمارين",
    progressAnalysis: "تحليل التقدم",
    recommendations: "التوصيات",
    nextSteps: "الخطوات التالية",
    goalsProgress: "تقدم الأهداف",
    risksOrRegressions: "المخاطر والتراجعات",
    notAvailable: "غير متاح",
    noProgressRecorded: "لا يوجد تقدم مسجّل",
    achieved: "محقق",
    inProgress: "قيد التقدم",
    footerAssisted: "تقرير سريري بمساعدة الذكاء الاصطناعي",
    footerGeneratedPrefix: "تم الإنشاء في",
    footerGeneratedBy: "بواسطة",
    footerPlatform: "Smart Rehabilitation Platform",
    period: "فترة",
    completed: "مكتمل",
    avgPerformance: "متوسط الأداء",
    improvement: "التحسّن",
  },
};

const ARABIC_FONT_NAME = "AiReportArabic";
const ARABIC_FONT_BOLD_NAME = "AiReportArabic-Bold";
const LATIN_FONT_NAME = "Helvetica";
const LATIN_FONT_BOLD_NAME = "Helvetica-Bold";

function getPdfLabels(language) {
  return PDF_LABELS[language === "ar" ? "ar" : "en"];
}

function hasArabicFonts() {
  return fs.existsSync(ARABIC_FONT_REGULAR) && fs.existsSync(ARABIC_FONT_BOLD);
}

function registerAiPdfFonts(doc) {
  if (!hasArabicFonts()) {
    return {
      regular: LATIN_FONT_NAME,
      bold: LATIN_FONT_BOLD_NAME,
      latinRegular: LATIN_FONT_NAME,
      latinBold: LATIN_FONT_BOLD_NAME,
      arabicReady: false,
    };
  }

  doc.registerFont(ARABIC_FONT_NAME, ARABIC_FONT_REGULAR);
  doc.registerFont(ARABIC_FONT_BOLD_NAME, ARABIC_FONT_BOLD);

  return {
    regular: ARABIC_FONT_NAME,
    bold: ARABIC_FONT_BOLD_NAME,
    latinRegular: LATIN_FONT_NAME,
    latinBold: LATIN_FONT_BOLD_NAME,
    arabicReady: true,
  };
}

function getEnglishPdfFonts() {
  return {
    regular: LATIN_FONT_NAME,
    bold: LATIN_FONT_BOLD_NAME,
    latinRegular: LATIN_FONT_NAME,
    latinBold: LATIN_FONT_BOLD_NAME,
    arabicReady: false,
  };
}

/**
 * True when the code point should prefer the Arabic-capable font.
 * Latin letters/punctuation are intentionally excluded — Noto Naskh Arabic
 * does not include those glyphs (they render as □ if forced).
 */
function usesArabicFont(codePoint) {
  return (
    (codePoint >= 0x0600 && codePoint <= 0x06ff) ||
    (codePoint >= 0x0750 && codePoint <= 0x077f) ||
    (codePoint >= 0x08a0 && codePoint <= 0x08ff) ||
    (codePoint >= 0xfb50 && codePoint <= 0xfdff) ||
    (codePoint >= 0xfe70 && codePoint <= 0xfeff)
  );
}

function containsArabic(text) {
  const value = text == null ? "" : String(text);
  for (const char of value) {
    if (usesArabicFont(char.codePointAt(0))) {
      return true;
    }
  }
  return false;
}

/** Invisible BiDi marks that can render as □ in Helvetica. */
function stripBidiMarks(text) {
  return String(text || "").replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, "");
}

function reshapeArabic(text) {
  if (!text) {
    return "";
  }
  const ArabicReshaper = require("arabic-persian-reshaper");
  return ArabicReshaper.ArabicShaper.convertArabic(String(text));
}

/**
 * Apply Unicode BiDi reordering for ONE visual line.
 * Must be called after wrapping — never on a whole multi-line paragraph.
 */
function reorderRtlLine(text, baseDirection = "rtl") {
  if (!text) {
    return "";
  }
  const bidiFactory = require("bidi-js");
  const bidi = bidiFactory();
  const value = String(text);
  const embeddingLevels = bidi.getEmbeddingLevels(value, baseDirection);
  return bidi.getReorderedString(value, embeddingLevels);
}

/**
 * Shape + BiDi for a single LOGICAL line destined for LTR PDF drawing.
 *
 * Pipeline (exactly once, per wrapped line):
 *   logical Unicode → strip bidi marks → reshape Arabic → bidi-js reorder (base rtl)
 *
 * The returned string is in VISUAL left-to-right order for a naive LTR painter.
 * Callers MUST draw it without letting fontkit RTL-layout reverse Arabic runs
 * again (draw glyph-by-glyph). Applying getReorderedString and then doc.text()
 * on a multi-character Arabic run causes a double-reversal.
 */
function prepareArabicVisualLine(logicalLine) {
  const value = stripBidiMarks(logicalLine == null ? "" : String(logicalLine));
  if (!value) {
    return "";
  }
  if (!containsArabic(value)) {
    return value;
  }
  return stripBidiMarks(reorderRtlLine(reshapeArabic(value), "rtl"));
}

/**
 * Diagnostic helper: visual line + font runs for order assertions.
 * BiDi runs on the complete line BEFORE font splitting.
 */
function analyzeArabicVisualLine(logicalLine, { bold = false, fonts } = {}) {
  const logical = stripBidiMarks(logicalLine == null ? "" : String(logicalLine));
  const visual = prepareArabicVisualLine(logical);
  const runs = splitMixedFontRuns(visual, { bold, fonts });
  return {
    logical,
    visual,
    runs,
    runTexts: runs.map((run) => run.text),
  };
}

/**
 * Kept for single-line callers/tests. Multi-line text must wrap first.
 */
function preparePdfDisplayText(text, language) {
  const value = text == null ? "" : String(text);
  if (language !== "ar") {
    return value;
  }
  return prepareArabicVisualLine(value);
}

/**
 * Split a visual (already BiDi-reordered) string into font runs so Latin /
 * punctuation use Helvetica while Arabic uses Noto Naskh.
 */
function splitMixedFontRuns(visualText, { bold = false, fonts } = {}) {
  const value = visualText == null ? "" : String(visualText);
  if (!value) {
    return [];
  }

  const arabicFont = bold
    ? fonts?.bold || ARABIC_FONT_BOLD_NAME
    : fonts?.regular || ARABIC_FONT_NAME;
  const latinFont = bold
    ? fonts?.latinBold || LATIN_FONT_BOLD_NAME
    : fonts?.latinRegular || LATIN_FONT_NAME;

  const runs = [];
  let currentFont = null;
  let buffer = "";

  for (const char of value) {
    const cp = char.codePointAt(0);
    const font = usesArabicFont(cp) ? arabicFont : latinFont;
    if (font !== currentFont && buffer) {
      runs.push({ font: currentFont, text: buffer });
      buffer = "";
    }
    currentFont = font;
    buffer += char;
  }

  if (buffer && currentFont) {
    runs.push({ font: currentFont, text: buffer });
  }

  return runs;
}

module.exports = {
  ARABIC_FONT_REGULAR,
  ARABIC_FONT_BOLD,
  ARABIC_FONT_NAME,
  ARABIC_FONT_BOLD_NAME,
  LATIN_FONT_NAME,
  LATIN_FONT_BOLD_NAME,
  PDF_LABELS,
  getPdfLabels,
  hasArabicFonts,
  registerAiPdfFonts,
  getEnglishPdfFonts,
  usesArabicFont,
  containsArabic,
  reshapeArabic,
  reorderRtlLine,
  prepareArabicVisualLine,
  analyzeArabicVisualLine,
  preparePdfDisplayText,
  splitMixedFontRuns,
  shapeArabicForPdf: prepareArabicVisualLine,
};
