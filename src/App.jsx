import { useEffect, useState } from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import "./App.css";
import ThemeToggle from "./components/ThemeToggle";
import { CollapsibleCard } from "./components/CollapsibleCard";
import { LinkRow } from "./components/LinkRow";

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

  const linkBtnClass = "cardComponent smallEnlarge iconButton font-semibold";

  return (
    <div className="App">
      <div className="grid gap-x-12 mt-12 grid-cols-1 gap-y-4 mb-12">
        <div className="flex flex-col justify-center align-middle">
          <h1 className="text-3xl font-normal">
            <strong>Francesco</strong> Zonaro
          </h1>
        </div>
        <div className="flex justify-center items-center space-x-2">
          <a
            href="https://github.com/francescozonaro"
            target="_blank"
            rel="noopener noreferrer"
            className={linkBtnClass}
          >
            <FaGithub className="h-4 w-4" />
            <span>Github</span>
          </a>
          <a
            href="https://www.linkedin.com/in/francesco-zonaro-211234248/"
            target="_blank"
            rel="noopener noreferrer"
            className={linkBtnClass}
          >
            <FaLinkedin className="h-4 w-4" />
            <span>Linkedin</span>
          </a>
          <ThemeToggle />
        </div>

        <div className="mt-12 text-left min-w-0">
          <h2 className="font-bold mt-4 text-center text-2xl">Projects</h2>

          {data.projects.map((project, index) => (
            <CardItem key={project.title || index} item={project} />
          ))}
        </div>

        <div className="mt-12 text-left min-w-0">
          <h2 className="font-bold mt-4 text-center text-2xl">Reports</h2>

          {data.reports.map((report, index) => (
            <CardItem key={report.title || index} item={report} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CardItem({ item }) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <CollapsibleCard
      title={item.title}
      isCollapsed={isCollapsed}
      onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      customClasses="mt-8"
    >
      <LinkRow links={item.links}>{item.description}</LinkRow>
    </CollapsibleCard>
  );
}

export default App;
