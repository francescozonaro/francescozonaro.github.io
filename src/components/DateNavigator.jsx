import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import {
  shiftDateString,
  formatDateLabel,
} from "../fotmob-companion/utils/date";

// Controlled day picker: shows `date` (YYYY-MM-DD) and asks the page for the
// previous/next day through `onChange`.
export function DateNavigator({ date, onChange }) {
  return (
    <div className="flex items-stretch sm:items-center gap-2">
      <div className="flex items-center justify-center flex-shrink-0 flex-1 min-w-52 px-3 py-0.5 gap-4 rounded-md border border-background-dark bg-background-dark/80 text-primary">
        <button
          onClick={() => onChange(shiftDateString(date, -1))}
          aria-label="Previous day"
          className="p-1 text-primary/70 hover:text-primary cursor-pointer"
        >
          <HiChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-xs text-primary whitespace-nowrap text-center min-w-28">
          {formatDateLabel(date)}
        </span>
        <button
          onClick={() => onChange(shiftDateString(date, 1))}
          aria-label="Next day"
          className="p-1 text-primary/70 hover:text-primary cursor-pointer"
        >
          <HiChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
