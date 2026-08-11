import { ProfileMenu as SharedProfileMenu } from "../../shared-dashboard/components/ProfileMenu";

export function ProfileMenu({ parent, onViewProfile, onSignOut }) {
  return (
    <SharedProfileMenu
      user={parent}
      onViewProfile={onViewProfile}
      onSignOut={onSignOut}
    />
  );
}
