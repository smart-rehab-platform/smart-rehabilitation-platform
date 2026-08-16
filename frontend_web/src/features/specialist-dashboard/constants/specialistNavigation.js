export const SPECIALIST_NAV_ITEM_DEFS = [

  { id: "dashboard", icon: "dashboard" },

  { id: "patients", icon: "patients" },

  { id: "caseRequests", icon: "caseRequests" },

  { id: "exercises", icon: "exercises" },

  { id: "sessions", icon: "sessions" },

  { id: "reviews", icon: "reviews" },

  { id: "treatmentPlans", icon: "treatmentPlans" },

  { id: "reports", icon: "reports" },

  { id: "messages", icon: "messages", badgeKey: "messages" },

  { id: "notifications", icon: "notifications", badgeKey: "notifications" },

  { id: "supportRequests", icon: "supportRequests" },

  { id: "profile", icon: "profile" },

];



/** @deprecated Use buildSpecialistNavItems(t) for localized labels. */

export const SPECIALIST_NAV_ITEMS = SPECIALIST_NAV_ITEM_DEFS.map((item) => ({

  ...item,

  label: item.id,

}));
