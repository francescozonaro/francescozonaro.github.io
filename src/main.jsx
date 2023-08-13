import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ProjectBetting from "./ProjectBetting";
import ReportEuroFinal from "./ReportEuroFinal";

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
    path: "/italy-england-report",
    element: <ReportEuroFinal />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
