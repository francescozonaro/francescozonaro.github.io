import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LinkIcon,
  CodeBracketIcon,
  DocumentIcon,
} from "@heroicons/react/24/solid";
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

  const linkBtnClass =
    "cardComponent smallEnlarge align-middle justify-center flex p-1";

  const renderLinkButton = (url, IconComponent) => {
    const isInternal = url.startsWith("/#/") || url.startsWith("/");
    if (isInternal) {
      return (
        <Link
          to={url.replace(/^\/#/, "")}
          className={`${linkBtnClass} text-secondary`}
        >
          <IconComponent className="h-5 w-5" />
        </Link>
      );
    }
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={linkBtnClass}
      >
        <IconComponent className="h-5 w-5" />
      </a>
    );
  };

  const linkIcons = {
    code: (url) => renderLinkButton(url, CodeBracketIcon),
    link: (url) => renderLinkButton(url, LinkIcon),
    pdf: (url) => renderLinkButton(url, DocumentIcon),
  };

  return (
    <div className="App">
      <div className="grid gap-x-12 mt-12 md:grid-cols-1 gap-y-4 lg:grid-cols-2 mb-12">
        <div className="flex flex-col justify-center align-middle">
          <div className="text-3xl">
            <strong>Francesco</strong> Zonaro
          </div>
        </div>
        <div className="flex justify-center items-center space-x-2">
          <a
            href="https://github.com/francescozonaro"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm cardComponent smallEnlarge p-2"
          >
            Github
          </a>
          <a
            href="https://www.linkedin.com/in/francesco-zonaro-211234248/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm cardComponent smallEnlarge p-2"
          >
            Linkedin
          </a>
          <ThemeToggle />
        </div>

        <div className="mt-12 text-left">
          <h1 className="font-bold mt-4 text-center text-2xl">Projects</h1>

          {data.projects.map((project, index) => (
            <CardItem
              key={project.title || index}
              item={project}
              linkIcons={linkIcons}
            />
          ))}
        </div>

        <div className="mt-12 text-left">
          <h1 className="font-bold mt-4 text-center text-2xl">Reports</h1>

          {data.reports.map((report, index) => (
            <CardItem
              key={report.title || index}
              item={report}
              linkIcons={linkIcons}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CardItem({ item, linkIcons }) {
  return (
    <div className="mt-8 border-[0.5px] rounded-xl p-6 border-background-dark shadow-xl">
      <div className="font-bold">{item.title}</div>
      <div className="mt-2 text-sm text-justify">{item.description}</div>
      <div className="flex justify-center space-x-6 mt-6">
        {item.links.map((link, lIdx) => (
          <span key={lIdx}>{linkIcons[link.type]?.(link.url) || null}</span>
        ))}
      </div>
    </div>
  );
}

export default App;
