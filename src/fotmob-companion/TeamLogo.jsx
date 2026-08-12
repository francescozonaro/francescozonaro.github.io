import PropTypes from "prop-types";
import { DEFAULT_TEAM_LOGO } from "./commons";

export function TeamLogo({
  src,
  alt = "",
  className = "w-6 h-6 object-contain flex-shrink-0",
}) {
  return (
    <img
      src={src || DEFAULT_TEAM_LOGO}
      alt={alt}
      className={className}
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = DEFAULT_TEAM_LOGO;
      }}
    />
  );
}

TeamLogo.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  className: PropTypes.string,
};

export default TeamLogo;
