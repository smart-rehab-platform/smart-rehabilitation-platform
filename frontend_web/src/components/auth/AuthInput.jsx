import { CheckCircle, AlertCircle } from "lucide-react";
import { C, G } from "./tokens";

export function AuthInput({
  label,
  icon,
  type = "text",
  placeholder,
  value,
  onChange,
  state = "idle",
  message,
  rightSlot,
  onBlur,
}) {
  const borderColor =
    state === "success"
      ? G.borderFocus
      : state === "error"
        ? "#ef4444"
        : G.borderSoft;
  const focusShadow =
    state === "error" ? "0 0 0 4px rgba(239, 68, 68, 0.15)" : G.focusRing;

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium" style={{ color: C.light }}>
        {label}
      </label>
      <div className="relative flex items-center">
        <span className="absolute left-3.5 pointer-events-none" style={{ color: C.iconInteractive, opacity: 0.85 }}>
          {icon}
        </span>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="auth-input w-full pl-10 pr-10 py-3 text-sm rounded-xl outline-none transition-all duration-200"
          style={{
            background: C.inputBg,
            border: `1.5px solid ${borderColor}`,
            color: C.white,
            fontFamily: "'Inter', sans-serif",
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = focusShadow;
            e.currentTarget.style.borderColor = state === "idle" ? G.borderFocus : borderColor;
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.borderColor = borderColor;
            onBlur?.();
          }}
        />
        {rightSlot && <span className="absolute right-3.5">{rightSlot}</span>}
        {!rightSlot && state === "success" && (
          <CheckCircle size={16} className="absolute right-3.5" color={G.success} />
        )}
        {!rightSlot && state === "error" && (
          <AlertCircle size={16} className="absolute right-3.5" color="#ef4444" />
        )}
      </div>
      {message && (
        <p className="text-xs" style={{ color: state === "error" ? "#ef4444" : G.success }}>
          {message}
        </p>
      )}
    </div>
  );
}
