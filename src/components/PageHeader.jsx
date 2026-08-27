import { useNavigate } from "react-router-dom";
import { HiHome } from "react-icons/hi2";
import ThemeToggle from "./ThemeToggle";

export default function PageHeader({ title, children, className = "" }) {
  const navigate = useNavigate();

  return (
    <div
      className={`flex justify-between items-center flex-shrink-0 pt-1 px-1 ${className}`}
    >
      <button
        className="cardComponent smallEnlarge iconButton origin-left text-secondary"
        onClick={() => navigate("/")}
      >
        <HiHome className="h-4 w-4" />
        <span className="hidden sm:inline">Home</span>
      </button>

      <div className="flex items-center justify-center space-x-2 text-2xl font-bold tracking-tight">
        {children || title}
      </div>

      <ThemeToggle />
    </div>
  );
}
