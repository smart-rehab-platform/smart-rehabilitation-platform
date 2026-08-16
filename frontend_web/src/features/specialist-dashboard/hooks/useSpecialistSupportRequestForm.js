import { useCallback, useMemo, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import {
  createSpecialistSupportRequest,
  uploadSupportRequestAttachment,
} from "../../../services/specialistSupportRequestsService";
import {
  buildSupportRequestCategoryFormOptions,
  validateSupportRequestAttachmentFile,
  validateSupportRequestForm,
} from "../../shared-dashboard/utils/supportRequestMappers";

const INITIAL_FORM = {
  category: "",
  subject: "",
  description: "",
};

export function useSpecialistSupportRequestForm() {
  const { t } = useLocale();
  const categoryOptions = useMemo(() => buildSupportRequestCategoryFormOptions(t), [t]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [attachmentError, setAttachmentError] = useState(null);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const updateField = useCallback((field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError(null);
  }, []);

  const selectAttachment = useCallback((file) => {
    const validationMessage = validateSupportRequestAttachmentFile(file);
    if (validationMessage) {
      setAttachmentError(validationMessage);
      return;
    }

    setAttachmentError(null);
    setAttachmentFile(file);
    setSubmitError(null);
  }, []);

  const clearAttachment = useCallback(() => {
    setAttachmentFile(null);
    setAttachmentError(null);
  }, []);

  const submitRequest = useCallback(async () => {
    if (isSubmitting) {
      return { ok: false };
    }

    const validationErrors = validateSupportRequestForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return { ok: false, message: Object.values(validationErrors)[0] };
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setFieldErrors({});

    try {
      let attachmentUrl = null;
      if (attachmentFile) {
        setIsUploadingAttachment(true);
        const uploaded = await uploadSupportRequestAttachment(attachmentFile);
        attachmentUrl = uploaded?.url ?? null;
        if (!attachmentUrl) {
          throw new Error("Attachment upload succeeded but no URL was returned.");
        }
      }

      const created = await createSpecialistSupportRequest({
        category: form.category,
        subject: form.subject.trim(),
        description: form.description.trim(),
        attachment_url: attachmentUrl,
      });

      return { ok: true, requestId: created?.id ?? null };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit support request.";
      setSubmitError(message);
      return { ok: false, message };
    } finally {
      setIsUploadingAttachment(false);
      setIsSubmitting(false);
    }
  }, [isSubmitting, form, attachmentFile]);

  return {
    form,
    fieldErrors,
    categoryOptions,
    attachmentFile,
    attachmentError,
    isUploadingAttachment,
    isSubmitting,
    submitError,
    updateField,
    selectAttachment,
    clearAttachment,
    submitRequest,
  };
}
