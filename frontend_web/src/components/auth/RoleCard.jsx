import { motion } from "motion/react";
import { Check } from "lucide-react";
import { C } from "./tokens";

export function RoleCard({ icon, title, selected, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative flex h-[60px] min-h-[56px] max-h-[64px] flex-1 flex-row items-center gap-3.5 rounded-xl px-[18px] pr-8 text-left transition-all duration-200"
      style={{
        background: selected ? "rgba(79, 166, 248, 0.12)" : "rgba(255, 255, 255, 0.68)",
        border: `1.5px solid ${selected ? C.primary : "rgba(79, 166, 248, 0.28)"}`,
        boxShadow: selected ? "0 8px 20px rgba(79, 166, 248, 0.12)" : "none",
      }}
    >
      {selected && (
        <div
          className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full"
          style={{ background: C.primary }}
        >
          <Check size={11} color={C.white} strokeWidth={3} />
        </div>
      )}
      <div className="shrink-0" style={{ color: selected ? C.soft : C.iconInteractive }}>
        {icon}
      </div>
      <span
        className="text-[17px] font-semibold leading-none"
        style={{ fontFamily: "'Inter', sans-serif", color: "#0F2342" }}
      >
        {title}
      </span>
    </motion.button>
  );
}
