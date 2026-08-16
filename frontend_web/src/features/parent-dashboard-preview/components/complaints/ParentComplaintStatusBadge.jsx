import { StatusBadge } from "../../../shared-dashboard/components/StatusBadge";

export function ParentComplaintStatusBadge({ label, tone = "gray" }) {
  return <StatusBadge label={label} tone={tone} />;
}
