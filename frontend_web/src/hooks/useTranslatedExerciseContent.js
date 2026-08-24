import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../context/useLocale";
import { translateTexts } from "../services/translationService";

/**
 * Translates exercise display fields (title, description, instructions) when locale is Arabic.
 * Never touches expected_text / target_word / target_phoneme.
 */
export function useTranslatedExerciseContent(fields) {
  const { locale } = useLocale();
  const language = String(locale || "en").toLowerCase().split("-")[0];
  const isArabic = language === "ar";

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
    if (!isArabic) {
      setTranslated({ title, description, instructions });
      return undefined;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    let cancelled = false;

    (async () => {
      const [nextTitle, nextDescription, nextInstructions] = await translateTexts(
        [title, description, instructions],
        "ar",
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
  }, [isArabic, sourceKey, title, description, instructions]);

  if (!isArabic) {
    return { title, description, instructions };
  }

  return translated;
}

/**
 * Batch-translates title/description/instructions for an exercise list when locale is Arabic.
 */
export function useTranslatedExerciseList(items) {
  const { locale } = useLocale();
  const language = String(locale || "en").toLowerCase().split("-")[0];
  const isArabic = language === "ar";
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
    if (!isArabic) {
      setTranslatedList(list);
      return undefined;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    let cancelled = false;

    (async () => {
      const flat = [];
      list.forEach((item) => {
        flat.push(item?.title || "");
        flat.push(item?.description || "");
        flat.push(item?.instructions || item?.previewText || "");
      });

      const translatedFlat = await translateTexts(flat, "ar");
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
  }, [isArabic, sourceKey]);

  return isArabic ? translatedList : list;
}
