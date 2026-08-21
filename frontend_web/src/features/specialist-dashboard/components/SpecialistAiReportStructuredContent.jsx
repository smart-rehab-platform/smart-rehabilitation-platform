import { useMemo } from "react";
import { useLocale } from "../../../context/useLocale";
import { getAiReportSectionTitleLabel } from "../utils/specialistReportsLocalization";
import { SpecialistAiReportListSection } from "./SpecialistAiReportListSection";
import { SpecialistAiReportOverview } from "./SpecialistAiReportOverview";
import { SpecialistAiReportSection } from "./SpecialistAiReportSection";

export function SpecialistAiReportStructuredContent({ detail }) {
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

  if (!structured?.isStructured) {
    return null;
  }

  const contentDir = detail?.language === "ar" ? "rtl" : "ltr";

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
