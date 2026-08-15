import type { Metadata } from "next";
import { RoastPage } from "@/features/roast/RoastPage";

export const metadata: Metadata = {
  title: "Roast Mode",
};

export default function Page() {
  return <RoastPage />;
}
