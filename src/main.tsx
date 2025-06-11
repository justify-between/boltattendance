import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";

import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: {
          background: "#363636",
          color: "#fff",
        },
      }}
    />
    <a href="https://bolt.new" target="_blank" rel="noopener noreferrer">
      <img
        width={80}
        height={80}
        src="/black_circle.png"
        alt="Click to visit Bolt"
        className="absolute bottom-4 right-4 cursor-pointer transition-transform duration-300 hover:rotate-180"
      />
    </a>

    <App />
  </StrictMode>
);
