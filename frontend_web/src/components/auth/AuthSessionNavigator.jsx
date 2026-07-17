import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AUTH_SESSION_EVENTS } from "../../services/authSessionBridge";

export function AuthSessionNavigator() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleSessionExpired = () => {
      if (location.pathname === "/login") {
        return;
      }

      navigate("/login?reason=session-expired", {
        replace: true,
        state: { from: location },
      });
    };

    window.addEventListener(
      AUTH_SESSION_EVENTS.SESSION_EXPIRED,
      handleSessionExpired,
    );

    return () => {
      window.removeEventListener(
        AUTH_SESSION_EVENTS.SESSION_EXPIRED,
        handleSessionExpired,
      );
    };
  }, [location, navigate]);

  return null;
}
