import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../context/useLocale";
import { translateTexts } from "../services/translationService";

/**
 * Translates exercise display fields (title, description, instructions)
 * to the current UI locale (en ↔ ar). Never touches speech targets.
 */
export function useTranslatedExerciseContent(fields) {
  const { locale } = useLocale();
  const targetLanguage = String(locale || "en").toLowerCase().split("-")[0] || "en";

  const title = fields?.title ?? "";
  const description = fields?.description ?? "";
  const instructions = fields?.instructions ?? "";

  const sourceKey = `${title}\u0000${description}\u0000${instructions}`;

  const [translated, setTranslated] = useState({
    title,
    description,
    instructions,
  });
  const requestIdRef = useRef(0);

  useEffect(() => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    let cancelled = false;

    setTranslated({ title, description, instructions });

    (async () => {
      const [nextTitle, nextDescription, nextInstructions] = await translateTexts(
        [title, description, instructions],
        targetLanguage,
      );
      if (cancelled || requestIdRef.current !== requestId) {
        return;
      }
      setTranslated({
        title: nextTitle,
        description: nextDescription,
        instructions: nextInstructions,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [targetLanguage, sourceKey, title, description, instructions]);

  return translated;
}

/**
 * Batch-translates title/description/instructions for an exercise list
 * to the current UI locale (en ↔ ar).
 */
export function useTranslatedExerciseList(items) {
  const { locale } = useLocale();
  const targetLanguage = String(locale || "en").toLowerCase().split("-")[0] || "en";
  const list = Array.isArray(items) ? items : [];

  const sourceKey = useMemo(
    () =>
      list
        .map(
          (item) =>
            `${item?.id || ""}|${item?.title || ""}|${item?.description || ""}|${item?.instructions || ""}|${item?.previewText || ""}`,
        )
        .join("||"),
    [list],
  );

  const [translatedList, setTranslatedList] = useState(list);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    let cancelled = false;

    setTranslatedList(list);

    (async () => {
      const flat = [];
      list.forEach((item) => {
        flat.push(item?.title || "");
        flat.push(item?.description || "");
        flat.push(item?.instructions || item?.previewText || "");
      });

      const translatedFlat = await translateTexts(flat, targetLanguage);
      if (cancelled || requestIdRef.current !== requestId) {
        return;
      }

      setTranslatedList(
        list.map((item, index) => {
          const base = index * 3;
          const nextTitle = translatedFlat[base] || item.title;
          const nextDescription = translatedFlat[base + 1] || item.description;
          const nextInstructions =
            translatedFlat[base + 2] || item.instructions || item.previewText;
          return {
            ...item,
            title: nextTitle,
            description: item.description != null ? nextDescription : item.description,
            instructions:
              item.instructions != null ? nextInstructions : item.instructions,
            previewText:
              item.previewText != null ? nextInstructions : item.previewText,
          };
        }),
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [targetLanguage, sourceKey]);

  return translatedList;
}
