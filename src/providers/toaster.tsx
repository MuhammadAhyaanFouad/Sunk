"use client";

import { Toaster } from "sonner";
import { cn } from "@/lib/utils";

export function ToasterProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "#161616",
          border: "1px solid #2A2A2A",
          color: "#F2F2F2",
          borderRadius: "12px",
          boxShadow: "0 16px 48px -8px rgba(0,0,0,0.7)",
        },
        className: cn("text-sm"),
      }}
      richColors
      closeButton
    />
  );
}
