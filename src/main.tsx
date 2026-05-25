import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

if (window.location.pathname === "/index.html") {
  window.history.replaceState({}, "", "/");
}

createRoot(document.getElementById("root")!).render(<App />);
