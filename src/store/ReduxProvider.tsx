"use client";

import { Provider } from "react-redux";
import { store } from "@/store/store";
import { AuthBootstrap } from "@/store/AuthBootstrap";

interface ReduxProviderProps {
  children: React.ReactNode;
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  return (
    <Provider store={store}>
      <AuthBootstrap />
      {children}
    </Provider>
  );
}
