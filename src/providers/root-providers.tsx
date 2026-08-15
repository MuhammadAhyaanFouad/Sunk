import type { ReactNode } from "react";
import { QueryProvider } from "@/providers/query-provider";
import { ToasterProvider } from "@/providers/toaster";
import { AppProvider } from "@/context/app-context";

export function RootProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AppProvider>
        {children}
        <ToasterProvider />
      </AppProvider>
    </QueryProvider>
  );
}
