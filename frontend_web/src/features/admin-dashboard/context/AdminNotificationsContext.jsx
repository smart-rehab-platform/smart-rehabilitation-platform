import { useAdminNotifications } from "../hooks/useAdminNotifications";
import { AdminNotificationsContext } from "./adminNotificationsContextValue";

export function AdminNotificationsProvider({ children }) {
  const value = useAdminNotifications();

  return (
    <AdminNotificationsContext.Provider value={value}>
      {children}
    </AdminNotificationsContext.Provider>
  );
}
