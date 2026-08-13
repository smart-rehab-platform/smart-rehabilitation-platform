import { Search } from "lucide-react";

export function SpecialistTreatmentPlanSearch({ value, onChange }) {
  return (
    <label className="pd-specialist-treatment-plan-search">
      <Search size={18} aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by plan title or patient"
        aria-label="Search by plan title or patient"
      />
    </label>
  );
}
