import {
  FileText,
  Image as ImageIcon,
  Mic,
  Paperclip,
  Video,
} from "lucide-react";
import { StatusBadge } from "../../shared-dashboard/components/StatusBadge";

function reviewTone(status) {
  if (status === "Reviewed") {
    return "success";
  }
  if (status === "Needs retry") {
    return "warning";
  }
  return "blue";
}

function submissionMediaIcon(mediaTypeLabel) {
  const normalized = (mediaTypeLabel || "").trim().toLowerCase();

  if (normalized.includes("video")) {
    return Video;
  }
  if (normalized.includes("audio")) {
    return Mic;
  }
  if (normalized.includes("image")) {
    return ImageIcon;
  }
  if (normalized.includes("file") || normalized.includes("attach")) {
    return Paperclip;
  }

  return FileText;
}

export function AdminPatientRecentSubmissions({ submissions }) {
  return (
    <section className="pd-admin-patient-section pd-section-enter" aria-label="Recent exercise submissions">
      <h2 className="pd-admin-patient-section-title">Recent Exercise Submissions</h2>

      {submissions.length === 0 ? (
        <div className="pd-card pd-card-pad">
          <p className="pd-admin-patient-empty-copy">No recent submissions.</p>
        </div>
      ) : (
        <ul className="pd-admin-patient-item-list">
          {submissions.map((submission) => {
            const MediaIcon = submissionMediaIcon(submission.mediaTypeLabel);

            return (
              <li key={submission.id} className="pd-card pd-card-pad pd-admin-patient-submission-row">
                <span className="pd-admin-patient-submission-icon" aria-hidden="true">
                  <MediaIcon size={18} strokeWidth={2.1} />
                </span>
                <div className="pd-admin-patient-submission-body">
                  <div className="pd-admin-patient-submission-head">
                    <strong>{submission.exerciseTitle}</strong>
                    <StatusBadge label={submission.reviewStatus} tone={reviewTone(submission.reviewStatus)} />
                  </div>
                  <p className="pd-admin-patient-row-meta">
                    {[submission.mediaTypeLabel, submission.submittedAtLabel].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
