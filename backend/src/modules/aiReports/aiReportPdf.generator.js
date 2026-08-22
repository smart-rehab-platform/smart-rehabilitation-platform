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
  prepareArabicRunVisual,
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

/**
 * Draw a BiDi-visual line left-to-right without letting fontkit RTL-layout
 * reverse Arabic runs again (that double-reversal was the remaining order bug).
 *
 * Latin/number runs are drawn as whole strings (stable LTR + shared baseline).
 * Arabic runs stay glyph-by-glyph so fontkit cannot re-reverse them.
 */
const drawMixedVisualLine = (doc, visualText, x, y, { fontSize, bold, color, fonts }) => {
  let cursorX = x;
  const arabicFontName = bold
    ? fonts?.bold || fonts?.regular
    : fonts?.regular;
  doc.font(arabicFontName || "Helvetica").fontSize(fontSize);
  const arabicFont = doc._font;
  const arabicUnits = arabicFont.unitsPerEm || 1000;
  const arabicAscender = ((arabicFont.ascender || 0) / arabicUnits) * fontSize;

  for (const run of splitMixedFontRuns(visualText, { bold, fonts })) {
    doc.font(run.font).fontSize(fontSize).fillColor(color);
    const isArabicRun = run.font === fonts?.regular || run.font === fonts?.bold;

    if (!isArabicRun) {
      const latinFont = doc._font;
      const latinUnits = latinFont.unitsPerEm || 1000;
      const latinAscender = ((latinFont.ascender || 0) / latinUnits) * fontSize;
      const yAdjust = arabicAscender - latinAscender;
      const runWidth = doc.widthOfString(run.text);
      doc.text(run.text, cursorX, y + yAdjust, {
        lineBreak: false,
        continued: false,
        features: {},
      });
      cursorX += runWidth;
      continue;
    }

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

/**
 * Measure run width using the same strategy as drawMixedVisualLine
 * (whole-string Latin, per-glyph Arabic).
 */
const measureMixedVisualWidth = (doc, visualText, fontSize, bold, fonts) => {
  let width = 0;
  for (const run of splitMixedFontRuns(visualText, { bold, fonts })) {
    doc.font(run.font).fontSize(fontSize);
    const isArabicRun = run.font === fonts?.regular || run.font === fonts?.bold;
    if (!isArabicRun) {
      width += doc.widthOfString(run.text);
      continue;
    }
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
  // Only need the first line to start; remaining lines paginate below.
  if (!options.skipPageCheck) {
    const advanced = ensureAiSpace(doc, lineHeight);
    if (advanced && options.y != null) {
      // Absolute y from the previous page is stale after a forced break.
      options = { ...options, y: undefined };
    }
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
  const lineHeight = fontSize + lineGap;

  // Require only the first line up front — never reserve the whole paragraph.
  if (!options.skipPageCheck) {
    ensureAiSpace(doc, lineHeight);
  }

  // Flow from the current cursor (no absolute y). PDFKit can then continue
  // long English paragraphs onto the next page without orphan blank pages.
  if (options.y != null) {
    doc.y = options.y;
  }
  doc.x = startX;

  doc
    .font(font)
    .fontSize(fontSize)
    .fillColor(color)
    .text(prepared, {
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
  const lineHeight = AI_PDF_LAYOUT.bodyFontSize + AI_PDF_LAYOUT.bodyLineGap;

  for (const item of lines) {
    // Start an item when the first line fits — never reserve the whole item/list.
    ensureAiSpace(doc, Math.max(lineHeight, AI_PDF_LAYOUT.bulletMinHeight));

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
      // Paginate wrapped Arabic lines; do not pin doc.y to a pre-measured block height.
      drawArabicParagraph(doc, item, {
        x: textX,
        y: itemY,
        width: textWidth,
        fontSize: AI_PDF_LAYOUT.bodyFontSize,
        lineGap: AI_PDF_LAYOUT.bodyLineGap,
        skipPageCheck: false,
      });
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

      // Flow from the bullet row without absolute multi-line y pinning, so PDFKit
      // can continue long items onto the next page and leave a correct cursor.
      doc.x = textX;
      doc.y = itemY;
      doc
        .font(theme.fonts.regular)
        .fontSize(AI_PDF_LAYOUT.bodyFontSize)
        .fillColor(AI_PDF_COLORS.body)
        .text(prepared, {
          width: textWidth,
          align: "left",
          lineGap: AI_PDF_LAYOUT.bodyLineGap,
        });
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

  // Keep heading with at least the first body line — do NOT require the whole section.
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

  // Split across the two columns as evenly as possible.
  // AI (5 rows) stays 3+2; regular (4 rows) becomes 2+2 — same grid geometry.
  const leftCount = Math.ceil((metaRows || []).length / 2);
  const leftRows = metaRows.slice(0, leftCount);
  const rightRows = metaRows.slice(leftCount);

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
  const platform = theme.labels.footerPlatform;
  const fontSize = 9;
  const lineY = doc.y;
  const fonts = theme.fonts;

  if (theme.isRtl) {
    // Absolute-positioned separate runs — never concatenate or BiDi the mixed line.
    // Exact visual LTR order:
    //   تم الإنشاء في | 8/21/2026, 7:50:53 PM | بواسطة | Smart Rehabilitation Platform
    const dateText = generatedAt.toLocaleString("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    });
    const latinFont = fonts.latinRegular || "Helvetica";
    const prefixVisual = prepareArabicRunVisual(
      theme.labels.footerGeneratedPrefix
    );
    const byVisual = prepareArabicRunVisual(theme.labels.footerGeneratedBy);

    const prefixWidth = measureMixedVisualWidth(
      doc,
      prefixVisual,
      fontSize,
      false,
      fonts
    );
    const byWidth = measureMixedVisualWidth(
      doc,
      byVisual,
      fontSize,
      false,
      fonts
    );
    doc.font(latinFont).fontSize(fontSize);
    const spaceWidth = doc.widthOfString(" ");
    const dateWidth = doc.widthOfString(dateText);
    const platformWidth = doc.widthOfString(platform);
    const totalWidth =
      prefixWidth +
      spaceWidth +
      dateWidth +
      spaceWidth +
      byWidth +
      spaceWidth +
      platformWidth;

    const startX = (doc.page.width - totalWidth) / 2;
    const dateX = startX + prefixWidth + spaceWidth;
    const byX = dateX + dateWidth + spaceWidth;
    const platformX = byX + byWidth + spaceWidth;

    drawMixedVisualLine(doc, prefixVisual, startX, lineY, {
      fontSize,
      bold: false,
      color: AI_PDF_COLORS.muted,
      fonts,
    });

    doc
      .font(latinFont)
      .fontSize(fontSize)
      .fillColor(AI_PDF_COLORS.muted)
      .text(dateText, dateX, lineY, {
        lineBreak: false,
        continued: false,
        features: {},
        width: dateWidth + 1,
      });

    drawMixedVisualLine(doc, byVisual, byX, lineY, {
      fontSize,
      bold: false,
      color: AI_PDF_COLORS.muted,
      fonts,
    });

    doc
      .font(latinFont)
      .fontSize(fontSize)
      .fillColor(AI_PDF_COLORS.teal)
      .text(platform, platformX, lineY, {
        lineBreak: false,
        continued: false,
        features: {},
        width: platformWidth + 1,
      });

    doc.x = doc.page.margins.left;
    doc.y = lineY + fontSize;
    return;
  }

  const dateText = generatedAt.toLocaleString("en-US");
  const prefix = `${theme.labels.footerGeneratedPrefix} ${dateText} ${theme.labels.footerGeneratedBy} `;

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

/** Shared AI/regular report footer: centered label + generated metadata line. */
const addAiReportFooter = (doc, generatedAt) => {
  const theme = getTheme(doc);
  ensureAiSpace(doc, AI_PDF_LAYOUT.footerReserved);
  doc.moveDown(1);
  if (theme.isRtl) {
    const assisted = theme.labels.footerAssisted;
    const visual = prepareArabicVisualLine(assisted);
    const fontSize = 9;
    const visualWidth = measureMixedVisualWidth(
      doc,
      visual,
      fontSize,
      false,
      theme.fonts
    );
    const line1Y = doc.y;
    drawMixedVisualLine(
      doc,
      visual,
      (doc.page.width - visualWidth) / 2,
      line1Y,
      {
        fontSize,
        bold: false,
        color: AI_PDF_COLORS.footer,
        fonts: theme.fonts,
      }
    );
    doc.y = line1Y + fontSize + 8;
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
  generateAiReportPdfFile,
  parseAiSummary,
  createAiPdfTheme,
  addAiReportHeader,
  addAiSectionTitle,
  addAiReportInformation,
  addAiParagraph,
  addAiBulletList,
  addSectionContent,
  addAiReportFooter,
  drawAiWrappedText,
  drawAiBulletList,
  drawAiLabelValueRow,
  drawAiFooterGeneratedLine,
  drawMixedVisualLine,
  measureMixedVisualWidth,
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
