import { Star } from "lucide-react";

export function SpecialistStarRating({ rating, onChange }) {
  return (
    <div className="pd-specialist-review-stars" role="group" aria-label="Performance rating">
      {Array.from({ length: 5 }, (_, index) => {
        const star = index + 1;
        const isSelected = star <= rating;
        return (
          <button
            key={star}
            type="button"
            className={`pd-specialist-review-star-btn${isSelected ? " is-selected" : ""}`}
            onClick={() => onChange(star)}
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
            aria-pressed={isSelected}
          >
            <Star size={22} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
