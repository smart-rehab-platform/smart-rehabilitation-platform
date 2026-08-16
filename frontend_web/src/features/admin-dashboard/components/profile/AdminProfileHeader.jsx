import { UserProfileAvatar } from "../../../shared-dashboard/components/UserProfileAvatar";



export function AdminProfileHeader({ profile, labels, onEdit }) {

  const fullName = profile?.fullName || labels.profilePhotoAlt("Admin");

  const roleLabel = profile?.roleLabel || labels.role;



  return (

    <section className="pd-card pd-card-pad pd-profile-header-card">

      <div className="pd-profile-header-body">

        <UserProfileAvatar

          imageUrl={profile?.profileImageUrl}

          initials={profile?.initials || "AD"}

          alt={labels.profilePhotoAlt(fullName)}

          shellClassName="pd-avatar pd-profile-header-avatar"

          fallbackClassName="pd-avatar pd-profile-header-avatar"

          className="pd-avatar-photo"

        />



        <div className="pd-profile-header-copy">

          <h2 className="pd-profile-header-name" dir="auto">{fullName}</h2>

          <p className="pd-profile-header-role">{roleLabel}</p>

          <p className="pd-profile-header-email" dir="ltr">{profile?.email || labels.emptyDisplay}</p>

        </div>



        <div className="pd-profile-header-actions">

          <button type="button" className="pd-btn pd-btn-primary" onClick={onEdit}>

            {labels.editProfile}

          </button>

        </div>

      </div>

    </section>

  );

}
