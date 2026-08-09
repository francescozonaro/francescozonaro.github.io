import PropTypes from "prop-types";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";

// Shared collapsible card shell used by PlaceholderWidget, GoalsPerHourWidget,
// and the league fixture groups in FotmobCompanion.
export default function CollapsibleCard({
  icon: Icon,
  title,
  badge,
  actions,
  isCollapsed,
  onToggleCollapse,
  children,
}) {
  return (
    <div className="border-[0.5px] border-background-light rounded-xl overflow-hidden bg-background-dark/20 shadow-md transition-all">
      <div
        className={`px-4 py-2.5 bg-background-dark/60 flex justify-between items-center ${
          !isCollapsed ? "border-b border-background-light/50" : ""
        }`}
      >
        <div className="flex items-center space-x-2">
          {Icon && <Icon className="h-4 w-4 text-secondary flex-shrink-0" />}
          <span className="font-bold text-sm tracking-wide">{title}</span>
          {badge}
        </div>

        <div className="flex items-center space-x-2">
          {actions}
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded text-primary/60 hover:text-primary hover:bg-background-light/40 transition-colors border border-background-light/60 bg-background-dark/50 cursor-pointer"
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronUpIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {!isCollapsed && children}
    </div>
  );
}

CollapsibleCard.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.node.isRequired,
  badge: PropTypes.node,
  actions: PropTypes.node,
  isCollapsed: PropTypes.bool.isRequired,
  onToggleCollapse: PropTypes.func.isRequired,
  children: PropTypes.node,
};
