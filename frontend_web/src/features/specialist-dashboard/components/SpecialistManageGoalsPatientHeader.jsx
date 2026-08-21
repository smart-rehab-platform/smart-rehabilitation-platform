import { useLocale } from "../../../context/useLocale";
import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";
import { getInitials } from "../utils/specialistScheduleUtils";

export function SpecialistManageGoalsPatientHeader({
  patientName,
  planTitle,
  profileImageUrl = null,
}) {
  return (
    <section className="pd-card pd-card-pad pd-specialist-manage-goals-patient-header">
      <div className="pd-specialist-manage-goals-patient-body">
        <UserProfileAvatar
          imageUrl={profileImageUrl}
          initials={getInitials(patientName, "P")}
          alt=""
          shellClassName="pd-avatar pd-specialist-manage-goals-patient-avatar"
          fallbackClassName="pd-avatar pd-specialist-manage-goals-patient-avatar"
          className="pd-avatar-photo"
        />
        <div className="pd-specialist-manage-goals-patient-copy">
          <h2 className="pd-specialist-manage-goals-patient-name" dir="auto">
            {patientName}
          </h2>
          {planTitle ? (
            <p className="pd-specialist-manage-goals-plan-title" dir="auto">
              {planTitle}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function SpecialistGoalTermSelector({ term, onChange, disabled = false }) {
  const { t } = useLocale();

  const options = [
    { value: "short_term", label: t("specialist.goals.shortTerm") },
    { value: "long_term", label: t("specialist.goals.longTerm") },
  ];

  return (
    <div className="pd-specialist-goal-term-selector" role="group" aria-label={t("specialist.goals.goalType")}>
      {options.map((option) => {
        const selected = term === option.value;
        return (
          <button
            key={option.value}
            type="button"
            className={`pd-specialist-goal-term-option${selected ? " is-selected" : ""}`}
            onClick={() => onChange(option.value)}
            disabled={disabled}
            aria-pressed={selected}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
