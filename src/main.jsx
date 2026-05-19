import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Dashboard from "../symphonic_marketing_dashboard.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Dashboard />
  </StrictMode>
);
