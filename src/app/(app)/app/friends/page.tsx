import type { Metadata } from "next";
import { FriendsPage } from "@/features/friends/FriendsPage";

export const metadata: Metadata = {
  title: "Friends",
};

export default function Page() {
  return <FriendsPage />;
}
