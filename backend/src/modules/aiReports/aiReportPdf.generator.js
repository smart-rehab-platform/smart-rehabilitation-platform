const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const {
  reportsUploadDir,
  ensureReportsDir,
  formatDate,
  formatText,
} = require("../reports/reportPdf.generator");
const {
  DEFAULT_AI_REPORT_LANGUAGE,
  normalizeAiReportLanguage,
} = require("./aiReportLanguage");
const {
  getPdfLabels,
  registerAiPdfFonts,
  getEnglishPdfFonts,
  preparePdfDisplayText,
  prepareArabicVisualLine,
  splitMixedFontRuns,
  containsArabic,
} = require("./aiReportPdf.i18n");

const backendRoot = path.resolve(__dirname, "../../..");
const AI_REPORT_LOGO_PATH = path.join(
  backendRoot,
  "assets",
  "branding",
  "smart_rehab_horizontal_logo.png"
);

const AI_PDF_COLORS = {
  navy: "#0E3A47",
  teal: "#0EA5B7",
  accent: "#22D3EE",
  body: "#374151",
  muted: "#6B7280",
  separator: "#E5E7EB",
  footer: "#9CA3AF",
};

const AI_PDF_LAYOUT = {
  pageMargin: 50,
  logoSize: 72,
  logoGap: 18,
  sectionTitleSize: 14,
  sectionSpacingBefore: 0.95,
  sectionSpacingAfter: 0.42,
  bulletMarkerWidth: 12,
  bulletGap: 4,
  columnGap: 28,
  longTokenBreakInterval: 30,
  bodyFontSize: 10.5,
  bodyLineGap: 3,
  /** Minimum space to keep a section heading with the first content line. */
  sectionKeepWithContent: 56,
  /** Minimum space for one bullet line (marker + first wrapped line). */
  bulletMinHeight: 18,
  footerReserved: 48,
};

const createAiPdfTheme = (doc, language) => {
  const resolvedLanguage = normalizeAiReportLanguage(language, {
    fallbackToDefault: true,
  });
  const isRtl = resolvedLanguage === "ar";
  // English keeps Helvetica. Arabic embeds Noto Naskh + Helvetica fallback for Latin.
  const fonts = isRtl ? registerAiPdfFonts(doc) : getEnglishPdfFonts();
  return {
    language: resolvedLanguage,
    isRtl,
    align: isRtl ? "right" : "left",
    fonts,
    labels: getPdfLabels(resolvedLanguage),
  };
};

const getTheme = (doc) => doc.__aiPdfTheme || createAiPdfTheme(doc, DEFAULT_AI_REPORT_LANGUAGE);

const getAiPageMetrics = (doc) => {
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const leftMargin = doc.page.margins.left;
  const rightMargin = doc.page.margins.right;
  const topMargin = doc.page.margins.top;
  const bottomMargin = doc.page.margins.bottom;
  const contentWidth = pageWidth - leftMargin - rightMargin;
  const contentRightX = pageWidth - rightMargin;
  const contentBottomY = pageHeight - bottomMargin;

  return {
    pageWidth,
    pageHeight,
    leftMargin,
    rightMargin,
    topMargin,
    bottomMargin,
    contentWidth,
    contentRightX,
    contentBottomY,
  };
};

const getAiRemainingHeight = (doc) => {
  const { contentBottomY } = getAiPageMetrics(doc);
  return contentBottomY - doc.y;
};

const ensureAiSpace = (doc, requiredHeight) => {
  if (requiredHeight <= 0) {
    return false;
  }
  if (getAiRemainingHeight(doc) >= requiredHeight) {
    return false;
  }
  doc.addPage();
  resetAiContentX(doc);
  return true;
};

const getAiContentWidth = (doc) => getAiPageMetrics(doc).contentWidth;

const getSafeTextWidth = (doc, startX, requestedWidth = null) => {
  const { contentRightX } = getAiPageMetrics(doc);
  const available = contentRightX - startX;
  const width = requestedWidth ?? available;
  return Math.max(0, Math.min(width, available));
};

const resetAiContentX = (doc) => {
  doc.x = doc.page.margins.left;
};

/** English-only soft-break helper. Never inject into Arabic (breaks shaping). */
const preparePdfText = (value, language = DEFAULT_AI_REPORT_LANGUAGE) => {
  const text = formatText(value);
  if (language === "ar") {
    return text;
  }
  const withBreaks = text.replace(/(\S{30})(?=\S)/g, "$1\u200B");
  return preparePdfDisplayText(withBreaks, language);
};

