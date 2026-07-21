import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App.jsx";
import { enableMocking } from "./mocks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./styles/index.css";

const queryClient = new QueryClient();

async function bootstrap() {
  await enableMocking();

  createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </React.StrictMode>
  );
}

bootstrap();
