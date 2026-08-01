import { motion } from "motion/react";
import { Check } from "lucide-react";
import { C } from "./tokens";

export function OnboardingRoleCard({
  icon,
  title,
  description,
  selected,
  onClick,
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      whileHover={selected ? undefined : { y: -2 }}
      animate={{ scale: selected ? 1.02 : 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="onboarding-role-card group relative w-full cursor-pointer rounded-[20px] border px-4 py-3.5 text-left transition-all duration-[250ms]"
      style={{
        background: selected
          ? "rgba(79, 166, 248, 0.1)"
          : "rgba(255, 255, 255, 0.78)",
        borderColor: selected ? C.primary : "rgba(79, 166, 248, 0.2)",
        boxShadow: selected
          ? "0 14px 32px rgba(79, 166, 248, 0.16)"
          : "0 2px 10px rgba(15, 35, 66, 0.04)",
      }}
    >
      {selected && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full"
          style={{ background: C.primary }}
          aria-hidden
        >
          <Check size={11} color={C.white} strokeWidth={3} />
        </motion.span>
      )}

      <div className="flex items-start gap-3 pr-5">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-colors duration-[250ms]"
          style={{
            background: selected
              ? "rgba(79, 166, 248, 0.16)"
              : "rgba(79, 166, 248, 0.08)",
            color: selected ? C.primary : "#5A8FD4",
          }}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <h3
            className="mb-1 text-[17px] font-bold leading-tight sm:text-[18px]"
            style={{ fontFamily: "'Inter', sans-serif", color: "#0F2342" }}
          >
            {title}
          </h3>
          <p
            className="text-[13px] leading-snug sm:text-[14px]"
            style={{ fontFamily: "'Inter', sans-serif", color: "#5A7390" }}
          >
            {description}
          </p>
        </div>
      </div>
    </motion.button>
  );
}
