"use client";

import { Provider } from "react-redux";
import { QueryProvider } from "@/providers/QueryProvider";
import { store } from "@/store/store";
import { AuthBootstrap } from "@/store/AuthBootstrap";

interface ReduxProviderProps {
  children: React.ReactNode;
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  return (
    <Provider store={store}>
      <QueryProvider>
        <AuthBootstrap />
        {children}
      </QueryProvider>
    </Provider>
  );
}
