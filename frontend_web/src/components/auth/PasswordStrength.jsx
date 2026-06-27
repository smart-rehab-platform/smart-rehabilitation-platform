import { CheckCircle2, Circle } from "lucide-react";
import { C } from "./tokens";
import { getPasswordStrength } from "./authHelpers";

const levelStyles = {
  weak: {
    label: "Weak",
    color: "#ef4444",
    activeBars: 1,
  },
  medium: {
    label: "Medium",
    color: "#f59e0b",
    activeBars: 2,
  },
  strong: {
    label: "Strong",
    color: "#22c55e",
    activeBars: 3,
  },
};

export function PasswordStrength({ password }) {
  if (!password) {
    return null;
  }

  const strength = getPasswordStrength(password);
  const style = levelStyles[strength.level];

  return (
    <div
      className="rounded-xl p-3 border"
      style={{
        background: "rgba(10,25,49,0.62)",
        borderColor: `${style.color}40`,
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold" style={{ color: C.light }}>
          Password strength
        </p>
        <p className="text-xs font-semibold" style={{ color: style.color }}>
          {style.label}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-1.5 mt-2.5">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="h-1.5 rounded-full"
            style={{
              background:
                index < style.activeBars ? style.color : "rgba(179,207,229,0.16)",
            }}
          />
        ))}
      </div>

      <div className="flex flex-col gap-1.5 mt-3">
        {strength.rules.map((rule) => (
          <div key={rule.label} className="flex items-center gap-2">
            {rule.satisfied ? (
              <CheckCircle2 size={14} color="#22c55e" />
            ) : (
              <Circle size={14} color="rgba(179,207,229,0.45)" />
            )}
            <span
              className="text-[11px]"
              style={{
                color: rule.satisfied ? "#22c55e" : "rgba(179,207,229,0.82)",
                fontWeight: rule.satisfied ? 600 : 500,
              }}
            >
              {rule.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