const measureMixedVisualWidth = (doc, visualText, fontSize, bold, fonts) => {
  let width = 0;
  for (const run of splitMixedFontRuns(visualText, { bold, fonts })) {
    doc.font(run.font).fontSize(fontSize);
    // Measure glyph-by-glyph. Multi-char Arabic widthOfString() goes through
    // fontkit layout which RTL-reverses and can disagree with our draw path.
    for (const char of run.text) {
      width += doc.widthOfString(char);
    }
  }
  return width;
};

const measureLogicalArabicLineWidth = (doc, logicalLine, fontSize, bold, fonts) => {
  const visual = prepareArabicVisualLine(logicalLine);
  return measureMixedVisualWidth(doc, visual, fontSize, bold, fonts);
};

const wrapLogicalArabicLines = (doc, text, maxWidth, fontSize, bold, fonts) => {
  const normalized = formatText(text, "").replace(/\s+/g, " ").trim();
  if (!normalized) {
    return [];
  }

  const words = normalized.split(" ");
  const lines = [];
  let current = "";

  const fits = (candidate) =>
    measureLogicalArabicLineWidth(doc, candidate, fontSize, bold, fonts) <= maxWidth + 0.01;

  const pushForcedBreaks = (word) => {
    let chunk = "";
    for (const char of word) {
      const next = chunk + char;
      if (chunk && !fits(next)) {
        lines.push(chunk);
        chunk = char;
      } else {
        chunk = next;
      }
    }
    if (chunk) {
      lines.push(chunk);
    }
  };

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (fits(candidate)) {
      current = candidate;
      continue;
    }
    if (current) {
      lines.push(current);
      current = "";
    }
    if (fits(word)) {
      current = word;
    } else {
      pushForcedBreaks(word);
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines;
};

/**
 * Draw a BiDi-visual line left-to-right without letting fontkit RTL-layout
 * reverse Arabic runs again (that double-reversal was the remaining order bug).
 */
const drawMixedVisualLine = (doc, visualText, x, y, { fontSize, bold, color, fonts }) => {
  let cursorX = x;
  for (const run of splitMixedFontRuns(visualText, { bold, fonts })) {
    doc.font(run.font).fontSize(fontSize).fillColor(color);
    for (const char of run.text) {
      const charWidth = doc.widthOfString(char);
      doc.text(char, cursorX, y, {
        lineBreak: false,
        continued: false,
        features: {},
      });
      cursorX += charWidth;
    }
  }
  return cursorX;
};

const drawArabicParagraph = (doc, text, options = {}) => {
  const theme = getTheme(doc);
  const { leftMargin, contentWidth } = getAiPageMetrics(doc);
  const startX = options.x ?? leftMargin;
  const width = getSafeTextWidth(doc, startX, options.width ?? contentWidth);
  const fontSize = options.fontSize ?? AI_PDF_LAYOUT.bodyFontSize;
  const bold = Boolean(options.bold);
  const color = options.color ?? AI_PDF_COLORS.body;
  const lineGap = options.lineGap ?? AI_PDF_LAYOUT.bodyLineGap;
  const fonts = theme.fonts;

  const logicalLines = wrapLogicalArabicLines(doc, text, width, fontSize, bold, fonts);
  if (logicalLines.length === 0) {
    return doc.y;
  }

  const lineHeight = fontSize + lineGap;
  if (!options.skipPageCheck) {
    ensureAiSpace(doc, Math.min(logicalLines.length * lineHeight, fontSize + lineGap + 2));
  }

  let y = options.y ?? doc.y;
  for (const logicalLine of logicalLines) {
    if (!options.skipPageCheck) {
      const advanced = ensureAiSpace(doc, lineHeight);
      if (advanced) {
        y = doc.y;
      }
    }

    const visual = prepareArabicVisualLine(logicalLine);
    const visualWidth = measureMixedVisualWidth(doc, visual, fontSize, bold, fonts);
    const drawX = Math.max(startX, startX + width - visualWidth);
    drawMixedVisualLine(doc, visual, drawX, y, { fontSize, bold, color, fonts });
    y += lineHeight;
    doc.y = y;
  }

  doc.x = leftMargin;
  return doc.y;
};

const measureAiTextHeight = (doc, text, width, options = {}) => {
  const theme = getTheme(doc);
  const fontSize = options.fontSize ?? AI_PDF_LAYOUT.bodyFontSize;
  const bold = Boolean(options.bold) || options.font === theme.fonts.bold;
  const lineGap = options.lineGap ?? AI_PDF_LAYOUT.bodyLineGap;

  if (theme.isRtl) {
    const lines = wrapLogicalArabicLines(
      doc,
      text,
      width,
      fontSize,
      bold,
      theme.fonts,
    );
    if (lines.length === 0) {
      return 0;
    }
    return lines.length * (fontSize + lineGap);
  }

  const font = options.font
    ?? (options.bold ? theme.fonts.bold : theme.fonts.regular);

  doc.font(font).fontSize(fontSize);
  return doc.heightOfString(preparePdfText(text, theme.language), {
    width,
    lineGap,
    align: options.align ?? theme.align,
  });
};

const drawAiWrappedText = (doc, text, options = {}) => {
  const theme = getTheme(doc);
  if (theme.isRtl) {
    return drawArabicParagraph(doc, text, {
      ...options,
      bold: Boolean(options.bold) || options.font === theme.fonts.bold,
    });
  }

  const prepared = preparePdfText(text, theme.language);
  const { leftMargin, contentWidth } = getAiPageMetrics(doc);
  const startX = options.x ?? leftMargin;
  const width = getSafeTextWidth(doc, startX, options.width ?? contentWidth);
  const fontSize = options.fontSize ?? AI_PDF_LAYOUT.bodyFontSize;
  const font = options.font
    ?? (options.bold ? theme.fonts.bold : theme.fonts.regular);
  const color = options.color ?? AI_PDF_COLORS.body;
  const lineGap = options.lineGap ?? AI_PDF_LAYOUT.bodyLineGap;
  const align = options.align ?? theme.align;
  const height = measureAiTextHeight(doc, text, width, {
    fontSize,
    font,
    lineGap,
    align,
  });

  if (!options.skipPageCheck) {
    ensureAiSpace(doc, Math.min(height, fontSize + lineGap + 2));
  }

  const startY = options.y ?? doc.y;

  doc
    .font(font)
    .fontSize(fontSize)
    .fillColor(color)
    .text(prepared, startX, startY, {
      width,
      align,
      lineGap,
      lineBreak: options.lineBreak !== false,
    });

  doc.x = leftMargin;
  return doc.y;
};

const drawAiLabelValueRow = (doc, label, value, options = {}) => {
  const theme = getTheme(doc);
  const startX = options.x ?? doc.page.margins.left;
  const width = getSafeTextWidth(doc, startX, options.width);
  const rowText = `${label}: ${formatText(value)}`;
  const height = measureAiTextHeight(doc, rowText, width, {
    fontSize: AI_PDF_LAYOUT.bodyFontSize,
    lineGap: 2,
  });

  ensureAiSpace(doc, Math.min(height, AI_PDF_LAYOUT.bulletMinHeight));

  const startY = options.y ?? doc.y;

  if (theme.isRtl) {
    drawArabicParagraph(doc, rowText, {
      x: startX,
      y: startY,
      width,
      fontSize: AI_PDF_LAYOUT.bodyFontSize,
      lineGap: 2,
      skipPageCheck: true,
    });
    return doc.y;
  }

  const display = preparePdfText(rowText, theme.language);

  doc
    .font(theme.fonts.regular)
    .fontSize(AI_PDF_LAYOUT.bodyFontSize)
    .fillColor(AI_PDF_COLORS.body)
    .text(display, startX, startY, {
      width,
      align: theme.align,
      lineGap: 2,
    });

  doc.x = doc.page.margins.left;
  return doc.y;
};

const drawGeometricBullet = (doc, x, y, fontSize, color) => {
  const radius = Math.max(1.4, fontSize * 0.14);
  const centerX = x + radius;
  const centerY = y + fontSize * 0.42;
  doc
    .circle(centerX, centerY, radius)
    .fillColor(color)
    .fill();
};

const drawAiBulletList = (doc, items, options = {}) => {
  const theme = getTheme(doc);
  const lines = (items || [])
    .map((item) => (item == null ? "" : String(item).trim()))
    .filter((item) => item.length > 0);

  if (lines.length === 0) {
    drawAiWrappedText(doc, theme.labels.notAvailable, options);
    return;
  }

  const { leftMargin, contentWidth, contentRightX } = getAiPageMetrics(doc);
  const blockWidth = getSafeTextWidth(doc, leftMargin, options.width ?? contentWidth);
  const markerWidth = AI_PDF_LAYOUT.bulletMarkerWidth;
  const textWidth = Math.max(0, blockWidth - markerWidth - AI_PDF_LAYOUT.bulletGap);

  for (const item of lines) {
    const textHeight = measureAiTextHeight(doc, item, textWidth, {
      fontSize: AI_PDF_LAYOUT.bodyFontSize,
      lineGap: AI_PDF_LAYOUT.bodyLineGap,
    });
    const itemHeight = Math.max(textHeight, AI_PDF_LAYOUT.bodyFontSize);

    ensureAiSpace(doc, Math.min(itemHeight, AI_PDF_LAYOUT.bulletMinHeight));

    const itemY = doc.y;

    if (theme.isRtl) {
      const textX = leftMargin;
      const bulletAreaX = contentRightX - markerWidth;
      drawGeometricBullet(
        doc,
        bulletAreaX + 2,
        itemY,
        AI_PDF_LAYOUT.bodyFontSize,
        AI_PDF_COLORS.body,
      );
      drawArabicParagraph(doc, item, {
        x: textX,
        y: itemY,
        width: textWidth,
        fontSize: AI_PDF_LAYOUT.bodyFontSize,
        lineGap: AI_PDF_LAYOUT.bodyLineGap,
        skipPageCheck: true,
      });
      doc.y = Math.max(doc.y, itemY + itemHeight);
    } else {
      const bulletX = leftMargin;
      const textX = leftMargin + markerWidth + AI_PDF_LAYOUT.bulletGap;
      const prepared = preparePdfText(item, theme.language);

      doc
        .font(theme.fonts.regular)
        .fontSize(AI_PDF_LAYOUT.bodyFontSize)
        .fillColor(AI_PDF_COLORS.body)
        .text("•", bulletX, itemY, {
          width: markerWidth,
          align: "left",
          lineBreak: false,
        });

      doc
        .font(theme.fonts.regular)
        .fontSize(AI_PDF_LAYOUT.bodyFontSize)
        .fillColor(AI_PDF_COLORS.body)
        .text(prepared, textX, itemY, {
          width: textWidth,
          align: "left",
          lineGap: AI_PDF_LAYOUT.bodyLineGap,
        });

      doc.y = Math.max(doc.y, itemY + itemHeight);
    }

    doc.x = leftMargin;
    doc.moveDown(0.12);
  }
};

const addAiParagraph = (doc, text) => {
  drawAiWrappedText(doc, text);
};

const addAiBulletList = (doc, items, options = {}) => {
  drawAiBulletList(doc, items, options);
};

const addAiSectionTitle = (doc, title) => {
  const theme = getTheme(doc);
  resetAiContentX(doc);
  const spacingBefore = AI_PDF_LAYOUT.sectionSpacingBefore * AI_PDF_LAYOUT.bodyFontSize;
  const titleHeight = measureAiTextHeight(doc, title, getAiContentWidth(doc), {
    font: theme.fonts.bold,
    fontSize: AI_PDF_LAYOUT.sectionTitleSize,
    lineGap: 0,
  });
  const spacingAfter = AI_PDF_LAYOUT.sectionSpacingAfter * AI_PDF_LAYOUT.bodyFontSize;

  ensureAiSpace(
    doc,
    spacingBefore + titleHeight + spacingAfter + AI_PDF_LAYOUT.bulletMinHeight,
  );

  doc.moveDown(AI_PDF_LAYOUT.sectionSpacingBefore);
  drawAiWrappedText(doc, title, {
    font: theme.fonts.bold,
    fontSize: AI_PDF_LAYOUT.sectionTitleSize,
    color: AI_PDF_COLORS.navy,
    lineGap: 0,
    skipPageCheck: true,
  });
  doc.moveDown(AI_PDF_LAYOUT.sectionSpacingAfter);
  resetAiContentX(doc);
};

const addAiReportHeader = (doc) => {
  const theme = getTheme(doc);
  const marginLeft = doc.page.margins.left;
  const contentWidth = getAiContentWidth(doc);
  const headerTop = doc.y;
  const logoSize = AI_PDF_LAYOUT.logoSize;
  const logoGap = AI_PDF_LAYOUT.logoGap;
  const textX = marginLeft + logoSize + logoGap;
  const textWidth = contentWidth - logoSize - logoGap;
  const titleBlockHeight = 40;
  const titleY = headerTop + Math.max(0, (logoSize - titleBlockHeight) / 2);

  if (fs.existsSync(AI_REPORT_LOGO_PATH)) {
    doc.image(AI_REPORT_LOGO_PATH, marginLeft, headerTop, {
      fit: [logoSize, logoSize],
      align: "left",
      valign: "top",
    });
  }

  // Brand name is always English Latin — never draw with Arabic-only font.
  const brandFont = theme.isRtl
    ? theme.fonts.latinBold || "Helvetica-Bold"
    : theme.fonts.bold;

  doc
    .font(brandFont)
    .fontSize(18)
    .fillColor(AI_PDF_COLORS.navy)
    .text(theme.labels.brandTitle, textX, titleY, {
      width: textWidth,
      lineBreak: false,
      align: "left",
    });

  if (theme.isRtl && containsArabic(theme.labels.brandSubtitle)) {
    const visual = prepareArabicVisualLine(theme.labels.brandSubtitle);
    drawMixedVisualLine(doc, visual, textX, titleY + 22, {
      fontSize: 11,
      bold: false,
      color: AI_PDF_COLORS.teal,
      fonts: theme.fonts,
    });
  } else {
    doc
      .font(theme.fonts.regular)
      .fontSize(11)
      .fillColor(AI_PDF_COLORS.teal)
      .text(theme.labels.brandSubtitle, textX, titleY + 22, {
        width: textWidth,
        lineBreak: false,
        align: "left",
      });
  }

  doc.x = marginLeft;
  doc.y = headerTop + logoSize + 12;

  doc
    .moveTo(marginLeft, doc.y)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y)
    .strokeColor(AI_PDF_COLORS.accent)
    .lineWidth(1.25)
    .stroke();

  doc.moveDown(0.9);
  resetAiContentX(doc);
};

