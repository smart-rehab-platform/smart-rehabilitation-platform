/**
 * Matches mobile_app/lib/shared/widgets/app_logo.dart — circular mark with
 * health_and_safety icon, Flutter theme colors, and proportions.
 */
export function SmartRehabAppLogo({ size = 34, className = "" }) {
  const iconSize = Math.round(size * 0.45);
  const borderWidth = Math.max(1, size * 0.025);

  return (
    <span
      className={`pd-brand-mark pd-app-logo${className ? ` ${className}` : ""}`}
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderWidth,
      }}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M10.5 13H8v-3h2.5V7.5C10.5 6.11 11.61 5 13 5h1v2h-1c-.55 0-1 .45-1 1v2.5H15v3h-2.5v6H10.5v-6zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
      </svg>
    </span>
  );
}
