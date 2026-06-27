import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { C } from "./tokens";
import { PrimaryButton } from "./PrimaryButton";

export function AuthStatusCard({
  title,
  message,
  actionLabel,
  onAction,
  variant = "success",
}) {
  const isLoading = variant === "loading";
  const isError = variant === "error";
  const accent = isError ? "#ef4444" : "#22c55e";

  return (
    <div className="flex flex-col items-center text-center">
      <div
        className="w-[72px] h-[72px] rounded-full flex items-center justify-center border"
        style={{
          background: `${accent}1f`,
          borderColor: `${accent}4d`,
          boxShadow: `0 0 24px ${accent}26`,
        }}
      >
        {isLoading ? (
          <Loader2 size={28} className="animate-spin" color={C.primary} />
        ) : isError ? (
          <AlertCircle size={30} color={accent} />
        ) : (
          <CheckCircle2 size={30} color={accent} />
        )}
      </div>

      <h2
        className="text-2xl font-bold mt-5"
        style={{ fontFamily: "'Syne', sans-serif", color: C.white }}
      >
        {title}
      </h2>

      <p className="text-sm leading-6 mt-2 max-w-sm" style={{ color: C.light, opacity: 0.9 }}>
        {message}
      </p>

      {actionLabel && onAction && (
        <div className="w-full mt-6">
          <PrimaryButton onClick={onAction}>{actionLabel}</PrimaryButton>
        </div>
      )}
    </div>
  );
}
