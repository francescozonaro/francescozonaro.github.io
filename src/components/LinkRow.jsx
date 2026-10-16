import { Link } from "react-router-dom";
import { HiLink, HiCodeBracket, HiDocument } from "react-icons/hi2";
import { FaReddit } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const LINK_TYPES = {
  code: { icon: HiCodeBracket, label: "Code" },
  link: { icon: HiLink, label: "Link" },
  pdf: { icon: HiDocument, label: "Docs" },
  reddit: { icon: FaReddit, label: "Reddit" },
  x: { icon: FaXTwitter, label: "X" },
};

const buttonClass = "cardComponent smallEnlarge iconButton font-semibold";

export function LinkButton({ type, url }) {
  const { icon: Icon, label } = LINK_TYPES[type] || {};
  if (!Icon) return null;

  const content = <Icon className="h-4 w-4" />;

  const isInternal = url.startsWith("/#/") || url.startsWith("#/");
  if (isInternal) {
    return (
      <Link
        to={url.replace(/^(\/#|#)/, "")}
        className={`${buttonClass} text-secondary`}
        aria-label={label}
        title={label}
      >
        {content}
      </Link>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonClass}
      aria-label={label}
      title={label}
    >
      {content}
    </a>
  );
}

// A row with text on the left and any number of buttons on the right:
// `links` renders LinkButtons, `actions` renders custom buttons.
export function LinkRow({ children, links = [], actions, className = "" }) {
  const hasLinks = links.length > 0;
  return (
    <div
      className={`p-3 flex flex-wrap items-center justify-between gap-3 ${className}`}
    >
      <div
        className={`flex-1 text-sm ${hasLinks ? "min-w-[12rem]" : "min-w-0"}`}
      >
        {children}
      </div>
      {(hasLinks || actions) && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {links.map((link, i) => (
            <LinkButton key={i} type={link.type} url={link.url} />
          ))}
          {actions}
        </div>
      )}
    </div>
  );
}
