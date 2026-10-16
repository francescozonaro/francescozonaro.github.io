import { useState } from "react";
import { CollapsibleCard } from "./CollapsibleCard";

// Collapsible card with a count badge and a scrolling list of children
// (e.g. LinkRows). `count` of 0 shows the empty state instead.
export function ListCard({ title, count, emptyTitle, emptyHint, children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <CollapsibleCard
      title={title}
      badge={
        count > 0 && (
          <span className="text-[11px] font-semibold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full ml-1 font-mono">
            {count}
          </span>
        )
      }
      isCollapsed={isCollapsed}
      onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
    >
      <div className="min-h-[220px] flex flex-col">
        {count === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-1 p-3.5 py-8">
            <p className="text-[11px] text-primary/50 font-medium">
              {emptyTitle}
            </p>
            <p className="text-[10px] text-primary/35">{emptyHint}</p>
          </div>
        ) : (
          <div className="divide-y divide-background-light/30 max-h-72 overflow-y-auto no-scrollbar">
            {children}
          </div>
        )}
      </div>
    </CollapsibleCard>
  );
}
