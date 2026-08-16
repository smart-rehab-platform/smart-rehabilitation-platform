import { useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useLocale } from "../../../../context/useLocale.js";

export function MessageImageLightbox({ src, alt, onClose }) {
  const { t } = useLocale();

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [handleKeyDown]);

  return createPortal(
    <div
      className="pd-message-image-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={t("parent.messages.lightbox.preview")}
    >
      <button
        type="button"
        className="pd-message-image-lightbox-backdrop"
        onClick={onClose}
        aria-label={t("parent.messages.lightbox.closePreview")}
      />
      <button
        type="button"
        className="pd-message-image-lightbox-close"
        onClick={onClose}
        aria-label={t("parent.messages.lightbox.close")}
      >
        <X size={22} aria-hidden="true" />
      </button>
      <img
        src={src}
        alt={alt}
        className="pd-message-image-lightbox-image"
        onClick={(event) => event.stopPropagation()}
      />
    </div>,
    document.body,
  );
}
