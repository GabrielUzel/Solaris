import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ApolloProvider } from "@apollo/client/react";
import { ThemeProvider } from "./utils/theme";
import client from "./api/appolo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <ApolloProvider client={client}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </ApolloProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
