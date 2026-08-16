import { useRef } from "react";

import { FileText, Image as ImageIcon, Paperclip, X } from "lucide-react";

import { useLocale } from "../../../../context/useLocale.js";

import { COMPLAINT_ATTACHMENT_ACCEPT } from "../../utils/parentComplaintsUtils";



export function ParentComplaintAttachmentField({

  attachmentFile,

  disabled,

  error,

  onSelectFile,

  onClearFile,

}) {

  const { t } = useLocale();

  const inputRef = useRef(null);



  const handleChooseFile = () => {

    inputRef.current?.click();

  };



  const handleFileChange = (event) => {

    const file = event.target.files?.[0] ?? null;

    event.target.value = "";

    if (file) {

      onSelectFile?.(file);

    }

  };



  const isPdf = attachmentFile?.name?.toLowerCase().endsWith(".pdf");



  return (

    <section className="pd-parent-complaint-attachment pd-card pd-card-pad" aria-label={t("parent.complaints.attachment.title")}>

      <div className="pd-parent-complaint-attachment-head">

        <strong>{t("parent.complaints.attachment.title")}</strong>

        <p>{t("parent.complaints.attachmentFieldHelpShort")}</p>

      </div>



      <input

        ref={inputRef}

        type="file"

        accept={COMPLAINT_ATTACHMENT_ACCEPT}

        className="pd-sr-only"

        disabled={disabled}

        onChange={handleFileChange}

      />



      {attachmentFile ? (

        <div className="pd-parent-complaint-attachment-selected">

          <span className="pd-parent-complaint-attachment-icon" aria-hidden="true">

            {isPdf ? <FileText size={18} /> : <ImageIcon size={18} />}

          </span>

          <span className="pd-parent-complaint-attachment-name">{attachmentFile.name}</span>

          <button

            type="button"

            className="pd-btn pd-btn-soft pd-btn-compact"

            onClick={onClearFile}

            disabled={disabled}

          >

            <X size={14} aria-hidden="true" />

            {t("parent.complaints.removeAttachment")}

          </button>

        </div>

      ) : (

        <button

          type="button"

          className="pd-btn pd-btn-soft pd-parent-complaint-attachment-btn"

          onClick={handleChooseFile}

          disabled={disabled}

        >

          <Paperclip size={16} aria-hidden="true" />

          {t("parent.complaints.addAttachment")}

        </button>

      )}



      {error ? (

        <p className="pd-form-error" role="alert">{error}</p>

      ) : null}

    </section>

  );

}
