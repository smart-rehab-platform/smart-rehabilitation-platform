import { useEffect, useState } from "react";
import { validateCaseRequestChildImageFile } from "../utils/parentCaseRequestImageUtils";

export function useCaseRequestChildPhotoState({ persistedImageUrl = null } = {}) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [imageError, setImageError] = useState(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleSelectFile = (file) => {
    const validationError = validateCaseRequestChildImageFile(file);
    if (validationError) {
      setImageError(validationError);
      return;
    }

    setImageError(null);
    setPendingFile(file);
    setPreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return URL.createObjectURL(file);
    });
  };

  const handleClearPreview = () => {
    setPendingFile(null);
    setImageError(null);
    setPreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return null;
    });
  };

  return {
    previewUrl,
    pendingFile,
    imageError,
    persistedImageUrl,
    handleSelectFile,
    handleClearPreview,
    setImageError,
  };
}
