import { useMemo } from "react";
import { ExternalLink, FileText, Image as ImageIcon } from "lucide-react";
import { useLocale } from "../../../context/useLocale.js";
import { isComplaintAttachmentPdf } from "../utils/adminComplaintsMappers";
import { getAdminComplaintsLabels } from "../utils/adminComplaintsLocalization.js";

export function AdminComplaintAttachment({ attachmentUrl, attachmentResolvedUrl }) {
  const { t } = useLocale();
  const labels = useMemo(() => getAdminComplaintsLabels(t), [t]);
  const resolvedUrl = attachmentResolvedUrl || null;

  if (!resolvedUrl) {
    return null;
  }

  const isPdf = isComplaintAttachmentPdf(attachmentUrl || resolvedUrl);

  return (
    <section
      className="pd-card pd-card-pad pd-admin-complaint-section pd-section-enter"
      aria-label={labels.attachmentAriaLabel}
    >
      <h2 className="pd-admin-complaint-section-title">{labels.attachmentTitle}</h2>

      <div className="pd-admin-complaint-attachment-row">
        <span className="pd-admin-complaint-attachment-icon" aria-hidden="true">
          {isPdf ? <FileText size={18} strokeWidth={2.1} /> : <ImageIcon size={18} strokeWidth={2.1} />}
        </span>
        <div className="pd-admin-complaint-attachment-copy">
          <strong>{isPdf ? labels.attachmentPdf : labels.attachmentImage}</strong>
          <span>{labels.attachmentHint}</span>
        </div>
        <a
          href={resolvedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="pd-btn pd-btn-soft pd-btn-compact"
        >
          {labels.openAttachment}
          <ExternalLink size={14} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
