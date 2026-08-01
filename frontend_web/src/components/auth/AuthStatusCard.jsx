import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { C } from "./tokens";
import {
  authPageHeadingClassName,
  authPageHeadingStyle,
  authPageSubtitleClassName,
  authPageSubtitleStyle,
} from "./authPageStyles";
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
  const accent = isError ? "#ef4444" : C.primary;

  return (
    <div className="flex flex-col items-center text-center">
      <div
        className="flex h-[72px] w-[72px] items-center justify-center rounded-full border"
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
        className={`${authPageHeadingClassName} mt-5`}
        style={authPageHeadingStyle}
      >
        {title}
      </h2>

      <p
        className={`${authPageSubtitleClassName} mt-2 max-w-sm`}
        style={authPageSubtitleStyle}
      >
        {message}
      </p>

      {actionLabel && onAction && (
        <div className="mt-6 w-full">
          <PrimaryButton onClick={onAction}>{actionLabel}</PrimaryButton>
        </div>
      )}
    </div>
  );
}
