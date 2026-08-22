const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const {
  containsArabic,
} = require("../aiReports/aiReportPdf.i18n");

const backendRoot = path.resolve(__dirname, "../../..");
const reportsUploadDir = path.join(backendRoot, "uploads", "reports");

const REGULAR_PDF_SUBTITLE = {
  en: "Clinical Progress Report",
  ar: "تقرير التقدم السريري",
};

const REGULAR_PDF_FOOTER = {
  en: "Clinical Progress Report",
  ar: "تقرير التقدم السريري",
};

const REGULAR_PDF_SPECIALIST_LABEL = {
  en: "Specialist",
  ar: "الأخصائي",
};

const REGULAR_PDF_EXTRA_LABELS = {
  en: {
    createdDate: "Created Date",
  },
  ar: {
    createdDate: "تاريخ الإنشاء",
  },
};

const ensureReportsDir = () => {
  fs.mkdirSync(reportsUploadDir, { recursive: true });
};

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatText = (value, fallback = "Not available") => {
  if (value === null || value === undefined) {
    return fallback;
  }

  const text = String(value).trim();
  return text.length > 0 ? text : fallback;
};

/** Exact specialist summary for regular reports — never parse/rewrite as JSON. */
const formatRegularReportSummary = (value) => {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
};

const parseJsonObject = (value) => {
  if (!value) {
    return null;
  }
  if (typeof value === "object" && !Array.isArray(value)) {
    return value;
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? parsed
        : null;
    } catch (_error) {
      return null;
    }
  }
  return null;
};

const formatAnalysisReliabilityLabel = (quality) => {
  const parsed = parseJsonObject(quality);
  const status = String(parsed?.status || "").toLowerCase();

  if (status === "good") {
    return "Reliable";
  }
  if (status === "usable_with_caution") {
    return "Use with Caution";
  }
  if (status === "low_quality") {
    return "Low Reliability";
  }
  return null;
};

const formatWordAccuracyLabel = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return null;
  }
  const rounded = Number(numeric.toFixed(2));
  return `Word Accuracy (Expected vs ASR): ${rounded}%`;
};

const formatSpeechAnalysisSummaryLine = (analysis = {}) => {
  const parts = [`Analyzed: ${formatDate(analysis.analyzed_at)}`];

  if (analysis.expected_text) {
    parts.push(`Expected text: ${formatText(analysis.expected_text, "")}`.trim());
  }

  const wordAccuracyLabel = formatWordAccuracyLabel(
    analysis.word_accuracy_percentage
  );
  if (wordAccuracyLabel) {
    parts.push(wordAccuracyLabel);
  }

  const reliabilityLabel = formatAnalysisReliabilityLabel(
    analysis.speech_analysis_quality ?? analysis.analysis_quality
  );
  if (reliabilityLabel) {
    parts.push(`Analysis Reliability: ${reliabilityLabel}`);
  }

  if (analysis.transcript) {
    parts.push(`Transcript: ${analysis.transcript}`);
  }

  return parts.join(" | ");
};

const formatRegularReportType = (value, language = "en") => {
  const text = formatText(value, "Report");
  const normalized = text.toLowerCase();
  if (language === "ar") {
    if (normalized === "weekly") return "أسبوعي";
    if (normalized === "monthly") return "شهري";
    if (normalized === "assessment") return "تقييم";
    if (normalized === "progress") return "تقدم";
  }
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const loadAiPdfHelpers = () => require("../aiReports/aiReportPdf.generator");

/** Resolve PDF language from specialist-authored / patient context text. */
const resolveRegularPdfLanguage = (context) => {
  const report = context?.report || {};
  const samples = [
    report.summary,
    report.title,
    report.patient_name,
    report.generated_by_name,
  ];

  for (const diagnosis of context?.diagnoses || []) {
    samples.push(diagnosis?.diagnosis_title, diagnosis?.description);
  }

  if (context?.treatmentPlan) {
    samples.push(context.treatmentPlan.title);
  }

  if (samples.some((value) => containsArabic(value))) {
    return "ar";
  }
  return "en";
};

/** Legacy helpers retained for unit tests; regular PDF uses AI layout helpers. */
const addSectionTitle = (doc, title) => {
  doc.moveDown(0.6);
  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .fillColor("#1F2937")
    .text(title);
  doc.moveDown(0.25);
  doc
    .moveTo(doc.page.margins.left, doc.y)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y)
    .strokeColor("#E5E7EB")
    .stroke();
  doc.moveDown(0.35);
};

const addParagraph = (doc, text) => {
  doc
    .font("Helvetica")
    .fontSize(10.5)
    .fillColor("#374151")
    .text(formatText(text), {
      align: "left",
      lineGap: 3,
      width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
    });
};

const addBulletList = (doc, items) => {
  const lines = items.filter((item) => item && String(item).trim().length > 0);

  if (lines.length === 0) {
    addParagraph(doc, "Not available");
    return;
  }

  const contentWidth =
    doc.page.width - doc.page.margins.left - doc.page.margins.right;

  doc.font("Helvetica").fontSize(10.5).fillColor("#374151");

  for (const item of lines) {
    doc.text(`• ${item}`, {
      indent: 12,
      lineGap: 3,
      width: contentWidth,
    });
  }
};

