import { Star } from "lucide-react";
import { useLocale } from "../../../context/useLocale";

export function SpecialistStarRating({ rating, onChange }) {
  const { t } = useLocale();

  return (
    <div
      className="pd-specialist-review-stars"
      role="group"
      aria-label={t("specialist.reviews.form.ratingAriaLabel")}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const star = index + 1;
        const isSelected = star <= rating;
        return (
          <button
            key={star}
            type="button"
            className={`pd-specialist-review-star-btn${isSelected ? " is-selected" : ""}`}
            onClick={() => onChange(star)}
            aria-label={t("specialist.reviews.form.starAriaLabel", { count: star })}
            aria-pressed={isSelected}
          >
            <Star size={22} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
