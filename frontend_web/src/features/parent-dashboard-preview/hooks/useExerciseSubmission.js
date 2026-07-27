import { useCallback, useState } from "react";
import {
  attachMediaToExerciseSubmission,
  createExerciseSubmission,
  uploadExerciseSubmissionMedia,
} from "../../../services/parentDashboardService";
import {
  detectSubmissionMediaTypeFromFile,
  validateSubmissionMediaFile,
} from "../utils/parentDashboardMappers";

/**
 * @typedef {"upload"|"attach"} PartialFailureStage
 */

/**
 * @typedef {{ submissionId: string, stage: PartialFailureStage, uploadedUrl?: string, mediaType?: "image"|"video"|"audio" }} PartialFailureState
 */

export function useExerciseSubmission({
  assignedExerciseId,
  isActionable,
  onSuccess,
  onRefresh,
}) {
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

    const validation = validateSubmissionMediaFile(file);
    if (!validation.valid) {
      setSelectedFile(null);
      setValidationError(validation.error);
      return;
    }

    setValidationError(null);
    setSelectedFile(file);
  }, [clearSelectedFile]);

  const submitExercise = useCallback(async () => {
    if (isSubmitting || !assignedExerciseId) {
      return;
    }

    if (!isActionable && !partialFailure) {
      return;
    }

    if (selectedFile) {
      const validation = validateSubmissionMediaFile(selectedFile);
      if (!validation.valid) {
        setValidationError(validation.error);
        return;
      }
    }

    if (partialFailure?.stage === "upload" && !selectedFile) {
      setSubmitError("Select a file to retry the upload.");
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
            setValidationError("This file type is not supported. Use an image, video, or audio file.");
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
                  : "Your exercise was submitted, but the file could not be uploaded. Select the file and tap Retry Upload.",
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
                : "Your exercise was submitted and the file uploaded, but linking the attachment failed. Tap Retry Attachment.",
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
          error instanceof Error ? error.message : "Submission failed.",
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
  ]);

  const submitLabel = (() => {
    if (partialFailure?.stage === "upload") {
      return "Retry Upload";
    }

    if (partialFailure?.stage === "attach") {
      return "Retry Attachment";
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
