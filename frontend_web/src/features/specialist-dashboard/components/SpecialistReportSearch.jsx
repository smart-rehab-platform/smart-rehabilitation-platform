import { Search } from "lucide-react";

export function SpecialistReportSearch({ value, onChange }) {
  return (
    <label className="pd-specialist-report-search">
      <Search size={18} aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by patient or title"
        aria-label="Search by patient or title"
      />
    </label>
  );
}
