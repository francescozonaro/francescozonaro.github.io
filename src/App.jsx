import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import "./App.css";
import ThemeToggle from "./components/ThemeToggle";

function App() {
  const [data, setData] = useState({ projects: [], reports: [] });

  useEffect(() => {
    fetch("/projects.json")
      .then((response) => response.json())
      .then((data) => setData(data))
      .catch((error) =>
        console.error("Error fetching projects and reports:", error),
      );
  }, []);

  // Newest first; the sort is stable, so same-year entries keep their order in the JSON.
  const entries = [...data.projects, ...data.reports].sort(
    (a, b) => b.year - a.year,
  );

  const linkBtnClass =
    "smallEnlarge iconButton !px-2 sm:!px-3 font-semibold text-primary hover:text-secondary transition";

  return (
    <div className="App">
      <div className="grid gap-x-12 mt-4 grid-cols-1 gap-y-4 mb-12">
        <div className="flex items-center justify-between gap-2">
          <h1 className="whitespace-nowrap text-sm font-normal lowercase sm:text-lg">
            Francesco Zonaro
          </h1>
          <div className="flex items-center sm:space-x-2">
            <a
              href="https://github.com/francescozonaro"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Github"
              className={linkBtnClass}
            >
              <FaGithub className="h-4 w-4 sm:hidden" />
              <span className="hidden sm:inline">Github</span>
            </a>
            <a
              href="https://www.linkedin.com/in/francesco-zonaro-211234248/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Linkedin"
              className={linkBtnClass}
            >
              <FaLinkedin className="h-4 w-4 sm:hidden" />
              <span className="hidden sm:inline">Linkedin</span>
            </a>
            <ThemeToggle className="-mr-1" />
          </div>
        </div>

        <div className="mt-12 text-left border-b border-primary/20">
          {entries.map((item) => (
            <Entry key={item.title} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Year + name; the whole row links to the entry's first link (internal route, or PDF/site in a new tab).
function Entry({ item }) {
  const url = item.links[0].url;
  const cls =
    "group flex gap-6 text-sm border-t border-primary/20 py-3 text-primary hover:text-secondary transition";
  const body = (
    <>
      <span className="w-12 flex-shrink-0 text-primary/50 transition-colors group-hover:text-secondary">
        {item.year}
      </span>
      <span>{item.title}</span>
    </>
  );
  return url.startsWith("/#/") ? (
    <Link to={url.slice(2)} className={cls}>
      {body}
    </Link>
  ) : (
    <a href={url} target="_blank" rel="noopener noreferrer" className={cls}>
      {body}
    </a>
  );
}

export default App;
