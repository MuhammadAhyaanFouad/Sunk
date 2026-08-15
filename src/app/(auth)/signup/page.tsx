import type { Metadata } from "next";
import { SignupForm } from "@/features/auth/SignupForm";

export const metadata: Metadata = {
  title: "Create an account",
};

export default function SignupPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="font-display text-[22px] font-bold text-ink">Start the reckoning</h1>
        <p className="mt-1 text-[13px] text-ink-muted">Free forever. Your Steam library will judge you kindly.</p>
      </div>
      <SignupForm />
    </>
  );
}
