import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./globals.css";
import App from "./App";
import { Analytics } from "@vercel/analytics/react";

// Applique le thème avant le premier render pour éviter le flash
const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
const initialTheme = savedTheme ?? "dark";
if (initialTheme === "dark") {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Analytics />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);

console.log(
  "%cRare sont ceux qui arrivent ici.\n\n%cTu es l'un d'eux alors n'hésite pas => contact@gillescobigo.com",
  "color: #D85A30; font-weight: bold; font-size: 13px;",
  "color: #888; font-size: 12px;",
);
