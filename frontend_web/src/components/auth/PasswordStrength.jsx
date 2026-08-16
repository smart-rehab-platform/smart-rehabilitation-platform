import { CheckCircle2, Circle } from "lucide-react";
import { C } from "./tokens";
import { getPasswordStrength, getPasswordStrengthLabel } from "./authLocalization";
import { useLocale } from "../../context/useLocale.js";

export function PasswordStrength({ password }) {
  const { t } = useLocale();

  if (!password) {
    return null;
  }

  const strength = getPasswordStrength(password, t);
  const levelColor =
    strength.level === "strong" ? "#22c55e" : strength.level === "medium" ? "#f59e0b" : "#ef4444";
  const activeBars = strength.level === "strong" ? 3 : strength.level === "medium" ? 2 : 1;

  return (
    <div
      className="rounded-xl p-3 border"
      style={{
        background: "rgba(255, 255, 255, 0.65)",
        borderColor: `${levelColor}40`,
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold" style={{ color: "#4A6580" }}>
          {t("auth.password.strengthTitle")}
        </p>
        <p className="text-xs font-semibold" style={{ color: levelColor }}>
          {getPasswordStrengthLabel(strength.level, t)}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-1.5 mt-2.5">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="h-1.5 rounded-full"
            style={{
              background: index < activeBars ? levelColor : "rgba(44, 79, 121, 0.35)",
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
              <Circle size={14} color={C.placeholder} />
            )}
            <span
              className="text-[11px]"
              style={{
                color: rule.satisfied ? "#22c55e" : C.placeholder,
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
