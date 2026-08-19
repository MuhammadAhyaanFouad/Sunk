import type { Metadata } from "next";
import { LandingPage } from "@/features/landing/LandingPage";
import { BRAND } from "@/lib/constants";

export const metadata: Metadata = {
  title: BRAND.tagline,
  description: BRAND.description,
};

export default function Page() {
  return <LandingPage />;
}
