import { Loader2 } from "lucide-react";
import { C, G } from "./tokens";

export function PrimaryButton({ children, loading, disabled = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || disabled}
      className="auth-primary-btn group w-full rounded-2xl py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.985] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
      style={{
        background: G.button,
        color: C.white,
        boxShadow: "0 12px 28px rgba(79, 166, 248, 0.28), 0 2px 8px rgba(0, 0, 0, 0.18)",
        fontFamily: "'Inter', sans-serif",
        minHeight: "52px",
      }}
    >
      {loading ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          <span>{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
