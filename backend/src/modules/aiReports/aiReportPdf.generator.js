const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const {
  reportsUploadDir,
  ensureReportsDir,
  formatDate,
  formatText,
  addSectionTitle,
  addParagraph,
  addBulletList,
  ensureSpace,
} = require("../reports/reportPdf.generator");

const parseAiSummary = (summary) => {
  if (summary === null || summary === undefined) {
    return {
      isJson: false,
      plainText: "",
      sections: {},
    };
  }

  const trimmed = String(summary).trim();
  if (!trimmed) {
    return {
      isJson: false,
      plainText: "",
      sections: {},
    };
  }

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      return {
        isJson: true,
        plainText: "",
        sections: extractAiSummarySections(parsed),
      };
    } catch {
      return {
        isJson: false,
        plainText: trimmed,
        sections: {},
      };
    }
  }

  return {
    isJson: false,
    plainText: trimmed,
    sections: {},
  };
};

const toStringList = (value) => {
  if (value === null || value === undefined) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (item === null || item === undefined) {
          return null;
        }
        if (typeof item === "string") {
          return item.trim();
        }
        if (typeof item === "object") {
          return JSON.stringify(item);
        }
        return String(item).trim();
      })
      .filter((item) => item && item.length > 0);
  }

  if (typeof value === "string" && value.trim().length > 0) {
    return [value.trim()];
  }

  return [];
};

const extractAiSummarySections = (parsed) => {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {
      executiveSummary: typeof parsed === "string" ? parsed : "",
      clinicalNotes: [],
      progressAnalysis: [],
      recommendations: [],
      treatmentSuggestions: [],
      goalsProgress: "",
    };
  }

  const clinicalNotes = [
    ...toStringList(parsed.clinical_insights),
    ...toStringList(parsed.risks_or_regressions),
  ];

  const progressAnalysis = [
    parsed.patient_progress_summary,
    parsed.speech_analysis_summary,
    parsed.exercise_adherence_summary,
  ]
    .map((item) => (item ? String(item).trim() : ""))
    .filter(Boolean);

  return {
    executiveSummary: parsed.executive_summary
      ? String(parsed.executive_summary).trim()
      : "",
    clinicalNotes,
    progressAnalysis,
    recommendations: toStringList(parsed.recommendations),
    treatmentSuggestions: toStringList(parsed.next_steps),
    goalsProgress: parsed.goal_progress_summary
      ? String(parsed.goal_progress_summary).trim()
      : "",
  };
};

const formatReportType = (value) => {
  const text = formatText(value, "Report");
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const addSectionContent = (doc, { paragraphs = [], bullets = [] }) => {
  const hasParagraphs = paragraphs.some((item) => item && String(item).trim());
  const hasBullets = bullets.some((item) => item && String(item).trim());

  if (!hasParagraphs && !hasBullets) {
    addParagraph(doc, "Not available");
    return;
  }

  for (const paragraph of paragraphs) {
    if (paragraph && String(paragraph).trim()) {
      addParagraph(doc, paragraph);
      doc.moveDown(0.2);
    }
  }

  if (hasBullets) {
    addBulletList(doc, bullets);
  }
};

const generateAiReportPdfFile = async (context) => {
  ensureReportsDir();

  const fileName = `ai_report_${context.report.id}.pdf`;
  const filePath = path.join(reportsUploadDir, fileName);
  const summaryData = parseAiSummary(context.report.summary);

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      info: {
        Title: "AI Clinical Report",
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
      .text("AI Clinical Report", { align: "center" });
    doc.moveDown(1.2);

    doc
      .font("Helvetica-Bold")
      .fontSize(16)
      .fillColor("#111827")
      .text("AI Clinical Report", { align: "left" });
    doc.moveDown(0.8);

    const metaRows = [
      ["Patient", formatText(context.report.patient_name)],
      ["Report Type", formatReportType(context.report.type)],
      ["Period Start", formatDate(context.report.period_start)],
      ["Period End", formatDate(context.report.period_end)],
      ["Generated Date", formatDate(context.report.generated_at)],
    ];

    doc.font("Helvetica").fontSize(10.5).fillColor("#374151");
    for (const [label, value] of metaRows) {
      doc.font("Helvetica-Bold").text(`${label}: `, { continued: true });
      doc.font("Helvetica").text(value);
    }

    if (context.diagnoses.length > 0) {
      ensureSpace(doc, 120);
      addSectionTitle(doc, "Diagnosis");
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

    if (context.treatmentPlan) {
      ensureSpace(doc, 120);
      addSectionTitle(doc, "Treatment Plan");
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
    if (summaryData.isJson && summaryData.sections.executiveSummary) {
      addParagraph(doc, summaryData.sections.executiveSummary);
    } else if (summaryData.plainText) {
      addParagraph(doc, summaryData.plainText);
    } else {
      addParagraph(doc, "Not available");
    }

    ensureSpace(doc, 120);
    addSectionTitle(doc, "Clinical Notes");
    addSectionContent(doc, {
      bullets: summaryData.isJson ? summaryData.sections.clinicalNotes : [],
    });

    ensureSpace(doc, 120);
    addSectionTitle(doc, "Progress Analysis");
    addSectionContent(doc, {
      paragraphs: summaryData.isJson ? summaryData.sections.progressAnalysis : [],
      bullets: context.progressSnapshots.map((snapshot) => {
        const parts = [
          `${formatText(snapshot.period)} period`,
          `${formatDate(snapshot.period_start)} – ${formatDate(snapshot.period_end)}`,
          `Completed: ${snapshot.exercises_completed ?? 0}`,
        ];
        if (
          snapshot.average_performance !== null &&
          snapshot.average_performance !== undefined
        ) {
          parts.push(`Avg performance: ${snapshot.average_performance}`);
        }
        if (
          snapshot.improvement_percentage !== null &&
          snapshot.improvement_percentage !== undefined
        ) {
          parts.push(`Improvement: ${snapshot.improvement_percentage}%`);
        }
        return parts.join(" | ");
      }),
    });

    ensureSpace(doc, 120);
    addSectionTitle(doc, "Recommendations");
    addSectionContent(doc, {
      bullets: summaryData.isJson ? summaryData.sections.recommendations : [],
    });

    ensureSpace(doc, 120);
    addSectionTitle(doc, "Treatment Suggestions");
    addSectionContent(doc, {
      bullets: summaryData.isJson ? summaryData.sections.treatmentSuggestions : [],
    });

    ensureSpace(doc, 120);
    addSectionTitle(doc, "Goals Progress");
    const goalLines = [];
    if (summaryData.isJson && summaryData.sections.goalsProgress) {
      goalLines.push(summaryData.sections.goalsProgress);
    }
    for (const goal of context.goals) {
      const progress =
        goal.completion_percentage !== null &&
        goal.completion_percentage !== undefined
          ? `${goal.completion_percentage}%`
          : "No progress recorded";
      const achieved = goal.is_achieved ? "Achieved" : "In progress";
      goalLines.push(
        `${goal.title} (${goal.term}) — ${progress} — ${achieved}`
      );
    }
    addSectionContent(doc, { bullets: goalLines });

    ensureSpace(doc, 60);
    doc.moveDown(1);
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#9CA3AF")
      .text("AI Assisted Clinical Report", { align: "center" });
    doc.moveDown(0.2);
    doc.text(
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
  generateAiReportPdfFile,
  parseAiSummary,
};
