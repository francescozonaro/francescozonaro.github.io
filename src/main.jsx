import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import StatsbombShowcase from "./statsbomb-showcase/StatsbombShowcase";
import FotmobCompanion from "./fotmob-companion/FotmobCompanion";

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
    path: "/statsbomb-showcase",
    element: <StatsbombShowcase />,
  },
  {
    path: "/fotmob-companion",
    element: <FotmobCompanion />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
