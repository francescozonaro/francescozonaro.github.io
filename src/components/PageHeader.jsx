import { useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

export default function PageHeader({ title, children, className = "" }) {
  const navigate = useNavigate();

  return (
    <div
      className={`flex justify-between items-center flex-shrink-0 pt-1 ${className}`}
    >
      <button
        className="text-lg font-normal lowercase text-primary hover:text-secondary transition-colors cursor-pointer"
        onClick={() => navigate("/")}
      >
        Francesco Zonaro
      </button>

      <div className="flex items-center justify-center space-x-2 text-2xl font-bold tracking-tight">
        {children || title}
      </div>

      <ThemeToggle className="-mr-1" />
    </div>
  );
}
