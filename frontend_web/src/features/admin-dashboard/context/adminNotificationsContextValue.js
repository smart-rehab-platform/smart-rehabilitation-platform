import { createContext, useContext } from "react";

export const AdminNotificationsContext = createContext(null);

export function useAdminNotificationsContext() {
  const value = useContext(AdminNotificationsContext);

  if (!value) {
    throw new Error(
      "useAdminNotificationsContext must be used within AdminNotificationsProvider.",
    );
  }

  return value;
}
