import type { Metadata } from "next";
import { WrappedPage } from "@/features/wrapped/WrappedPage";

export const metadata: Metadata = {
  title: "Wrapped",
};

export default function Page() {
  return <WrappedPage />;
}
