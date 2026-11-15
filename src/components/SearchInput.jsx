import { HiMagnifyingGlass } from "react-icons/hi2";

// Controlled text box: the page owns `value` and decides what to filter.
export function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="relative flex-1">
      <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="inputField w-full pl-9 pr-3 py-1.5 text-xs"
      />
    </div>
  );
}
