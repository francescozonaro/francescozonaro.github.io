import PropTypes from "prop-types";
import { DEFAULT_TEAM_LOGO } from "./utilities";

export function TeamLogo({
  src,
  className = "w-6 h-6 object-contain flex-shrink-0",
}) {
  return (
    <img
      src={src || DEFAULT_TEAM_LOGO}
      alt=""
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
  className: PropTypes.string,
};

export default TeamLogo;
