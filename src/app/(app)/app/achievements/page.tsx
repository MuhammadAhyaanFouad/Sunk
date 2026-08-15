import type { Metadata } from "next";
import { AchievementsPage } from "@/features/achievements/AchievementsPage";

export const metadata: Metadata = {
  title: "Achievements",
};

export default function Page() {
  return <AchievementsPage />;
}
