import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";
import { useLocale } from "../../../context/useLocale";
import { getInitials } from "../utils/specialistScheduleUtils";
import {
  formatSpeechDateTime,
  formatSubmissionShortId,
} from "../utils/specialistSpeechAnalysisMappers";
import { getSpecialistSpeechAnalysisLabels } from "../utils/specialistSpeechAnalysisLocalization";

export function SpecialistSpeechAnalysisHeader({
  patientName,
  profileImageUrl = null,
  submissionId = null,
  analyzedAt = null,
}) {
  const { t } = useLocale();
  const labels = getSpecialistSpeechAnalysisLabels(t);
  const latestLabel = formatSpeechDateTime(analyzedAt);
  const shortSubmissionId = formatSubmissionShortId(submissionId);

  return (
    <section className="pd-card pd-card-pad pd-specialist-speech-header">
      <div className="pd-specialist-speech-header-body">
        <UserProfileAvatar
          imageUrl={profileImageUrl}
          initials={getInitials(patientName, "P")}
          alt=""
          shellClassName="pd-avatar pd-specialist-speech-avatar"
          fallbackClassName="pd-avatar pd-specialist-speech-avatar"
          className="pd-avatar-photo"
        />
        <div className="pd-specialist-speech-header-copy">
          <h2 className="pd-specialist-speech-patient-name">{patientName}</h2>
          <p className="pd-specialist-speech-subtitle">{labels.resultsSubtitle}</p>
          {latestLabel ? (
            <p className="pd-specialist-speech-meta">
              {labels.latestLine.replace("{dateTime}", latestLabel)}
            </p>
          ) : null}
          {shortSubmissionId ? (
            <p className="pd-specialist-speech-meta">
              {labels.submissionLine.replace("{id}", `${shortSubmissionId}...`)}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
