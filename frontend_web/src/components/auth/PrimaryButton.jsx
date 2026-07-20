import { Loader2 } from "lucide-react";
import { C, G } from "./tokens";

export function PrimaryButton({ children, loading, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]"
      style={{
        background: G.button,
        color: C.white,
        boxShadow: G.cardShadow,
        fontFamily: "'Inter', sans-serif",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `${G.cardShadow}, 0 0 20px ${G.glow}`;
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.filter = "brightness(1.06)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = G.cardShadow;
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.filter = "none";
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
