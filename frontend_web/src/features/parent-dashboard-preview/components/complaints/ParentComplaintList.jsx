import { ChevronRight, History, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLocale } from "../../../../context/useLocale.js";
import {
  buildParentComplaintDetailPath,
} from "../../../../routes/parentDashboardRoutes";
import { ParentComplaintStatusBadge } from "./ParentComplaintStatusBadge";

export function ParentComplaintListItem({ complaint }) {
  const navigate = useNavigate();
  const { t } = useLocale();

  if (!complaint) {
    return null;
  }

  return (
    <button
      type="button"
      className="pd-card pd-parent-complaint-card"
      onClick={() => navigate(buildParentComplaintDetailPath(complaint.id))}
    >
      <div className="pd-parent-complaint-card-top">
        <div className="pd-parent-complaint-card-copy">
          <strong>{complaint.categoryLabel}</strong>
          <span>{complaint.patientName} · {complaint.specialistName}</span>
          <span className="pd-parent-complaint-card-meta">
            {t("parent.pages.complaints.submittedLabel", { date: complaint.submittedLabel })}
          </span>
        </div>
        <ParentComplaintStatusBadge
          label={complaint.statusLabel}
          tone={complaint.statusTone}
        />
      </div>

      {complaint.descriptionPreview ? (
        <p className="pd-parent-complaint-card-preview" dir="auto">{complaint.descriptionPreview}</p>
      ) : null}

      <span className="pd-parent-complaint-card-link">
        {t("parent.pages.complaints.viewDetails")}
        <ChevronRight size={16} aria-hidden="true" />
      </span>
    </button>
  );
}

export function ParentComplaintsToolbar({ onReport }) {
  const { t } = useLocale();

  return (
    <div className="pd-parent-complaints-toolbar">
      <button
        type="button"
        className="pd-btn pd-btn-primary"
        onClick={onReport}
      >
        <Plus size={16} aria-hidden="true" />
        {t("parent.pages.complaints.reportSpecialist")}
      </button>
    </div>
  );
}

export function ParentComplaintFormHeader({ onMyComplaints }) {
  const { t } = useLocale();

  return (
    <div className="pd-parent-complaint-form-header">
      <button
        type="button"
        className="pd-btn pd-btn-soft pd-parent-complaint-history-link"
        onClick={onMyComplaints}
      >
        <History size={16} aria-hidden="true" />
        {t("parent.pages.complaints.viewMyComplaints")}
      </button>
    </div>
  );
}

export function ParentComplaintFormIntro() {
  const { t } = useLocale();

  return (
    <p className="pd-parent-complaint-intro">
      {t("parent.complaints.introShort")}
    </p>
  );
}