const ensureSpace = (doc, height = 80) => {
  const bottom = doc.page.height - doc.page.margins.bottom;
  if (doc.y + height > bottom) {
    doc.addPage();
  }
};

/**
 * Regular/manual Clinical Progress Report PDF.
 *
 * Uses the same document setup + layout primitives + call flow as
 * generateAiReportPdfFile (header → section title → info grid / section
 * content → footer). Only the section set and field values differ.
 */
const generateReportPdfFile = async (context) => {
  ensureReportsDir();

  const {
    createAiPdfTheme,
    addAiReportHeader,
    addAiReportInformation,
    addAiSectionTitle,
    addAiBulletList,
    addSectionContent,
    addAiReportFooter,
    AI_PDF_LAYOUT,
  } = loadAiPdfHelpers();

  const fileName = `report_${context.report.id}.pdf`;
  const filePath = path.join(reportsUploadDir, fileName);
  const language = resolveRegularPdfLanguage(context);

  await new Promise((resolve, reject) => {
    // Same PDFDocument setup as generateAiReportPdfFile.
    const doc = new PDFDocument({
      size: "A4",
      margin: AI_PDF_LAYOUT.pageMargin,
      info: {
        Title: formatText(
          context.report.title,
          REGULAR_PDF_SUBTITLE[language] || REGULAR_PDF_SUBTITLE.en
        ),
        Author: "Smart Rehabilitation Platform",
      },
    });

    doc.__aiPdfTheme = createAiPdfTheme(doc, language);
    const theme = doc.__aiPdfTheme;
    const extraLabels =
      REGULAR_PDF_EXTRA_LABELS[language] || REGULAR_PDF_EXTRA_LABELS.en;
    // Branding/label overrides only — no layout changes.
    theme.labels = {
      ...theme.labels,
      ...extraLabels,
      brandSubtitle: REGULAR_PDF_SUBTITLE[language] || REGULAR_PDF_SUBTITLE.en,
      footerAssisted: REGULAR_PDF_FOOTER[language] || REGULAR_PDF_FOOTER.en,
    };

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const generatedAt = new Date();
    const specialistTitle =
      typeof context.report.title === "string" ? context.report.title.trim() : "";
    const specialistSummary = formatRegularReportSummary(context.report.summary);

    // --- Same flow as generateAiReportPdfFile ---
    addAiReportHeader(doc);

    addAiSectionTitle(doc, theme.labels.reportInformation);
    addAiReportInformation(doc, [
      [theme.labels.patient, formatText(context.report.patient_name)],
      [
        REGULAR_PDF_SPECIALIST_LABEL[language] || REGULAR_PDF_SPECIALIST_LABEL.en,
        formatText(context.report.generated_by_name),
      ],
      [
        theme.labels.reportType,
        formatRegularReportType(context.report.report_type, language),
      ],
      [
        theme.labels.createdDate || theme.labels.generatedDate,
        formatDate(context.report.created_at),
      ],
    ]);

    if (specialistTitle) {
      addAiSectionTitle(doc, theme.labels.title);
      addSectionContent(doc, { paragraphs: [specialistTitle] });
    }

    const latestDiagnosis = Array.isArray(context.diagnoses)
      ? context.diagnoses[0]
      : null;
    if (latestDiagnosis) {
      const diagnosisTitle = latestDiagnosis.diagnosis_title
        ? String(latestDiagnosis.diagnosis_title).trim()
        : "";
      const description = latestDiagnosis.description
        ? String(latestDiagnosis.description).trim()
        : "";
      const diagnosisLine = [diagnosisTitle, description].filter(Boolean).join(" — ");
      if (diagnosisLine) {
        // Same primitive as AI diagnosis: section title + bullet list.
        addAiSectionTitle(doc, theme.labels.diagnosis);
        addAiBulletList(doc, [diagnosisLine]);
      }
    }

    const activePlanTitle =
      typeof context.treatmentPlan?.title === "string"
        ? context.treatmentPlan.title.trim()
        : "";
    if (activePlanTitle) {
      // Same primitive as AI treatment plan: section title + bullet list.
      addAiSectionTitle(doc, theme.labels.treatmentPlan);
      addAiBulletList(doc, [activePlanTitle]);
    }

    if (specialistSummary.trim().length > 0) {
      // Same primitive as AI narrative sections: section title + addSectionContent.
      addAiSectionTitle(doc, theme.labels.clinicalNotes);
      addSectionContent(doc, { paragraphs: [specialistSummary] });
    }

    addAiReportFooter(doc, generatedAt);

    doc.end();

    stream.on("finish", resolve);
    stream.on("error", reject);
    doc.on("error", reject);
  });

  return {
    filePath,
    fileName,
    publicUrl: `/uploads/reports/${fileName}`,
  };
};

module.exports = {
  generateReportPdfFile,
  reportsUploadDir,
  ensureReportsDir,
  formatDate,
  formatText,
  formatRegularReportSummary,
  resolveRegularPdfLanguage,
  formatSpeechAnalysisSummaryLine,
  formatAnalysisReliabilityLabel,
  addSectionTitle,
  addParagraph,
  addBulletList,
  ensureSpace,
};
