import type { Metadata } from "next";
import { VaultPage } from "@/features/vault/VaultPage";

export const metadata: Metadata = {
  title: "Vault",
};

export default function Page() {
  return <VaultPage />;
}
