import { useEffect } from "react";

function getOrCreateLink(rel) {
  let link = document.querySelector(`link[rel='${rel}']`);
  const created = !link;
  if (!link) {
    link = document.createElement("link");
    link.rel = rel;
    document.head.appendChild(link);
  }
  return { link, created };
}

/**
 * Temporarily overrides the document title, favicon, and apple-touch-icon
 * while the calling component is mounted, restoring the previous values
 * (or removing tags it created) on unmount.
 */
export function usePageIcon({ title, icon, appleIcon } = {}) {
  useEffect(() => {
    const prevTitle = document.title;
    if (title) document.title = title;

    let iconRestore = null;
    if (icon) {
      const { link, created } = getOrCreateLink("icon");
      const prevHref = link.getAttribute("href");
      const prevType = link.getAttribute("type");
      link.type = "image/png";
      link.href = icon;
      iconRestore = () => {
        if (created) {
          link.remove();
        } else {
          if (prevType) link.type = prevType;
          else link.removeAttribute("type");
          link.href = prevHref;
        }
      };
    }

    let appleIconRestore = null;
    if (appleIcon) {
      const { link, created } = getOrCreateLink("apple-touch-icon");
      const prevHref = link.getAttribute("href");
      link.href = appleIcon;
      appleIconRestore = () => {
        if (created) {
          link.remove();
        } else {
          link.href = prevHref;
        }
      };
    }

    return () => {
      document.title = prevTitle;
      iconRestore?.();
      appleIconRestore?.();
    };
  }, [title, icon, appleIcon]);
}