const addAiReportInformation = (doc, metaRows) => {
  const { leftMargin, contentWidth } = getAiPageMetrics(doc);
  const columnWidth = (contentWidth - AI_PDF_LAYOUT.columnGap) / 2;
  const rightColumnX = leftMargin + columnWidth + AI_PDF_LAYOUT.columnGap;
  const safeLeftWidth = getSafeTextWidth(doc, leftMargin, columnWidth);
  const safeRightWidth = getSafeTextWidth(doc, rightColumnX, columnWidth);
  const startY = doc.y;

  const leftRows = metaRows.slice(0, 3);
  const rightRows = metaRows.slice(3);

  let leftY = startY;
  for (const [label, value] of leftRows) {
    leftY = drawAiLabelValueRow(doc, label, value, {
      x: leftMargin,
      y: leftY,
      width: safeLeftWidth,
    }) + 4;
  }

  let rightY = startY;
  for (const [label, value] of rightRows) {
    rightY = drawAiLabelValueRow(doc, label, value, {
      x: rightColumnX,
      y: rightY,
      width: safeRightWidth,
    }) + 4;
  }

  doc.x = leftMargin;
  doc.y = Math.max(leftY, rightY);
};

const drawAiFooterGeneratedLine = (doc, generatedAt) => {
  const theme = getTheme(doc);
  const dateText = generatedAt.toLocaleString(theme.language === "ar" ? "ar" : "en-US");
  const prefix = `${theme.labels.footerGeneratedPrefix} ${dateText} ${theme.labels.footerGeneratedBy} `;
  const platform = theme.labels.footerPlatform;
  const fontSize = 9;
  const lineY = doc.y;
  const fonts = theme.fonts;

  if (theme.isRtl) {
    const visualPrefix = prepareArabicVisualLine(prefix);
    const visualPlatform = platform; // English brand — no Arabic reshape
    const prefixWidth = measureMixedVisualWidth(doc, visualPrefix, fontSize, false, fonts);
    doc.font(fonts.latinRegular || "Helvetica").fontSize(fontSize);
    const platformWidth = doc.widthOfString(visualPlatform);
    const totalWidth = prefixWidth + platformWidth;
    const startX = (doc.page.width - totalWidth) / 2;

    drawMixedVisualLine(doc, visualPrefix, startX, lineY, {
      fontSize,
      bold: false,
      color: AI_PDF_COLORS.muted,
      fonts,
    });
    doc
      .font(fonts.latinRegular || "Helvetica")
      .fontSize(fontSize)
      .fillColor(AI_PDF_COLORS.teal)
      .text(visualPlatform, startX + prefixWidth, lineY, {
        lineBreak: false,
      });
    doc.x = doc.page.margins.left;
    return;
  }

  doc.font(theme.fonts.regular).fontSize(fontSize);

  const shapedPrefix = preparePdfText(prefix, theme.language);
  const shapedPlatform = preparePdfText(platform, theme.language);
  const totalWidth = doc.widthOfString(shapedPrefix) + doc.widthOfString(shapedPlatform);
  const startX = (doc.page.width - totalWidth) / 2;

  doc
    .fillColor(AI_PDF_COLORS.muted)
    .text(shapedPrefix, startX, lineY, { lineBreak: false, continued: true });

  doc
    .fillColor(AI_PDF_COLORS.teal)
    .text(shapedPlatform, { lineBreak: false });

  doc.x = doc.page.margins.left;
};

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

