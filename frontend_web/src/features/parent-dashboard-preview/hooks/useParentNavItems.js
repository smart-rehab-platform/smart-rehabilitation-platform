import { useMemo } from "react";
import { useLocale } from "../../../context/useLocale.js";
import { buildParentNavItems } from "../utils/parentNavigation.js";

export function useParentNavItems() {
  const { t } = useLocale();
  return useMemo(() => buildParentNavItems(t), [t]);
}
