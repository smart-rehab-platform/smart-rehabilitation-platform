import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { C, G } from "./tokens";

export function Toast({ message, visible, variant = "success" }) {
  const isError = variant === "error";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-medium"
          style={{
            background: "rgba(18, 40, 70, 0.96)",
            border: `1px solid ${isError ? "rgba(239, 68, 68, 0.45)" : C.border}`,
            color: C.light,
            backdropFilter: "blur(12px)",
            boxShadow: G.cardShadow,
          }}
        >
          {isError ? (
            <AlertCircle size={16} color="#ef4444" />
          ) : (
            <CheckCircle size={16} color={C.primary} />
          )}
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
