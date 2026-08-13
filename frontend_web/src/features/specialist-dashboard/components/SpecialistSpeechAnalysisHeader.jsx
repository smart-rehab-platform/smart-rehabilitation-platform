import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";
import { getInitials } from "../utils/specialistScheduleUtils";
import {
  formatSpeechDateTime,
  formatSubmissionShortId,
} from "../utils/specialistSpeechAnalysisMappers";

export function SpecialistSpeechAnalysisHeader({
  patientName,
  submissionId = null,
  analyzedAt = null,
}) {
  const latestLabel = formatSpeechDateTime(analyzedAt);
  const shortSubmissionId = formatSubmissionShortId(submissionId);

  return (
    <section className="pd-card pd-card-pad pd-specialist-speech-header">
      <div className="pd-specialist-speech-header-body">
        <UserProfileAvatar
          imageUrl={null}
          initials={getInitials(patientName, "P")}
          alt=""
          shellClassName="pd-avatar pd-specialist-speech-avatar"
          fallbackClassName="pd-avatar pd-specialist-speech-avatar"
          className="pd-avatar-photo"
        />
        <div className="pd-specialist-speech-header-copy">
          <h2 className="pd-specialist-speech-patient-name">{patientName}</h2>
          <p className="pd-specialist-speech-subtitle">Speech analysis results</p>
          {latestLabel ? (
            <p className="pd-specialist-speech-meta">Latest: {latestLabel}</p>
          ) : null}
          {shortSubmissionId ? (
            <p className="pd-specialist-speech-meta">Submission: {shortSubmissionId}...</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
