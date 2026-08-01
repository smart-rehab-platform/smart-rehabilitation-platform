import { CheckCircle2, Circle } from "lucide-react";
import { getPasswordStrength } from "./authHelpers";

const levelStyles = {
  weak: {
    label: "Weak",
    color: "#E07A7A",
    track: "rgba(198, 107, 107, 0.22)",
  },
  medium: {
    label: "Medium",
    color: "#E0A050",
    track: "rgba(200, 132, 45, 0.22)",
  },
  strong: {
    label: "Strong",
    color: "#5FD49A",
    track: "rgba(47, 138, 93, 0.22)",
  },
};

export function PasswordRequirementsChecklist({ password }) {
  const strength = getPasswordStrength(password);
  const style = levelStyles[strength.level];
  const fillPercent = (strength.satisfiedCount / strength.rules.length) * 100;

  return (
    <div className="password-strength-panel auth-hero-glass-surface rounded-xl p-3">
      <div className="auth-hero-glass-surface-content">
        <div className="flex items-center justify-between gap-3">
          <p
            className="text-xs font-semibold"
            style={{ color: "rgba(255, 255, 255, 0.94)" }}
          >
            Password strength
          </p>
          <p
            className="password-strength-label text-xs font-semibold transition-colors duration-200"
            style={{ color: style.color }}
          >
            {style.label}
          </p>
        </div>

        <div
          className="password-strength-track mt-2.5 h-1.5 overflow-hidden rounded-full"
          style={{ background: style.track }}
        >
          <div
            className="password-strength-fill h-full rounded-full transition-all duration-200 ease-out"
            style={{
              width: `${fillPercent}%`,
              background: style.color,
            }}
          />
        </div>

        <ul className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
          {strength.rules.map((rule) => (
            <li key={rule.label} className="flex items-center gap-2">
              {rule.satisfied ? (
                <CheckCircle2
                  size={14}
                  className="password-requirement-icon shrink-0 transition-colors duration-200"
                  color="#5FD49A"
                  strokeWidth={2.5}
                  aria-hidden
                />
              ) : (
                <Circle
                  size={14}
                  className="password-requirement-icon shrink-0 transition-colors duration-200"
                  color="rgba(255, 255, 255, 0.55)"
                  strokeWidth={2}
                  aria-hidden
                />
              )}
              <span
                className="password-requirement-text text-[11px] transition-colors duration-200"
                style={{
                  color: rule.satisfied ? "#5FD49A" : "rgba(255, 255, 255, 0.9)",
                  fontWeight: rule.satisfied ? 600 : 500,
                }}
              >
                {rule.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
