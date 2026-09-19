import { daysUntil, urgencyLabel } from "./deadlineUtils";

const THRESHOLDS = [3, 1, 0];

export function isNotificationSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getPermission() {
  return isNotificationSupported() ? Notification.permission : "unsupported";
}

export async function requestNotificationPermission() {
  if (!isNotificationSupported()) return "unsupported";
  return Notification.requestPermission();
}

// Fires a browser notification for any deadline crossing a reminder threshold
// (3 days out, 1 day out, due today) that hasn't already been notified.
export function checkAndNotify(deadlines, settings, updateSettings) {
  if (!isNotificationSupported() || Notification.permission !== "granted") return;
  if (!settings.notificationsEnabled) return;

  const newKeys = [];
  for (const deadline of deadlines) {
    if (!deadline.dueDate) continue;
    const days = daysUntil(deadline.dueDate);
    if (!THRESHOLDS.includes(days)) continue;
    const key = `${deadline.id}:${days}`;
    if (settings.notifiedKeys.includes(key)) continue;

    new Notification(deadline.title, {
      body: `${urgencyLabel(days)} · ${deadline.type === "exam" ? "Exam" : "Assignment"}`,
      tag: key,
    });
    newKeys.push(key);
  }

  if (newKeys.length) {
    updateSettings({ notifiedKeys: [...settings.notifiedKeys, ...newKeys] });
  }
}
