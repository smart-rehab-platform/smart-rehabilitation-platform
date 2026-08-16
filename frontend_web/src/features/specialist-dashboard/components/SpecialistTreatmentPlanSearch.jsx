import { Search } from "lucide-react";
import { useLocale } from "../../../context/useLocale";

export function SpecialistTreatmentPlanSearch({ value, onChange }) {
  const { t } = useLocale();

  return (
    <label className="pd-specialist-treatment-plan-search">
      <Search size={18} aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t("specialist.treatmentPlans.search.placeholder")}
        aria-label={t("specialist.treatmentPlans.search.ariaLabel")}
      />
    </label>
  );
}
