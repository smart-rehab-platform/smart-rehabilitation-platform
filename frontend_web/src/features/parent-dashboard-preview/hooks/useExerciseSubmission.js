import { useCallback, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import {
  attachMediaToExerciseSubmission,
  createExerciseSubmission,
  uploadExerciseSubmissionMedia,
} from "../../../services/parentDashboardService";
import {
  detectSubmissionMediaTypeFromFile,
  validateSubmissionMediaFile,
} from "../utils/parentDashboardMappers";

export function useExerciseSubmission({
  assignedExerciseId,
  isActionable,
  onSuccess,
  onRefresh,
}) {
  const { t } = useLocale();
  const [parentNotes, setParentNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [partialFailure, setPartialFailure] = useState(null);

  const canSubmit = Boolean(
    assignedExerciseId
    && (isActionable || partialFailure),
  );

  const clearSelectedFile = useCallback(() => {
    setSelectedFile(null);
    setValidationError(null);
  }, []);

  const handleFileSelect = useCallback((file) => {
    setSubmitError(null);

    if (!file) {
      clearSelectedFile();
      return;
    }

    const validation = validateSubmissionMediaFile(file, { t });
    if (!validation.valid) {
      setSelectedFile(null);
      setValidationError(validation.error);
      return;
    }

    setValidationError(null);
    setSelectedFile(file);
  }, [clearSelectedFile, t]);

  const submitExercise = useCallback(async () => {
    if (isSubmitting || !assignedExerciseId) {
      return;
    }

    if (!isActionable && !partialFailure) {
      return;
    }

    if (selectedFile) {
      const validation = validateSubmissionMediaFile(selectedFile, { t });
      if (!validation.valid) {
        setValidationError(validation.error);
        return;
      }
    }

    if (partialFailure?.stage === "upload" && !selectedFile) {
      setSubmitError(t("parent.common.somethingWrong"));
      return;
    }

    setValidationError(null);
    setSubmitError(null);
    setIsSubmitting(true);

    let submissionId = partialFailure?.submissionId ?? null;

    try {
      if (!submissionId) {
        submissionId = await createExerciseSubmission({
          assignedExerciseId,
          parentNotes,
        });
      }

      const shouldUploadMedia = Boolean(selectedFile || partialFailure?.uploadedUrl);

      if (shouldUploadMedia) {
        let fileUrl = partialFailure?.uploadedUrl ?? null;
        let mediaType = partialFailure?.mediaType ?? null;

        if (selectedFile) {
          mediaType = detectSubmissionMediaTypeFromFile(selectedFile);

          if (!mediaType) {
            setValidationError(t("parent.dashboard.submission.unsupportedType"));
            return;
          }

          if (!fileUrl) {
            try {
              fileUrl = await uploadExerciseSubmissionMedia(selectedFile);
            } catch (uploadError) {
              setPartialFailure({
                submissionId,
                stage: "upload",
              });
              setSubmitError(
                uploadError instanceof Error
                  ? uploadError.message
                  : t("parent.common.somethingWrong"),
              );
              return;
            }
          }
        }

        if (fileUrl && mediaType) {
          try {
            await attachMediaToExerciseSubmission(submissionId, {
              mediaType,
              fileUrl,
            });
          } catch (attachError) {
            setPartialFailure({
              submissionId,
              stage: "attach",
              uploadedUrl: fileUrl,
              mediaType,
            });
            setSubmitError(
              attachError instanceof Error
                ? attachError.message
                : t("parent.common.somethingWrong"),
            );
            return;
          }
        }
      }

      setPartialFailure(null);
      setParentNotes("");
      setSelectedFile(null);
      await onRefresh?.();
      onSuccess?.();
    } catch (error) {
      if (!submissionId) {
        setSubmitError(
          error instanceof Error ? error.message : t("parent.common.somethingWrong"),
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [
    assignedExerciseId,
    isActionable,
    isSubmitting,
    onRefresh,
    onSuccess,
    parentNotes,
    partialFailure,
    selectedFile,
    t,
  ]);

  const submitLabel = (() => {
    if (partialFailure?.stage === "upload") {
      return t("common.retry");
    }

    if (partialFailure?.stage === "attach") {
      return t("common.retry");
    }

    return null;
  })();

  return {
    parentNotes,
    setParentNotes,
    selectedFile,
    handleFileSelect,
    clearSelectedFile,
    validationError,
    submitError,
    isSubmitting,
    partialFailure,
    canSubmit,
    submitExercise,
    submitLabel,
  };
}
