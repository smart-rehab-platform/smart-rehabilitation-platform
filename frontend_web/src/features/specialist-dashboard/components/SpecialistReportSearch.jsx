import { Search } from "lucide-react";
import { useLocale } from "../../../context/useLocale";

export function SpecialistReportSearch({ value, onChange }) {
  const { t } = useLocale();
  const placeholder = t("specialist.reports.searchPlaceholder");

  return (
    <label className="pd-specialist-report-search">
      <Search size={18} aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={t("specialist.reports.searchAriaLabel")}
      />
    </label>
  );
}
