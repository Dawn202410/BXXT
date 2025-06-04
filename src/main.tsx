import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from 'sonner';
import App from "./App.tsx";
import "./index.css";

// Load Inter font
const inter = document.createElement('link');
inter.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
inter.rel = 'stylesheet';
document.head.appendChild(inter);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster 
        position="bottom-center"
        toastOptions={{
          style: {
            marginBottom: '40px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '14px',
            maxWidth: '500px'
          }
        }}
        offset="20px"
      />
    </BrowserRouter>
  </StrictMode>
);
