import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

export default function PageHeader({ title, children, className = "" }) {
  const navigate = useNavigate();

  return (
    <div
      className={`flex justify-between items-center flex-shrink-0 pt-1 px-1 ${className}`}
    >
      <button
        className="cardComponent smallEnlarge origin-left text-xs text-secondary px-3 py-1.5 cursor-pointer"
        onClick={() => navigate("/")}
      >
        ← Portfolio
      </button>

      <div className="flex items-center justify-center space-x-2 text-2xl font-bold tracking-tight">
        {children || title}
      </div>

      <ThemeToggle />
    </div>
  );
}

PageHeader.propTypes = {
  title: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string,
};
