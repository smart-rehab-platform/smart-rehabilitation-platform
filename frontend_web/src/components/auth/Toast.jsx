import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { C, G } from "./tokens";

export function Toast({
  message,
  visible,
  variant = "success",
  duration = 3000,
  onDismiss,
}) {
  const isError = variant === "error";
  const timerRef = useRef(null);
  const remainingRef = useRef(duration);
  const startedAtRef = useRef(0);

  useEffect(() => {
    if (!visible || !onDismiss || duration <= 0) {
      return undefined;
    }

    remainingRef.current = duration;
    startedAtRef.current = Date.now();

    timerRef.current = window.setTimeout(() => {
      onDismiss();
    }, duration);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [visible, message, duration, onDismiss]);

  const pauseTimer = () => {
    if (!onDismiss || !timerRef.current) {
      return;
    }

    window.clearTimeout(timerRef.current);
    timerRef.current = null;
    remainingRef.current -= Date.now() - startedAtRef.current;
  };

  const resumeTimer = () => {
    if (!onDismiss || remainingRef.current <= 0) {
      return;
    }

    startedAtRef.current = Date.now();
    timerRef.current = window.setTimeout(() => {
      onDismiss();
    }, remainingRef.current);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          onMouseEnter={pauseTimer}
          onMouseLeave={resumeTimer}
          onFocus={pauseTimer}
          onBlur={resumeTimer}
          className="fixed top-6 left-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-medium"
          style={{
            background: "rgba(18, 40, 70, 0.96)",
            border: `1px solid ${isError ? "rgba(239, 68, 68, 0.45)" : C.border}`,
            color: C.light,
            backdropFilter: "blur(12px)",
            boxShadow: G.cardShadow,
          }}
          role={isError ? "alert" : "status"}
          aria-live={isError ? "assertive" : "polite"}
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
