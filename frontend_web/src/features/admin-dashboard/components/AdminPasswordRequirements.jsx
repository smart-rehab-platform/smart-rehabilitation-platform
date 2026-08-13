import { getPasswordRules } from "../../../components/auth/authHelpers";

export function AdminPasswordRequirements({ password }) {
  const rules = getPasswordRules(password);

  return (
    <ul className="pd-admin-password-rules" aria-label="Password requirements">
      {rules.map((rule) => (
        <li
          key={rule.label}
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
