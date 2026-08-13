import { useState } from "react";
import { Image, Mic, Video } from "lucide-react";

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

function MediaPreview({ media }) {
  const [videoError, setVideoError] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [imageError, setImageError] = useState(false);
  const type = media.mediaType.toLowerCase();

  if (type === "video") {
    if (videoError) {
      return <p className="pd-section-sub">Unable to load video.</p>;
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
      return <p className="pd-section-sub">Unable to load audio.</p>;
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
      return <p className="pd-section-sub">Unable to load image.</p>;
    }
    return (
      <img
        src={media.fileUrl}
        alt={media.fileName || "Submission media"}
        className="pd-specialist-review-media-image"
        onError={() => setImageError(true)}
      />
    );
  }

  return <p className="pd-section-sub">Unsupported media type for preview.</p>;
}

export function SpecialistSubmissionMedia({ mediaItems = [] }) {
  if (mediaItems.length === 0) {
    return (
      <section className="pd-card pd-card-pad pd-specialist-review-media-panel">
        <h3 className="pd-specialist-review-section-title">Uploaded Media</h3>
        <p className="pd-section-sub">No media uploaded for this submission.</p>
      </section>
    );
  }

  return (
    <section className="pd-card pd-card-pad pd-specialist-review-media-panel">
      <h3 className="pd-specialist-review-section-title">Uploaded Media</h3>
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
              <MediaPreview media={media} />
              {media.fileName ? (
                <p className="pd-specialist-review-media-filename" title={media.fileName}>
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
