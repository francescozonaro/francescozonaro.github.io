import { useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

export default function PageHeader({ title, children, className = "" }) {
  const navigate = useNavigate();

  return (
    <div
      className={`flex flex-wrap justify-between items-center gap-y-8 flex-shrink-0 ${className}`}
    >
      <button
        className="whitespace-nowrap text-sm sm:text-lg font-normal lowercase text-primary hover:text-secondary transition-colors cursor-pointer"
        onClick={() => navigate("/")}
      >
        Francesco Zonaro
      </button>

      <div className="order-last flex w-full items-center justify-center space-x-2 text-xl font-bold tracking-tight sm:text-2xl">
        {children || title}
      </div>

      <ThemeToggle className="-mr-1" />
    </div>
  );
}
