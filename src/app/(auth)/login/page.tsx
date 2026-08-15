import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="font-display text-[22px] font-bold text-ink">Welcome back</h1>
        <p className="mt-1 text-[13px] text-ink-muted">Your number is right where you left it.</p>
      </div>
      <LoginForm />
    </>
  );
}
