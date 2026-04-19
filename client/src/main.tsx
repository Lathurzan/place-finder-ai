import React from "react";
import ReactDOM from "react-dom/client";
import AppRoutes from "./routes";
import "./index.css";
import "./theme.css";
import { ThemeProvider } from "./context/ThemeContext";
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AppRoutes />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
