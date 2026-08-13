import { StatusBadge } from "../../shared-dashboard/components/StatusBadge";

export function AdminComplaintStatusBadge({ label, tone = "gray" }) {
  return <StatusBadge label={label} tone={tone} />;
}
