import { useEffect, useMemo } from "react";
import { ImageIcon, Music, Trash2, Video } from "lucide-react";
import {
  detectSubmissionMediaTypeFromFile,
  formatFileSize,
} from "../utils/parentDashboardMappers";

const MEDIA_TYPE_LABELS = {
  image: "Image",
  video: "Video",
  audio: "Audio",
};

function MediaTypeIcon({ mediaType }) {
  if (mediaType === "video") {
    return <Video size={18} aria-hidden="true" />;
  }

  if (mediaType === "audio") {
    return <Music size={18} aria-hidden="true" />;
  }

  return <ImageIcon size={18} aria-hidden="true" />;
}

export function SelectedSubmissionMedia({ file, onRemove, disabled = false }) {
  const mediaType = useMemo(
    () => (file ? detectSubmissionMediaTypeFromFile(file) : null),
    [file],
  );

  const previewUrl = useMemo(
    () => (file && mediaType ? URL.createObjectURL(file) : null),
    [file, mediaType],
  );

  useEffect(() => {
    if (!previewUrl) {
      return undefined;
    }

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!file) {
    return null;
  }

  const typeLabel = mediaType ? MEDIA_TYPE_LABELS[mediaType] : "File";

  return (
    <div className="pd-submission-media-preview">
      <div className="pd-submission-media-preview-head">
        <div className="pd-submission-media-preview-meta">
          <span className="pd-submission-media-preview-icon" aria-hidden="true">
            <MediaTypeIcon mediaType={mediaType} />
          </span>
          <div className="pd-submission-media-preview-copy">
            <strong className="pd-submission-media-preview-name" title={file.name}>
              {file.name}
            </strong>
            <span>
              {typeLabel}
              {file.size != null ? ` · ${formatFileSize(file.size)}` : ""}
            </span>
          </div>
        </div>
        <button
          type="button"
          className="pd-btn pd-btn-soft pd-btn-sm"
          onClick={onRemove}
          disabled={disabled}
          aria-label={`Remove ${file.name}`}
        >
          <Trash2 size={14} aria-hidden="true" />
          Remove
        </button>
      </div>

      {previewUrl && mediaType === "image" ? (
        <div className="pd-submission-media-preview-frame">
          <img
            src={previewUrl}
            alt={`Preview of ${file.name}`}
            className="pd-submission-media-preview-image"
          />
        </div>
      ) : null}

      {previewUrl && mediaType === "video" ? (
        <div className="pd-submission-media-preview-frame">
          <video
            className="pd-submission-media-preview-video"
            controls
            preload="metadata"
            src={previewUrl}
          >
            Your browser does not support video playback.
          </video>
        </div>
      ) : null}

      {previewUrl && mediaType === "audio" ? (
        <div className="pd-submission-media-preview-frame pd-submission-media-preview-audio">
          <audio className="pd-submission-media-preview-audio-player" controls preload="metadata" src={previewUrl}>
            Your browser does not support audio playback.
          </audio>
        </div>
      ) : null}
    </div>
  );
}
