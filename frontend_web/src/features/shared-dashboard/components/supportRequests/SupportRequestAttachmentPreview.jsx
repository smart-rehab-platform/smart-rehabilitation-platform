import { FileText, Image as ImageIcon } from "lucide-react";
import { isSupportRequestAttachmentPdf } from "../../utils/supportRequestMappers";

export function SupportRequestAttachmentPreview({ attachmentUrl, fileName = "Attachment" }) {
  if (!attachmentUrl) {
    return null;
  }

  const isPdf = isSupportRequestAttachmentPdf(attachmentUrl);

  return (
    <a
      href={attachmentUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="pd-support-request-attachment-link"
    >
      <span className="pd-support-request-attachment-icon" aria-hidden="true">
        {isPdf ? <FileText size={16} /> : <ImageIcon size={16} />}
      </span>
      <span>{fileName}</span>
    </a>
  );
}
