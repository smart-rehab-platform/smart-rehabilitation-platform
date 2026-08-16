export function getMobileSidebarHiddenTransform(isRtl) {
  return isRtl ? "translateX(105%)" : "translateX(-105%)";
}

export function getSidebarCollapseIconNames(isRtl, collapsed) {
  if (collapsed) {
    return isRtl
      ? { open: "PanelRightOpen", close: "PanelRightClose" }
      : { open: "PanelLeftOpen", close: "PanelLeftClose" };
  }

  return isRtl
    ? { open: "PanelRightOpen", close: "PanelRightClose" }
    : { open: "PanelLeftOpen", close: "PanelLeftClose" };
}

export function getSidebarCollapseIconName(isRtl, collapsed) {
  const icons = getSidebarCollapseIconNames(isRtl, collapsed);
  return collapsed ? icons.open : icons.close;
}
