"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { isDemoMode } from "@/lib/api";
import { MIN_PASSWORD_LENGTH } from "@/lib/constants";

const schema = z
  .object({
    displayName: z.string().min(1, "What should we call you?").max(40),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(MIN_PASSWORD_LENGTH, `At least ${MIN_PASSWORD_LENGTH} characters`),
  })
  .refine((v) => v.password.length >= MIN_PASSWORD_LENGTH, { message: "Password too short" });

type FormValues = z.infer<typeof schema>;

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const demo = isDemoMode();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) as never });

  const submit = async (values: FormValues) => {
    const supabase = createClient();
    if (!supabase) {
      router.replace("/login");
      return;
    }
    setError(null);
    const { error: authError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { display_name: values.displayName, username: values.displayName.toLowerCase().replace(/\s+/g, "_") },
        emailRedirectTo: `${window.location.origin}/app`,
      },
    });
    if (authError) {
      setError(authError.message);
      return;
    }
    toast.success("Account created");
    setSent(true);
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center py-6 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <CheckCircle2 className="size-6" />
        </span>
        <h2 className="mt-4 font-display text-[18px] font-bold text-ink">Check your inbox</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
          We sent a confirmation link to your email. Verify it, then sign in to start tracking.
        </p>
        <Button variant="outline" className="mt-5" onClick={() => router.replace("/login")}>
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div>
        <Label htmlFor="displayName">Display name</Label>
        <Input id="displayName" placeholder="Nova" autoComplete="name" {...register("displayName")} />
        {errors.displayName && <p className="mt-1 text-[12px] text-danger">{errors.displayName.message}</p>}
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="nova@example.com" autoComplete="email" {...register("email")} />
        {errors.email && <p className="mt-1 text-[12px] text-danger">{errors.email.message}</p>}
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="••••••••" autoComplete="new-password" {...register("password")} />
        {errors.password && <p className="mt-1 text-[12px] text-danger">{errors.password.message}</p>}
      </div>

      {error && (
        <p className="rounded-lg border border-danger/25 bg-danger/[0.06] px-3 py-2 text-[12.5px] text-danger">{error}</p>
      )}

      {demo && (
        <p className="rounded-lg border border-warning/25 bg-warning/[0.06] px-3 py-2 text-[12px] text-warning">
          Demo mode: no Supabase configured — this form is disabled. Head to{" "}
          <Link href="/login" className="font-medium underline">sign in</Link> to explore the demo.
        </p>
      )}

      <Button type="submit" variant="primary" className="w-full" loading={isSubmitting} disabled={demo}>
        Create account
      </Button>

      <p className="pt-1 text-center text-[13px] text-ink-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
