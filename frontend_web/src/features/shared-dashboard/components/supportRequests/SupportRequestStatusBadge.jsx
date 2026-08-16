import { useLocale } from "../../../../context/useLocale.js";
import { getSupportRequestStatusLabel, getSupportRequestStatusTone } from "../../utils/supportRequestMappers";
import { StatusBadge } from "../StatusBadge";

export function SupportRequestStatusBadge({ status, label, tone }) {
  const { t } = useLocale();

  return (
    <StatusBadge
      label={label || getSupportRequestStatusLabel(status, t)}
      tone={tone || getSupportRequestStatusTone(status)}
    />
  );
}
