const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const backendRoot = path.resolve(__dirname, "../../..");
const reportsUploadDir = path.join(backendRoot, "uploads", "reports");

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

const formatJsonDetails = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        return formatJsonDetails(JSON.parse(trimmed));
      } catch {
        return trimmed;
      }
    }

    return trimmed;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => formatJsonDetails(item))
      .filter(Boolean)
      .join("\n");
  }

  if (typeof value === "object") {
    return Object.entries(value)
      .map(([key, item]) => {
        const formatted = formatJsonDetails(item);
        return formatted ? `${key}: ${formatted}` : null;
      })
      .filter(Boolean)
      .join("\n");
  }

  return String(value);
};

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
    });
};

const addBulletList = (doc, items) => {
  const lines = items.filter((item) => item && String(item).trim().length > 0);

  if (lines.length === 0) {
    addParagraph(doc, "Not available");
    return;
  }

  doc.font("Helvetica").fontSize(10.5).fillColor("#374151");

  for (const item of lines) {
    doc.text(`• ${item}`, {
      indent: 12,
      lineGap: 3,
    });
  }
};

const ensureSpace = (doc, height = 80) => {
  const bottom = doc.page.height - doc.page.margins.bottom;
  if (doc.y + height > bottom) {
    doc.addPage();
  }
};

const generateReportPdfFile = async (context) => {
  ensureReportsDir();

  const fileName = `report_${context.report.id}.pdf`;
  const filePath = path.join(reportsUploadDir, fileName);

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      info: {
        Title: formatText(context.report.title, "Smart Rehab Report"),
        Author: "Smart Rehabilitation Platform",
      },
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const generatedAt = new Date();

    doc
      .font("Helvetica-Bold")
      .fontSize(22)
      .fillColor("#4F46E5")
      .text("Smart Rehabilitation", { align: "center" });
    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor("#6B7280")
      .text("Clinical Progress Report", { align: "center" });
    doc.moveDown(1.2);

    doc
      .font("Helvetica-Bold")
      .fontSize(16)
      .fillColor("#111827")
      .text(formatText(context.report.title, "Patient Report"), {
        align: "left",
      });
    doc.moveDown(0.8);

    const metaRows = [
      ["Patient", formatText(context.report.patient_name)],
      ["Specialist", formatText(context.report.generated_by_name)],
      ["Report Type", formatText(context.report.report_type)],
      ["Created Date", formatDate(context.report.created_at)],
    ];

    doc.font("Helvetica").fontSize(10.5).fillColor("#374151");
    for (const [label, value] of metaRows) {
      doc.font("Helvetica-Bold").text(`${label}: `, { continued: true });
      doc.font("Helvetica").text(value);
    }

    ensureSpace(doc, 120);
    addSectionTitle(doc, "Diagnosis");
    if (context.diagnoses.length === 0) {
      addParagraph(doc, "Not available");
    } else {
      addBulletList(
        doc,
        context.diagnoses.map((item) => {
          const parts = [item.diagnosis_title];
          if (item.description) {
            parts.push(item.description);
          }
          parts.push(`Diagnosed: ${formatDate(item.diagnosed_at)}`);
          return parts.join(" — ");
        })
      );
    }

    ensureSpace(doc, 120);
    addSectionTitle(doc, "Treatment Plan");
    if (!context.treatmentPlan) {
      addParagraph(doc, "Not available");
    } else {
      const plan = context.treatmentPlan;
      addBulletList(doc, [
        `Title: ${formatText(plan.title)}`,
        `Status: ${formatText(plan.status)}`,
        `Start Date: ${formatDate(plan.start_date)}`,
        plan.end_date ? `End Date: ${formatDate(plan.end_date)}` : null,
      ]);
    }

    ensureSpace(doc, 120);
    addSectionTitle(doc, "Executive Summary");
    addParagraph(doc, context.report.summary);

    ensureSpace(doc, 120);
    addSectionTitle(doc, "Goals Progress");
    if (context.goals.length === 0) {
      addParagraph(doc, "Not available");
    } else {
      addBulletList(
        doc,
        context.goals.map((goal) => {
          const progress =
            goal.completion_percentage !== null &&
            goal.completion_percentage !== undefined
              ? `${goal.completion_percentage}%`
              : "No progress recorded";
          const achieved = goal.is_achieved ? "Achieved" : "In progress";
          return `${goal.title} (${goal.term}) — ${progress} — ${achieved}`;
        })
      );
    }

    ensureSpace(doc, 120);
    addSectionTitle(doc, "Exercises & Submissions");
    if (context.submissions.length === 0) {
      addParagraph(doc, "Not available");
    } else {
      addBulletList(
        doc,
        context.submissions.map((item) => {
          const parts = [
            formatText(item.exercise_title, "Exercise"),
            `Status: ${formatText(item.status)}`,
            `Submitted: ${formatDate(item.submitted_at)}`,
          ];
          if (item.performance_rating !== null && item.performance_rating !== undefined) {
            parts.push(`Rating: ${item.performance_rating}/10`);
          }
          if (item.feedback) {
            parts.push(`Feedback: ${item.feedback}`);
          }
          return parts.join(" | ");
        })
      );
    }

    ensureSpace(doc, 120);
    addSectionTitle(doc, "Progress Summary");
    if (context.progressSnapshots.length === 0) {
      addParagraph(doc, "Not available");
    } else {
      addBulletList(
        doc,
        context.progressSnapshots.map((snapshot) => {
          const parts = [
            `${formatText(snapshot.period)} period`,
            `${formatDate(snapshot.period_start)} – ${formatDate(snapshot.period_end)}`,
            `Completed: ${snapshot.exercises_completed ?? 0}`,
          ];
          if (snapshot.average_performance !== null && snapshot.average_performance !== undefined) {
            parts.push(`Avg performance: ${snapshot.average_performance}`);
          }
          if (
            snapshot.improvement_percentage !== null &&
            snapshot.improvement_percentage !== undefined
          ) {
            parts.push(`Improvement: ${snapshot.improvement_percentage}%`);
          }
          return parts.join(" | ");
        })
      );
    }

    if (context.speechAnalyses.length > 0) {
      ensureSpace(doc, 120);
      addSectionTitle(doc, "Speech Analysis Summary");
      addBulletList(
        doc,
        context.speechAnalyses.map((analysis) =>
          formatSpeechAnalysisSummaryLine(analysis)
        )
      );
    }

    if (context.recommendations.length > 0) {
      ensureSpace(doc, 120);
      addSectionTitle(doc, "Recommendations");
      addBulletList(
        doc,
        context.recommendations.map((item) => {
          const details = formatJsonDetails(item.details);
          return `${formatText(item.type)} (${formatText(item.status)})${details ? ` — ${details}` : ""}`;
        })
      );
    }

    ensureSpace(doc, 60);
    doc.moveDown(1);
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#9CA3AF")
      .text(
        `Generated on ${generatedAt.toLocaleString("en-US")} by Smart Rehabilitation Platform`,
        { align: "center" }
      );

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
  formatSpeechAnalysisSummaryLine,
  formatAnalysisReliabilityLabel,
  addSectionTitle,
  addParagraph,
  addBulletList,
  ensureSpace,
};
