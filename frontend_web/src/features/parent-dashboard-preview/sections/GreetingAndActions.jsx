import { Play } from "lucide-react";
import { ChildSelector } from "../components/ChildSelector";

export function GreetingAndActions({
  parentFirstName,
  childOptions,
  selectedChildId,
  isChildSelectorLoading = false,
  childSelectorError = null,
  summary,
  onSelectChild,
  onStartExercise,
}) {
  const hasActivitiesToday = (summary?.todaysExercises ?? 0) > 0;

  return (
    <section className="pd-greeting pd-section-enter">
      <div className="pd-greeting-main">
        <h1>Good morning, {parentFirstName}!</h1>
      </div>

      <div className="pd-greeting-toolbar">
        <ChildSelector
          items={childOptions}
          selectedChildId={selectedChildId}
          isLoading={isChildSelectorLoading}
          onSelect={onSelectChild}
        />
        {childSelectorError ? (
          <span className="pd-inline-error">{childSelectorError}</span>
        ) : null}
        {hasActivitiesToday ? (
          <button type="button" className="pd-btn pd-btn-primary" onClick={onStartExercise}>
            <Play size={15} aria-hidden="true" />
            Start Today&apos;s Exercise
          </button>
        ) : null}
      </div>
    </section>
  );
}
