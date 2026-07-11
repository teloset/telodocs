import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";
import { hydrateDocsBootstrap } from "./shared/api/bootstrap";
import "./shared/styles/tokens.css";
import "./shared/styles/base.css";

hydrateDocsBootstrap();

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element #root not found");
}

createRoot(root).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
