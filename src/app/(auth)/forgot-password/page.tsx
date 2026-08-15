import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/features/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset password",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="font-display text-[22px] font-bold text-ink">Reset password</h1>
        <p className="mt-1 text-[13px] text-ink-muted">We'll email you a link to set a new one.</p>
      </div>
      <ForgotPasswordForm />
    </>
  );
}
