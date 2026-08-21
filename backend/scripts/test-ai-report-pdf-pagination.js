/**
 * Pagination / orphan-bullet regression tests for AI report PDFs.
 * Run: node scripts/test-ai-report-pdf-pagination.js
 */
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const {
  addAiReportHeader,
  addAiSectionTitle,
  addAiBulletList,
  addAiParagraph,
  ensureAiSpace,
  getAiRemainingHeight,
  AI_PDF_LAYOUT,
  generateAiReportPdfFile,
} = require("../src/modules/aiReports/aiReportPdf.generator");

let passed = 0;
const pass = (label) => {
  passed += 1;
  console.log(`  ✓ ${label}`);
};

const countPdfPages = (filePath) => {
  const raw = fs.readFileSync(filePath, "utf8");
  const matches = raw.match(/\/Type\s*\/Page\b/g);
  return matches ? matches.length : 0;
};

(async () => {
  const outputDir = path.join(__dirname, "phase-b-fixtures");
  fs.mkdirSync(outputDir, { recursive: true });

  {
    // Reproduce near-bottom bullet rendering without creating an orphan page.
    const outputPath = path.join(outputDir, "ai-report-pagination-orphan.pdf");
    await new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: "A4", margin: AI_PDF_LAYOUT.pageMargin });
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      addAiReportHeader(doc);
      addAiSectionTitle(doc, "Next Steps");
      addAiBulletList(doc, [
        "Continue therapy with structured home practice three times per week.",
        "Review weekend adherence and adjust reinforcement schedule as needed.",
      ]);

      // Force cursor near the bottom of the current page (same condition that
      // previously triggered ensureSpace(120) + orphan bullet pages).
      const nearBottom = doc.page.height - doc.page.margins.bottom - 40;
      if (doc.y < nearBottom) {
        doc.y = nearBottom;
      }

      addAiSectionTitle(doc, "Goals Progress");
      addAiBulletList(doc, [
        "Improve articulation of /s/ and /r/ phonemes with clinician feedback — In progress",
        "Increase exercise submission consistency during school weeks — 60% — In progress",
        "",
        "   ",
        null,
        "Maintain parent-supported practice logs — Achieved",
      ]);

      addAiParagraph(doc, "Closing narrative. ".repeat(40));

      doc.end();
      stream.on("finish", resolve);
      stream.on("error", reject);
      doc.on("error", reject);
    });

    const pages = countPdfPages(outputPath);
    assert.ok(pages >= 2, `expected multi-page PDF, got ${pages}`);
    // Heuristic: page count should stay modest; orphan blank pages would inflate count.
    assert.ok(pages <= 4, `unexpectedly many pages (${pages}) — possible blank middle page`);
    pass(`near-bottom Goals Progress pagination (${pages} pages, no empty list items)`);
  }

  {
    const remainingDoc = new PDFDocument({ size: "A4", margin: AI_PDF_LAYOUT.pageMargin });
    remainingDoc.y = remainingDoc.page.height - remainingDoc.page.margins.bottom - 10;
    const remainingBefore = getAiRemainingHeight(remainingDoc);
    assert.ok(remainingBefore < AI_PDF_LAYOUT.sectionKeepWithContent);
    const didBreak = ensureAiSpace(remainingDoc, AI_PDF_LAYOUT.sectionKeepWithContent);
    assert.strictEqual(didBreak, true);
    assert.ok(getAiRemainingHeight(remainingDoc) > 100);
    remainingDoc.end();
    pass("ensureAiSpace only breaks when content cannot fit");
  }

  {
    // Full generator path with enough content to span multiple pages.
    const reportId = "pagination-stress-0001";
    const context = {
      report: {
        id: reportId,
        patient_name: "Omar Alaa",
        type: "monthly",
        period_start: "2026-08-01",
        period_end: "2026-08-20",
        generated_at: "2026-08-21T00:30:00.000Z",
        summary: JSON.stringify({
          executive_summary: "Executive summary paragraph. ".repeat(60),
          clinical_insights: [
            "Insight one with enough detail to wrap across multiple lines in the printable content width.",
            "Insight two about speech consistency and clinician observation notes.",
            "",
            "   ",
          ],
          risks_or_regressions: [
            "Weekend adherence drop should be monitored without creating alarmist interpretation.",
          ],
          patient_progress_summary: "Patient progress narrative. ".repeat(25),
          speech_analysis_summary: "Speech analysis narrative. ".repeat(25),
          exercise_adherence_summary: "Exercise adherence narrative. ".repeat(20),
          recommendations: [
            "Continue current therapy plan with parent-supported home practice.",
            "Reassess phoneme accuracy after the next reporting period.",
          ],
          next_steps: [
            "Schedule follow-up session and review weekend exercise logs.",
            "Confirm goal milestones with the assigned specialist.",
          ],
          goal_progress_summary: "Overall goal trajectory remains positive with measurable gains.",
        }),
      },
      diagnoses: [
        {
          diagnosis_title: "Delayed Speech",
          description: "Observed expressive language delay",
          diagnosed_at: "2026-01-15",
        },
      ],
      treatmentPlan: {
        title: "Speech therapy plan",
        status: "Active",
        start_date: "2026-02-01",
        end_date: "2026-12-01",
      },
      progressSnapshots: [
        {
          period: "weekly",
          period_start: "2026-08-07",
          period_end: "2026-08-13",
          exercises_completed: 4,
          average_performance: 7.5,
          improvement_percentage: 8,
        },
      ],
      goals: [
        {
          title: "Improve articulation accuracy for target phonemes during structured practice sessions",
          term: "short",
          completion_percentage: 55,
          is_achieved: false,
        },
        {
          title: "Increase home practice consistency",
          term: "medium",
          completion_percentage: 70,
          is_achieved: false,
        },
      ],
    };

    const result = await generateAiReportPdfFile(context);
    assert.ok(fs.existsSync(result.filePath));
    const pages = countPdfPages(result.filePath);
    assert.ok(pages >= 2, `expected multi-page generated report, got ${pages}`);
    assert.ok(pages <= 5, `possible blank middle page: ${pages} pages for stress content`);
    pass(`full AI report generator multi-page smoke (${pages} pages)`);
  }

  console.log(`\n${passed} checks passed.`);
})().catch((error) => {
  console.error("\nFAILED:", error);
  process.exit(1);
});
