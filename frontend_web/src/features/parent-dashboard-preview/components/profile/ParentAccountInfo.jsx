import { useLocale } from "../../../context/useLocale.js";

export function ParentAccountInfo({ profile }) {
  const { t } = useLocale();

  return (
    <section className="pd-card pd-card-pad pd-profile-account pd-section-enter" aria-label={t("parent.profile.accountInfo")}>
      <header className="pd-profile-section-head">
        <h2 className="pd-section-title">{t("parent.profile.accountInfo")}</h2>
        <p className="pd-task-hub-subtitle">{t("parent.profile.accountReadOnly")}</p>
      </header>

      <dl className="pd-profile-account-list">
        <div className="pd-profile-account-item">
          <dt>{t("parent.profile.email")}</dt>
          <dd dir="ltr">{profile?.email || t("parent.common.emptyDisplay")}</dd>
        </div>
        <div className="pd-profile-account-item">
          <dt>{t("parent.profile.role")}</dt>
          <dd>{profile?.roleLabel || t("roles.parent")}</dd>
        </div>
        <div className="pd-profile-account-item">
          <dt>{t("parent.profile.emailStatus")}</dt>
          <dd>{profile?.isEmailVerified ? t("parent.profile.verified") : t("parent.profile.notVerified")}</dd>
        </div>
        {profile?.memberSince ? (
          <div className="pd-profile-account-item">
            <dt>{t("parent.profile.memberSince")}</dt>
            <dd>{profile.memberSince}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
