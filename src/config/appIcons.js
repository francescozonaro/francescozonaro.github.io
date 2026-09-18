export const DEFAULT_ICON = "/favicon.ico";
export const DEFAULT_APPLE_ICON = "/img/main/apple-touch-icon.png";

export const APP_ICONS = {
  "fotmob-companion": {
    title: "FotMob Companion",
    icon: "/img/fotmob-companion/apple-touch-icon.png",
    appleIcon: "/img/fotmob-companion/apple-touch-icon.png",
  },
  "betting-notebook": {
    title: "Betting Notebook",
    icon: "/img/fotmob-companion/apple-touch-icon.png",
    appleIcon: "/img/fotmob-companion/apple-touch-icon.png",
  },
};

export function getAppIcon(key) {
  const entry = APP_ICONS[key] || {};
  return {
    title: entry.title,
    icon: entry.icon || DEFAULT_ICON,
    appleIcon: entry.appleIcon || DEFAULT_APPLE_ICON,
  };
}
