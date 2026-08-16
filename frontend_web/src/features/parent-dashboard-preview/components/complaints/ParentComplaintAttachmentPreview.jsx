import { ExternalLink, FileText } from "lucide-react";

import { useLocale } from "../../../../context/useLocale.js";

import { isComplaintAttachmentPdf } from "../../utils/parentComplaintsUtils";



export function ParentComplaintAttachmentPreview({

  attachmentUrl,

  attachmentResolvedUrl,

  onOpenError,

}) {

  const { t } = useLocale();

  const resolvedUrl = attachmentResolvedUrl || null;



  if (!resolvedUrl) {

    return null;

  }



  const isPdf = isComplaintAttachmentPdf(attachmentUrl || resolvedUrl);



  const handleOpen = () => {

    try {

      window.open(resolvedUrl, "_blank", "noopener,noreferrer");

    } catch {

      onOpenError?.(t("parent.complaints.attachment.openError"));

    }

  };



  return (

    <section className="pd-card pd-card-pad pd-parent-complaint-section" aria-label={t("parent.complaints.attachment.title")}>

      <h2 className="pd-parent-complaint-section-title">{t("parent.complaints.attachment.title")}</h2>



      {isPdf ? (

        <div className="pd-parent-complaint-attachment-row">

          <span className="pd-parent-complaint-attachment-icon" aria-hidden="true">

            <FileText size={18} strokeWidth={2.1} />

          </span>

          <div className="pd-parent-complaint-attachment-copy">

            <strong>{t("parent.complaints.attachmentPreview.pdfTitle")}</strong>

            <span>{t("parent.complaints.attachmentPreview.pdfHint")}</span>

          </div>

          <button

            type="button"

            className="pd-btn pd-btn-soft pd-btn-compact"

            onClick={handleOpen}

          >

            {t("parent.complaints.attachmentPreview.openAttachment")}

            <ExternalLink size={14} aria-hidden="true" />

          </button>

        </div>

      ) : (

        <div className="pd-parent-complaint-attachment-image-wrap">

          <img

            src={resolvedUrl}

            alt={t("parent.complaints.attachment.alt")}

            className="pd-parent-complaint-attachment-image"

          />

          <button

            type="button"

            className="pd-btn pd-btn-soft pd-btn-compact"

            onClick={handleOpen}

          >

            {t("parent.complaints.attachmentPreview.openFullImage")}

            <ExternalLink size={14} aria-hidden="true" />

          </button>

        </div>

      )}

    </section>

  );

}
