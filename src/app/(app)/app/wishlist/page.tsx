import type { Metadata } from "next";
import { WishlistPage } from "@/features/wishlist/WishlistPage";

export const metadata: Metadata = {
  title: "Wishlist",
};

export default function Page() {
  return <WishlistPage />;
}
