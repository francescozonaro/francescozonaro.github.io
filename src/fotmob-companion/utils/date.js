export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseLocalDateString(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function shiftDateString(dateStr, days) {
  const date = parseLocalDateString(dateStr);
  date.setDate(date.getDate() + days);
  return getLocalDateString(date);
}

export function formatDateLabel(dateStr) {
  const todayStr = getLocalDateString();
  const yesterdayStr = shiftDateString(todayStr, -1);
  const tomorrowStr = shiftDateString(todayStr, 1);

  const date = parseLocalDateString(dateStr);
  const shortDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  if (dateStr === todayStr) return `Today, ${shortDate}`;
  if (dateStr === yesterdayStr) return `Yesterday, ${shortDate}`;
  if (dateStr === tomorrowStr) return `Tomorrow, ${shortDate}`;

  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
  return `${weekday}, ${shortDate}`;
}
