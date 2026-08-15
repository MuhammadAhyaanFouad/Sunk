"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { MailCheck } from "lucide-react";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});

type FormValues = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) as never });

  const submit = async (values: FormValues) => {
    const supabase = createClient();
    if (!supabase) {
      toast.info("Demo mode doesn't need password resets");
      setSent(true);
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      {sent ? (
        <div className="flex flex-col items-center py-4 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <MailCheck className="size-6" />
          </span>
          <h2 className="mt-4 font-display text-[18px] font-bold text-ink">Reset link sent</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
            If an account exists for that email, you'll find a reset link shortly.
          </p>
          <Button variant="outline" className="mt-5" onClick={() => setSent(false)}>
            Send again
          </Button>
        </div>
      ) : (
        <>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="nova@example.com" autoComplete="email" {...register("email")} />
            {errors.email && <p className="mt-1 text-[12px] text-danger">{errors.email.message}</p>}
          </div>
          <Button type="submit" variant="primary" className="w-full" loading={isSubmitting}>
            Send reset link
          </Button>
        </>
      )}

      <p className="pt-1 text-center text-[13px] text-ink-muted">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
