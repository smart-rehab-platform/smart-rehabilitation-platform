import { useId } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import { C, G } from "./tokens";

const LTR_INPUT_TYPES = new Set(["email", "password", "tel", "url"]);

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
  inputRef,
  describedBy,
  inputDir,
}) {
  const inputId = useId();
  const messageId = `${inputId}-message`;
  const hasValue = String(value ?? "").length > 0;
  const resolvedDir = inputDir ?? (LTR_INPUT_TYPES.has(type) ? "ltr" : undefined);

  const borderColor =
    state === "success"
      ? "rgba(79, 166, 248, 0.55)"
      : state === "error"
        ? "#ef4444"
        : "rgba(79, 166, 248, 0.18)";

  const focusShadow =
    state === "error"
      ? "0 0 0 3px rgba(239, 68, 68, 0.14), inset 0 1px 2px rgba(0, 0, 0, 0.16)"
      : "0 0 0 3px rgba(79, 166, 248, 0.16), inset 0 1px 2px rgba(0, 0, 0, 0.16)";

  return (
    <div className="flex flex-col gap-2">
      <div className="auth-input-shell group relative">
        <span
          className="auth-input-icon pointer-events-none absolute top-1/2 z-10 -translate-y-1/2 transition-colors duration-200"
          style={{ color: C.iconInteractive, opacity: 0.75, insetInlineStart: "1rem" }}
        >
          {icon}
        </span>

        <input
          ref={inputRef}
          id={inputId}
          type={type}
          dir={resolvedDir}
          placeholder=" "
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={state === "error"}
          aria-describedby={message ? describedBy ?? messageId : undefined}
          className="auth-input peer w-full rounded-2xl pt-6 pb-2 text-sm leading-5 outline-none transition-all duration-200"
          style={{
            background: G.inputGlass,
            border: `1px solid ${borderColor}`,
            color: C.white,
            fontFamily: "'Inter', sans-serif",
            boxShadow: G.inputInnerShadow,
            paddingInlineStart: "2.75rem",
            paddingInlineEnd: "2.75rem",
            textAlign: resolvedDir === "ltr" ? "left" : undefined,
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = focusShadow;
            e.currentTarget.style.borderColor =
              state === "idle" ? "rgba(79, 166, 248, 0.55)" : borderColor;
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = G.inputInnerShadow;
            e.currentTarget.style.borderColor = borderColor;
            onBlur?.();
          }}
        />

        <label
          htmlFor={inputId}
          className={`auth-input-label pointer-events-none absolute z-10 origin-left transition-all duration-200 ${
            hasValue ? "auth-input-label-floating" : ""
          }`}
          style={{ color: C.textLight, insetInlineStart: "2.75rem" }}
        >
          {label}
        </label>

        {rightSlot && (
          <span
            className="absolute top-1/2 z-10 -translate-y-1/2"
            style={{ insetInlineEnd: "0.875rem" }}
          >
            {rightSlot}
          </span>
        )}
        {!rightSlot && state === "success" && (
          <CheckCircle
            size={16}
            className="absolute top-1/2 z-10 -translate-y-1/2"
            style={{ insetInlineEnd: "0.875rem" }}
            color={G.success}
          />
        )}
        {!rightSlot && state === "error" && (
          <AlertCircle
            size={16}
            className="absolute top-1/2 z-10 -translate-y-1/2"
            style={{ insetInlineEnd: "0.875rem" }}
            color="#ef4444"
          />
        )}
      </div>

      {message && (
        <p
          id={messageId}
          role={state === "error" ? "alert" : undefined}
          className="text-xs"
          style={{
            color: state === "error" ? "#ef4444" : G.success,
            paddingInlineStart: "0.25rem",
          }}
        >
          {message}
        </p>
      )}

      <span className="sr-only">{placeholder}</span>
    </div>
  );
}
