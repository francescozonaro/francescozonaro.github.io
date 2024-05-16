import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ProjectBetting from "./project-betting/ProjectBetting";
import StatsbombShowcase from "./statsbomb-showcase/StatsbombShowcase";

import {
  // createBrowserRouter,
  createHashRouter,
  RouterProvider,
} from "react-router-dom";

const router = createHashRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/betting",
    element: <ProjectBetting />,
  },
  {
    path: "/statsbomb-showcase",
    element: <StatsbombShowcase />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
