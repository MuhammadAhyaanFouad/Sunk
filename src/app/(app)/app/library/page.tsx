import type { Metadata } from "next";
import { LibraryPage } from "@/features/library/LibraryPage";

export const metadata: Metadata = {
  title: "Library",
};

export default function Page() {
  return <LibraryPage />;
}
