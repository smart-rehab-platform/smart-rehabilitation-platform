import { Loader2 } from "lucide-react";
import { C, G } from "./tokens";

export function PrimaryButton({ children, loading, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-95"
      style={{
        background: G.button,
        color: C.navy,
        boxShadow: `0 0 20px ${G.glow}, 0 4px 15px rgba(74,127,167,0.4)`,
        fontFamily: "'Inter', sans-serif",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 30px ${G.glowStrong}, 0 6px 20px rgba(74,127,167,0.5)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `0 0 20px ${G.glow}, 0 4px 15px rgba(74,127,167,0.4)`;
      }}
    >
      {loading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          <span>{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
