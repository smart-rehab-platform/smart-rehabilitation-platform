import { useCallback, useEffect, useRef, useState } from "react";
import { getUserPresence } from "../../../services/specialistPresenceService";

function readPresenceField(record, keys) {
  if (!record || typeof record !== "object") {
    return null;
  }

  for (const key of keys) {
    if (key in record) {
      return record[key];
    }
  }

  return null;
}

export function formatPresenceLabel(presence) {
  if (!presence) {
    return "Offline";
  }

  const isOnline = Boolean(
    readPresenceField(presence, ["is_online", "isOnline"]),
  );

  if (isOnline) {
    return "Online";
  }

  const lastSeen = readPresenceField(presence, ["last_seen", "lastSeen"]);
  if (!lastSeen) {
    return "Offline";
  }

  const date = new Date(lastSeen);
  if (Number.isNaN(date.getTime())) {
    return "Offline";
  }

  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

  if (diffMinutes < 1) {
    return "Last seen just now";
  }

  if (diffMinutes < 60) {
    return `Last seen ${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `Last seen ${diffHours}h ago`;
  }

  return `Last seen ${date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

export function useSpecialistPresence(userId) {
  const [presence, setPresence] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const refresh = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!userId) {
      return undefined;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadPresence() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getUserPresence(userId);
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setPresence(data);
      } catch (loadError) {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setPresence(null);
          setError(loadError instanceof Error ? loadError.message : "Failed to load presence.");
        }
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    loadPresence();
    const timer = window.setInterval(loadPresence, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [userId, refreshToken]);

  if (!userId) {
    return {
      presence: null,
      label: "Offline",
      isOnline: false,
      isLoading: false,
      error: null,
      refresh,
    };
  }

  const label = formatPresenceLabel(presence);
  const isOnline = Boolean(
    readPresenceField(presence, ["is_online", "isOnline"]),
  );

  return {
    presence,
    label,
    isOnline,
    isLoading,
    error,
    refresh,
  };
}
