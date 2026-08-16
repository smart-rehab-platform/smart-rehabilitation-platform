/// Admin dashboard home KPI navigation intents.
enum AdminDashboardNewSignupsNavKind {
  scrollToRecentUsers,
}

/// New Signups KPI scrolls to the existing Recent Users section.
const AdminDashboardNewSignupsNavKind kAdminDashboardNewSignupsNavKind =
    AdminDashboardNewSignupsNavKind.scrollToRecentUsers;

/// Stable scroll-target identifier for the Recent Users section.
const String kAdminDashboardRecentUsersSectionDebugLabel =
    'admin-dashboard-recent-users';
