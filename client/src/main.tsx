import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./assets/styles/index.scss";
import App from "./App.tsx";

const isProduction = import.meta.env.MODE === "production";

createRoot(document.getElementById("root")!).render(
    isProduction ? (
        <App />
    ) : (
        <StrictMode>
            <App />
        </StrictMode>
    )
);
