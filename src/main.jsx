import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";
import "./theme.css";

const savedTheme = localStorage.getItem("donorhub-theme");
document.documentElement.dataset.theme = savedTheme === "light" ? "light" : "dark";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