const formatReportType = (value, language = DEFAULT_AI_REPORT_LANGUAGE) => {
  const text = formatText(value, "Report");
  if (language === "ar") {
    const normalized = text.toLowerCase();
    if (normalized === "weekly") return "أسبوعي";
    if (normalized === "monthly") return "شهري";
  }
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const addSectionContent = (doc, { paragraphs = [], bullets = [] }) => {
  const theme = getTheme(doc);
  const hasParagraphs = paragraphs.some((item) => item && String(item).trim());
  const hasBullets = bullets.some((item) => item && String(item).trim());

  if (!hasParagraphs && !hasBullets) {
    addAiParagraph(doc, theme.labels.notAvailable);
    return;
  }

  for (const paragraph of paragraphs) {
    if (paragraph && String(paragraph).trim()) {
      addAiParagraph(doc, paragraph);
      doc.moveDown(0.2);
    }
  }

  if (hasBullets) {
    addAiBulletList(doc, bullets);
  }
};

const generateAiReportPdfFile = async (context) => {
  ensureReportsDir();

  const fileName = `ai_report_${context.report.id}.pdf`;
  const filePath = path.join(reportsUploadDir, fileName);
  const summaryData = parseAiSummary(context.report.summary);
  let summaryLanguage = null;
  try {
    const parsed = typeof context.report.summary === "string"
      ? JSON.parse(context.report.summary)
      : context.report.summary;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      summaryLanguage = parsed.language;
    }
  } catch {
    summaryLanguage = null;
  }
  const reportLanguage = normalizeAiReportLanguage(
    context.report.language ?? summaryLanguage,
    { fallbackToDefault: true },
  );

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: AI_PDF_LAYOUT.pageMargin,
      info: {
        Title: getPdfLabels(reportLanguage).brandSubtitle,
        Author: "Smart Rehabilitation Platform",
      },
    });

    doc.__aiPdfTheme = createAiPdfTheme(doc, reportLanguage);
    const theme = doc.__aiPdfTheme;

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const generatedAt = new Date();

    addAiReportHeader(doc);

    addAiSectionTitle(doc, theme.labels.reportInformation);

    const metaRows = [
      [theme.labels.patient, formatText(context.report.patient_name)],
      [theme.labels.reportType, formatReportType(context.report.type, theme.language)],
      [theme.labels.periodStart, formatDate(context.report.period_start)],
      [theme.labels.periodEnd, formatDate(context.report.period_end)],
      [theme.labels.generatedDate, formatDate(context.report.generated_at)],
    ];

    addAiReportInformation(doc, metaRows);

    if (context.diagnoses.length > 0) {
      addAiSectionTitle(doc, theme.labels.diagnosis);
      addAiBulletList(
        doc,
        context.diagnoses.map((item) => {
          const parts = [item.diagnosis_title];
          if (item.description) {
            parts.push(item.description);
          }
          parts.push(`${theme.labels.diagnosed}: ${formatDate(item.diagnosed_at)}`);
          return parts.join(" — ");
        })
      );
    }

    if (context.treatmentPlan) {
      addAiSectionTitle(doc, theme.labels.treatmentPlan);
      const plan = context.treatmentPlan;
      addAiBulletList(doc, [
        `${theme.labels.title}: ${formatText(plan.title)}`,
        `${theme.labels.status}: ${formatText(plan.status)}`,
        `${theme.labels.startDate}: ${formatDate(plan.start_date)}`,
        plan.end_date ? `${theme.labels.endDate}: ${formatDate(plan.end_date)}` : null,
      ]);
    }

    addAiSectionTitle(doc, theme.labels.executiveSummary);
    if (summaryData.isJson && summaryData.sections.executiveSummary) {
      addAiParagraph(doc, summaryData.sections.executiveSummary);
    } else if (summaryData.plainText) {
      addAiParagraph(doc, summaryData.plainText);
    } else {
      addAiParagraph(doc, theme.labels.notAvailable);
    }

    addAiSectionTitle(doc, theme.labels.clinicalNotes);
    addSectionContent(doc, {
      bullets: summaryData.isJson ? summaryData.sections.clinicalNotes : [],
    });

    addAiSectionTitle(doc, theme.labels.progressAnalysis);
    addSectionContent(doc, {
      paragraphs: summaryData.isJson ? summaryData.sections.progressAnalysis : [],
      bullets: context.progressSnapshots.map((snapshot) => {
        const parts = [
          `${formatText(snapshot.period)} ${theme.labels.period}`,
          `${formatDate(snapshot.period_start)} – ${formatDate(snapshot.period_end)}`,
          `${theme.labels.completed}: ${snapshot.exercises_completed ?? 0}`,
        ];
        if (
          snapshot.average_performance !== null &&
          snapshot.average_performance !== undefined
        ) {
          parts.push(`${theme.labels.avgPerformance}: ${snapshot.average_performance}`);
        }
        if (
          snapshot.improvement_percentage !== null &&
          snapshot.improvement_percentage !== undefined
        ) {
          parts.push(`${theme.labels.improvement}: ${snapshot.improvement_percentage}%`);
        }
        return parts.join(" | ");
      }),
    });

    addAiSectionTitle(doc, theme.labels.recommendations);
    addSectionContent(doc, {
      bullets: summaryData.isJson ? summaryData.sections.recommendations : [],
    });

    addAiSectionTitle(doc, theme.labels.nextSteps);
    addSectionContent(doc, {
      bullets: summaryData.isJson ? summaryData.sections.treatmentSuggestions : [],
    });

    addAiSectionTitle(doc, theme.labels.goalsProgress);
    const goalLines = [];
    if (summaryData.isJson && summaryData.sections.goalsProgress) {
      goalLines.push(summaryData.sections.goalsProgress);
    }
    for (const goal of context.goals) {
      const progress =
        goal.completion_percentage !== null &&
        goal.completion_percentage !== undefined
          ? `${goal.completion_percentage}%`
          : theme.labels.noProgressRecorded;
      const achieved = goal.is_achieved ? theme.labels.achieved : theme.labels.inProgress;
      goalLines.push(
        `${goal.title} (${goal.term}) — ${progress} — ${achieved}`
      );
    }
    addSectionContent(doc, { bullets: goalLines });

    ensureAiSpace(doc, AI_PDF_LAYOUT.footerReserved);
    doc.moveDown(1);
    if (theme.isRtl) {
      const assisted = theme.labels.footerAssisted;
      const visual = prepareArabicVisualLine(assisted);
      const fontSize = 9;
      const visualWidth = measureMixedVisualWidth(doc, visual, fontSize, false, theme.fonts);
      const startX = (doc.page.width - visualWidth) / 2;
      drawMixedVisualLine(doc, visual, startX, doc.y, {
        fontSize,
        bold: false,
        color: AI_PDF_COLORS.footer,
        fonts: theme.fonts,
      });
      doc.moveDown(0.55);
    } else {
      doc
        .font(theme.fonts.regular)
        .fontSize(9)
        .fillColor(AI_PDF_COLORS.footer)
        .text(preparePdfText(theme.labels.footerAssisted, theme.language), {
          align: "center",
        });
      doc.moveDown(0.2);
    }
    drawAiFooterGeneratedLine(doc, generatedAt);

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
  addAiReportHeader,
  addAiSectionTitle,
  addAiReportInformation,
  addAiParagraph,
  addAiBulletList,
  drawAiWrappedText,
  drawAiBulletList,
  drawAiLabelValueRow,
  preparePdfText,
  getAiPageMetrics,
  getSafeTextWidth,
  getAiRemainingHeight,
  ensureAiSpace,
  measureAiTextHeight,
  AI_PDF_COLORS,
  AI_PDF_LAYOUT,
  AI_REPORT_LOGO_PATH,
  getAiContentWidth,
  resetAiContentX,
};
