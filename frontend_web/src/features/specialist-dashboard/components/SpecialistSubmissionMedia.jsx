import { useState } from "react";
import { Image, Mic, Video } from "lucide-react";
import { useLocale } from "../../../context/useLocale";

function mediaIcon(type) {
  const normalized = (type || "").toLowerCase();
  if (normalized === "audio") {
    return Mic;
  }
  if (normalized === "video") {
    return Video;
  }
  return Image;
}

function MediaPreview({ media, t }) {
  const [videoError, setVideoError] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [imageError, setImageError] = useState(false);
  const type = media.mediaType.toLowerCase();

  if (type === "video") {
    if (videoError) {
      return <p className="pd-section-sub">{t("specialist.reviews.media.loadFailedVideo")}</p>;
    }
    return (
      <video
        className="pd-specialist-review-media-video"
        controls
        preload="metadata"
        playsInline
        onError={() => setVideoError(true)}
      >
        <source src={media.fileUrl} />
        <track kind="captions" />
      </video>
    );
  }

  if (type === "audio") {
    if (audioError) {
      return <p className="pd-section-sub">{t("specialist.reviews.media.loadFailedAudio")}</p>;
    }
    return (
      <audio
        className="pd-specialist-review-media-audio"
        controls
        preload="metadata"
        onError={() => setAudioError(true)}
      >
        <source src={media.fileUrl} />
        <track kind="captions" />
      </audio>
    );
  }

  if (type === "image") {
    if (imageError) {
      return <p className="pd-section-sub">{t("specialist.reviews.media.loadFailedImage")}</p>;
    }
    return (
      <img
        src={media.fileUrl}
        alt={media.fileName || t("specialist.reviews.media.submissionAlt")}
        className="pd-specialist-review-media-image"
        onError={() => setImageError(true)}
      />
    );
  }

  return <p className="pd-section-sub">{t("specialist.reviews.media.unsupportedType")}</p>;
}

export function SpecialistSubmissionMedia({ mediaItems = [] }) {
  const { t } = useLocale();

  if (mediaItems.length === 0) {
    return (
      <section className="pd-card pd-card-pad pd-specialist-review-media-panel">
        <h3 className="pd-specialist-review-section-title">{t("specialist.reviews.media.title")}</h3>
        <p className="pd-section-sub">{t("specialist.reviews.media.empty")}</p>
      </section>
    );
  }

  return (
    <section className="pd-card pd-card-pad pd-specialist-review-media-panel">
      <h3 className="pd-specialist-review-section-title">{t("specialist.reviews.media.title")}</h3>
      <div className="pd-specialist-review-media-stack">
        {mediaItems.map((media) => {
          const Icon = mediaIcon(media.mediaType);
          return (
            <article key={media.id} className="pd-specialist-review-media-item">
              <div className="pd-specialist-review-media-head">
                <span className="pd-specialist-review-media-icon" aria-hidden="true">
                  <Icon size={18} />
                </span>
                <strong>{media.mediaTypeLabel}</strong>
              </div>
              <MediaPreview media={media} t={t} />
              {media.fileName ? (
                <p className="pd-specialist-review-media-filename" title={media.fileName} dir="auto">
                  {media.fileName}
                </p>
              ) : null}
              {media.createdAtLabel ? (
                <p className="pd-specialist-review-media-meta">{media.createdAtLabel}</p>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
