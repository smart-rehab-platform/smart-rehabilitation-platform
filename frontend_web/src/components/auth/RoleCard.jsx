import { motion } from "motion/react";
import { Check } from "lucide-react";
import { C, G } from "./tokens";

export function RoleCard({ icon, title, bullets, selected, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex-1 p-3.5 rounded-xl text-left relative transition-all duration-200"
      style={{
        background: selected ? G.hoverBg : `${G.navyOverlay}, 0.5)`,
        border: `1.5px solid ${selected ? C.primary : C.border}`,
        boxShadow: selected ? G.cardShadow : "none",
      }}
    >
      {selected && (
        <div
          className="absolute top-2 right-2 rounded-full flex items-center justify-center w-5 h-5"
          style={{ background: C.primary }}
        >
          <Check size={11} color={C.white} strokeWidth={3} />
        </div>
      )}
      <div className="flex items-center gap-2 mb-2" style={{ color: selected ? C.soft : C.light }}>
        {icon}
        <span className="font-semibold text-sm" style={{ fontFamily: "'Inter', sans-serif", color: C.white }}>
          {title}
        </span>
      </div>
      <ul className="flex flex-col gap-0.5">
        {bullets.map((b) => (
          <li key={b} className="flex items-center gap-1.5 text-xs" style={{ color: C.light, opacity: 0.8 }}>
            <div
              className="w-1 h-1 rounded-full flex-shrink-0"
              style={{ background: selected ? C.primary : C.light }}
            />
            {b}
          </li>
        ))}
      </ul>
    </motion.button>
  );
}
