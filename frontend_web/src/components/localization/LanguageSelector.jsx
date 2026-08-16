import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, Languages } from "lucide-react";
import { useLocale } from "../../context/useLocale.js";
import {
  LANGUAGE_OPTIONS,
  applyLanguageSelection,
  getLanguageLabelForLocale,
  isLanguageOptionSelected,
} from "./languageSelectorUtils.js";
import "./languageSelector.css";

function useDismissOnOutsideClick(open, rootRef, onClose) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const onOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        onClose();
      }
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("click", onOutsideClick);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("click", onOutsideClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, rootRef]);
}

export function LanguageSelector({
  variant = "compact",
  surface = "auth",
  onSelected,
  className = "",
}) {
  const { locale, setLocale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const menuId = useId();
  const languageLabel = t("common.language");
  const currentLabel = getLanguageLabelForLocale(locale);

  const closeMenu = () => setOpen(false);

  useDismissOnOutsideClick(open, rootRef, closeMenu);

  const handleSelect = (code) => {
    applyLanguageSelection(setLocale, code);
    closeMenu();
    onSelected?.();
  };

  if (variant === "profileMenu") {
    return (
      <div className={`language-selector language-selector--profile ${className}`.trim()}>
        <div className="language-selector-profile-label" id={menuId}>
          <Languages size={16} aria-hidden="true" />
          {languageLabel}
        </div>

        <div
          className="language-selector-profile-options"
          role="group"
          aria-labelledby={menuId}
        >
          {LANGUAGE_OPTIONS.map((option) => {
            const selected = isLanguageOptionSelected(locale, option.code);

            return (
              <button
                key={option.code}
                type="button"
                className={`language-selector-profile-option${selected ? " is-selected" : ""}`}
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => handleSelect(option.code)}
              >
                <span dir={option.code === "ar" ? "rtl" : "ltr"}>{option.label}</span>
                {selected ? (
                  <Check size={14} aria-hidden="true" className="language-selector-check" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const surfaceClass =
    surface === "landing"
      ? "language-selector--landing"
      : surface === "dashboard"
        ? "language-selector--dashboard"
        : "language-selector--auth";

  return (
    <div
      className={`language-selector language-selector--compact ${surfaceClass} ${className}`.trim()}
      ref={rootRef}
    >
      <button
        type="button"
        className="language-selector-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={languageLabel}
        onClick={() => setOpen((value) => !value)}
      >
        <Languages size={16} aria-hidden="true" />
        <span dir={locale === "ar" ? "rtl" : "ltr"}>{currentLabel}</span>
        <ChevronDown size={14} aria-hidden="true" />
      </button>

      {open ? (
        <ul
          id={menuId}
          className="language-selector-menu"
          role="listbox"
          aria-label={languageLabel}
        >
          {LANGUAGE_OPTIONS.map((option) => {
            const selected = isLanguageOptionSelected(locale, option.code);

            return (
              <li key={option.code} role="presentation">
                <button
                  type="button"
                  className={`language-selector-option${selected ? " is-selected" : ""}`}
                  role="option"
                  aria-selected={selected}
                  onClick={() => handleSelect(option.code)}
                >
                  <span dir={option.code === "ar" ? "rtl" : "ltr"}>{option.label}</span>
                  {selected ? (
                    <Check size={14} aria-hidden="true" className="language-selector-check" />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
