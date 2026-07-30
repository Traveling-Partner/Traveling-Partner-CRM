/**
 * Sidebar UI prefs that must survive AppShell remounts (each page mounts its own AppShell).
 */

const COLLAPSED_KEY = "tp-sidebar-collapsed";

/** Survives remount so hover does not reopen immediately after a nav click. */
let suppressHoverUntilPointerLeave = false;

export function readSidebarCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeSidebarCollapsed(collapsed: boolean) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(COLLAPSED_KEY, collapsed ? "1" : "0");
  } catch {
    // ignore
  }
}

export function getSuppressHoverUntilLeave() {
  return suppressHoverUntilPointerLeave;
}

export function setSuppressHoverUntilLeave(value: boolean) {
  suppressHoverUntilPointerLeave = value;
}
