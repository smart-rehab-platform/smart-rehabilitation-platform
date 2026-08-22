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
 * Strong RTL (Arabic script) vs strong LTR (Latin letters / digits).
 * Neutrals (spaces, punctuation) attach to the current run.
 */
function isStrongLtrCodePoint(codePoint) {
  return (
    (codePoint >= 0x0030 && codePoint <= 0x0039) || // 0-9
    (codePoint >= 0x0041 && codePoint <= 0x005a) || // A-Z
    (codePoint >= 0x0061 && codePoint <= 0x007a) || // a-z
    (codePoint >= 0x00c0 && codePoint <= 0x024f) || // Latin extended
    (codePoint >= 0x1e00 && codePoint <= 0x1eff)
  );
}

/**
 * Split a logical mixed string into directional runs BEFORE any whole-line BiDi.
 * Arabic runs are reshaped alone later; LTR runs (English, numbers, dates, %)
 * are never passed through Arabic reshape/BiDi with surrounding Arabic.
 * Whitespace is its own neutral run so spaces survive RTL run reversal.
 */
function buildMixedLogicalRuns(text) {
  const value = stripBidiMarks(text == null ? "" : String(text));
  if (!value) {
    return [];
  }

  const runs = [];
  let buffer = "";
  let dir = null; // 'rtl' | 'ltr' | 'neutral'

  const flush = () => {
    if (!buffer) {
      return;
    }
    runs.push({ dir: dir || "ltr", text: buffer });
    buffer = "";
    dir = null;
  };

  for (const char of value) {
    const cp = char.codePointAt(0);
    let charDir = "neutral";
    if (/\s/.test(char)) {
      charDir = "neutral";
    } else if (usesArabicFont(cp)) {
      charDir = "rtl";
    } else if (isStrongLtrCodePoint(cp)) {
      charDir = "ltr";
    } else {
      // Punctuation/%/: attach to the open strong run when possible.
      charDir = dir === "rtl" || dir === "ltr" ? dir : "ltr";
    }

    if (dir === null) {
      dir = charDir;
      buffer = char;
      continue;
    }

    if (charDir === dir) {
      buffer += char;
      continue;
    }

    flush();
    dir = charDir;
    buffer = char;
  }

  flush();
  return coalesceDirectionalRuns(runs);
}

/** Merge same-direction islands; keep spaces between RTL↔LTR as separate runs. */
function coalesceDirectionalRuns(runs) {
  const out = [];
  let i = 0;
  while (i < runs.length) {
    const current = runs[i];
    if (current.dir === "neutral") {
      out.push({ dir: "neutral", text: current.text });
      i += 1;
      continue;
    }

    const dir = current.dir;
    let text = current.text;
    let j = i + 1;
    while (j < runs.length) {
      if (runs[j].dir === dir) {
        text += runs[j].text;
        j += 1;
        continue;
      }
      if (runs[j].dir === "neutral") {
        let k = j + 1;
        while (k < runs.length && runs[k].dir === "neutral") {
          k += 1;
        }
        // Only pull neutrals into this island when the next strong run matches.
        if (k < runs.length && runs[k].dir === dir) {
          while (j < k) {
            text += runs[j].text;
            j += 1;
          }
          continue;
        }
      }
      break;
    }
    out.push({ dir, text });
    i = j;
  }
  return out;
}

/**
 * Shape a single Arabic-only run for LTR glyph painting.
 * Never call this on mixed Arabic+Latin strings.
 * Leading/trailing spaces are preserved outside reshape/BiDi so gaps stay put.
 */
function prepareArabicRunVisual(arabicText) {
  const value = stripBidiMarks(arabicText == null ? "" : String(arabicText));
  if (!value) {
    return "";
  }
  const leading = value.match(/^\s*/)[0];
  const trailing = value.match(/\s*$/)[0];
  const core = value.slice(leading.length, value.length - trailing.length);
  if (!core) {
    return value;
  }
  if (!containsArabic(core)) {
    return value;
  }
  return (
    leading +
    stripBidiMarks(reorderRtlLine(reshapeArabic(core), "rtl")) +
    trailing
  );
}

/**
 * Shape + BiDi for a single LOGICAL line destined for LTR PDF drawing.
 *
 * Mixed lines are segmented into directional runs first:
 *   - RTL runs → reshape/BiDi alone
 *   - LTR runs → left intact (Hello World, ASR, F0, 50%, dates)
 *   - neutral spaces kept between runs
 *   - runs reversed for RTL base so painting left→right matches RTL reading
 *
 * Pure Arabic lines keep the classic reshape + line BiDi path.
 */
function prepareArabicVisualLine(logicalLine) {
  const value = stripBidiMarks(logicalLine == null ? "" : String(logicalLine));
  if (!value) {
    return "";
  }
  if (!containsArabic(value)) {
    return value;
  }

  const runs = buildMixedLogicalRuns(value);
  const hasLtr = runs.some((run) => run.dir === "ltr" && /[A-Za-z0-9]/.test(run.text));
  if (!hasLtr) {
    return stripBidiMarks(reorderRtlLine(reshapeArabic(value), "rtl"));
  }

  // Visual left→right order for an RTL paragraph: reverse logical runs.
  const visualParts = [];
  for (let i = runs.length - 1; i >= 0; i -= 1) {
    const run = runs[i];
    if (run.dir === "rtl") {
      visualParts.push(prepareArabicRunVisual(run.text));
    } else {
      // ltr + neutral spaces/punctuation
      visualParts.push(run.text);
    }
  }
  return visualParts.join("");
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
  buildMixedLogicalRuns,
  prepareArabicRunVisual,
  prepareArabicVisualLine,
  analyzeArabicVisualLine,
  preparePdfDisplayText,
  splitMixedFontRuns,
  shapeArabicForPdf: prepareArabicVisualLine,
};
