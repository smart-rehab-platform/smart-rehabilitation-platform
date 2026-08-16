import {
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  applyDocumentLocale,
  createTranslator,
  isRtlLocale,
} from "../i18n/index.js";
import {
  getStoredLocale,
  normalizeLocale,
  setStoredLocale,
} from "../services/localeStorage.js";
import { LocaleContext } from "./localeContext.js";

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(() => {
    const initialLocale = getStoredLocale();
    applyDocumentLocale(initialLocale);
    return initialLocale;
  });

  const setLocale = useCallback((nextLocale) => {
    const normalizedLocale = normalizeLocale(nextLocale);

    setStoredLocale(normalizedLocale);
    applyDocumentLocale(normalizedLocale);
    setLocaleState(normalizedLocale);
  }, []);

  const t = useMemo(() => createTranslator(locale), [locale]);
  const isRtl = isRtlLocale(locale);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      isRtl,
    }),
    [locale, setLocale, t, isRtl],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}
