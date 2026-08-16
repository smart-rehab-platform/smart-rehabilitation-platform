import { ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale";
import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";
import { getInitials } from "../utils/specialistScheduleUtils";

export function SpecialistScheduleSessionPatientSelect({
  patients = [],
  selectedPatient = null,
  disabled = false,
  error = null,
  onSelect,
}) {
  const { t } = useLocale();
  const listboxId = useId();
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleSelect = (patient) => {
    onSelect?.(patient);
    setOpen(false);
  };

  return (
    <div
      ref={rootRef}
      className={`pd-specialist-schedule-session-patient-select${open ? " is-open" : ""}${error ? " has-error" : ""}`}
    >
      <button
        type="button"
        id={`${listboxId}-trigger`}
        className="pd-specialist-schedule-session-control pd-specialist-schedule-session-patient-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        disabled={disabled || patients.length === 0}
        onClick={() => setOpen((value) => !value)}
      >
        {selectedPatient ? (
          <span className="pd-specialist-schedule-session-patient-selected">
            <UserProfileAvatar
              imageUrl={selectedPatient.profileImageUrl}
              initials={getInitials(selectedPatient.name, "P")}
              alt=""
              shellClassName="pd-avatar pd-specialist-schedule-session-patient-avatar"
              fallbackClassName="pd-avatar pd-specialist-schedule-session-patient-avatar"
              className="pd-avatar-photo"
            />
            <span className="pd-specialist-schedule-session-patient-name" dir="auto">{selectedPatient.name}</span>
          </span>
        ) : (
          <span className="pd-specialist-schedule-session-patient-placeholder">
            {t("specialist.sessions.schedule.selectPatient")}
          </span>
        )}
        <ChevronDown size={18} aria-hidden="true" className="pd-specialist-schedule-session-patient-chevron" />
      </button>

      {open ? (
        <ul
          id={listboxId}
          className="pd-specialist-schedule-session-patient-menu"
          role="listbox"
          aria-labelledby={`${listboxId}-trigger`}
        >
          {patients.map((patient) => {
            const isSelected = patient.id === selectedPatient?.id;
            return (
              <li key={patient.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`pd-specialist-schedule-session-patient-option${isSelected ? " is-selected" : ""}`}
                  onClick={() => handleSelect(patient)}
                >
                  <UserProfileAvatar
                    imageUrl={patient.profileImageUrl}
                    initials={getInitials(patient.name, "P")}
                    alt=""
                    shellClassName="pd-avatar pd-specialist-schedule-session-patient-avatar"
                    fallbackClassName="pd-avatar pd-specialist-schedule-session-patient-avatar"
                    className="pd-avatar-photo"
                  />
                  <span className="pd-specialist-schedule-session-patient-name" dir="auto">{patient.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {error ? <p className="pd-specialist-schedule-session-error">{error}</p> : null}
    </div>
  );
}
