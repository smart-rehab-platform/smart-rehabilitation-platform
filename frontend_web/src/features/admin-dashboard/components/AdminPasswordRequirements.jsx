import { useMemo } from "react";
import { useLocale } from "../../../context/useLocale.js";
import { getPasswordRules } from "../../../components/auth/authLocalization.js";
import { getAdminUsersLabels } from "../utils/adminUsersLocalization.js";

export function AdminPasswordRequirements({ password }) {
  const { t } = useLocale();
  const labels = useMemo(() => getAdminUsersLabels(t), [t]);
  const rules = useMemo(() => getPasswordRules(t).map((rule) => ({
    key: rule.key,
    label: rule.label,
    satisfied: rule.satisfied(password),
  })), [password, t]);

  return (
    <ul className="pd-admin-password-rules" aria-label={labels.form.passwordRequirementsAriaLabel}>
      {rules.map((rule) => (
        <li
          key={rule.key}
          className={`pd-admin-password-rule${rule.satisfied ? " is-satisfied" : ""}`}
        >
          <span className="pd-admin-password-rule-icon" aria-hidden="true">
            {rule.satisfied ? "✓" : "○"}
          </span>
          <span>{rule.label}</span>
        </li>
      ))}
    </ul>
  );
}
