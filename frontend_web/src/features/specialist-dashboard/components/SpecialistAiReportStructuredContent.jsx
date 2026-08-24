import { useMemo } from "react";
import { useLocale } from "../../../context/useLocale";
import {
  AI_REPORT_EDITABLE_LIST_FIELDS,
  AI_REPORT_EDITABLE_NARRATIVE_FIELDS,
} from "../utils/specialistAiReportDraftEdit";
import { getAiReportSectionTitleLabel } from "../utils/specialistReportsLocalization";
import { SpecialistAiReportListSection } from "./SpecialistAiReportListSection";
import { SpecialistAiReportOverview } from "./SpecialistAiReportOverview";
import { SpecialistAiReportSection } from "./SpecialistAiReportSection";

function EditableNarrativeSection({
  fieldId,
  title,
  value,
  onChange,
  featured = false,
  disabled = false,
  contentDir = "ltr",
}) {
  return (
    <section
      className={[
        "pd-card",
        "pd-card-pad",
        "pd-specialist-ai-report-section",
        featured ? "pd-specialist-ai-report-section--featured" : "",
      ].filter(Boolean).join(" ")}
    >
      <h3 className="pd-specialist-review-section-title">{title}</h3>
      <textarea
        className="pd-form-textarea pd-specialist-ai-report-edit-field"
        value={value}
        onChange={(event) => onChange(fieldId, event.target.value)}
        disabled={disabled}
        rows={featured ? 6 : 4}
        dir={contentDir}
        aria-label={title}
      />
    </section>
  );
}

function EditableListSection({
  fieldId,
  title,
  value,
  onChange,
  variant = "default",
  disabled = false,
  contentDir = "ltr",
  listHint,
}) {
  return (
    <section
      className={[
        "pd-card",
        "pd-card-pad",
        "pd-specialist-ai-report-section",
        "pd-specialist-ai-report-list-section",
        variant === "warning" ? "pd-specialist-ai-report-section--warning" : "",
      ].filter(Boolean).join(" ")}
    >
      <h3 className="pd-specialist-review-section-title">{title}</h3>
      {listHint ? <p className="pd-section-sub">{listHint}</p> : null}
      <textarea
        className="pd-form-textarea pd-specialist-ai-report-edit-field"
        value={value}
        onChange={(event) => onChange(fieldId, event.target.value)}
        disabled={disabled}
        rows={5}
        dir={contentDir}
        aria-label={title}
      />
    </section>
  );
}

export function SpecialistAiReportStructuredContent({
  detail,
  isEditing = false,
  draftForm = null,
  onDraftFieldChange,
  draftDisabled = false,
}) {
  const { t } = useLocale();
  const structured = detail?.aiStructuredSummary;

  const sectionsById = useMemo(() => {
    const narrative = structured?.narrativeSections || [];
    const lists = structured?.listSections || [];
    return {
      narrative,
      lists,
      executive: narrative.find((section) => section.id === "executive_summary") || null,
      gridNarrative: narrative.filter((section) => section.id !== "executive_summary"),
    };
  }, [structured]);

  if (!structured?.isStructured && !isEditing) {
    return null;
  }

  const contentDir = detail?.language === "ar" ? "rtl" : "ltr";
  const listHint = t("specialist.reports.edit.listItemsHint");

  if (isEditing && draftForm) {
    const listVariant = {
      clinical_insights: "default",
      risks_or_regressions: "warning",
      recommendations: "numbered",
      next_steps: "default",
    };

    return (
      <div className="pd-specialist-ai-report-structured" dir={contentDir}>
        {structured?.isStructured ? (
          <SpecialistAiReportOverview
            overview={structured.overview}
            reportTypeLabel={detail.typeBadgeLabel}
          />
        ) : null}

        {AI_REPORT_EDITABLE_NARRATIVE_FIELDS.map((fieldId) => (
          <EditableNarrativeSection
            key={fieldId}
            fieldId={fieldId}
            title={getAiReportSectionTitleLabel(fieldId, t)}
            value={draftForm[fieldId] || ""}
            onChange={onDraftFieldChange}
            featured={fieldId === "executive_summary"}
            disabled={draftDisabled}
            contentDir={contentDir}
          />
        ))}

        {AI_REPORT_EDITABLE_LIST_FIELDS.map((fieldId) => (
          <EditableListSection
            key={fieldId}
            fieldId={fieldId}
            title={getAiReportSectionTitleLabel(fieldId, t)}
            value={draftForm[fieldId] || ""}
            onChange={onDraftFieldChange}
            variant={listVariant[fieldId]}
            disabled={draftDisabled}
            contentDir={contentDir}
            listHint={listHint}
          />
        ))}
      </div>
    );
  }

  if (!structured?.isStructured) {
    return null;
  }

  return (
    <div className="pd-specialist-ai-report-structured" dir={contentDir}>
      <SpecialistAiReportOverview
        overview={structured.overview}
        reportTypeLabel={detail.typeBadgeLabel}
      />

      {sectionsById.executive ? (
        <SpecialistAiReportSection
          title={getAiReportSectionTitleLabel(sectionsById.executive.id, t)}
          content={sectionsById.executive.content}
          featured
        />
      ) : null}

      {sectionsById.gridNarrative.length > 0 ? (
        <div className="pd-specialist-ai-report-grid">
          {sectionsById.gridNarrative.map((section) => (
            <SpecialistAiReportSection
              key={section.id}
              title={getAiReportSectionTitleLabel(section.id, t)}
              content={section.content}
            />
          ))}
        </div>
      ) : null}

      {sectionsById.lists.map((section) => (
        <SpecialistAiReportListSection
          key={section.id}
          title={getAiReportSectionTitleLabel(section.id, t)}
          items={section.items}
          variant={section.variant}
        />
      ))}
    </div>
  );
}
