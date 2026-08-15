"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Sparkles, ArrowRight } from "lucide-react";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useApp } from "@/context/app-context";
import { createClient } from "@/lib/supabase/client";
import { isDemoMode } from "@/lib/api";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const { refreshProfile } = useApp();
  const [error, setError] = useState<string | null>(null);
  const demo = isDemoMode();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) as never });

  const enterDemo = async () => {
    await refreshProfile();
    router.replace("/app");
  };

  const submit = async (values: FormValues) => {
    const supabase = createClient();
    if (!supabase) return enterDemo();
    setError(null);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (authError) {
      setError(authError.message);
      return;
    }
    toast.success("Welcome back");
    await refreshProfile();
    router.replace("/app");
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      {demo && (
        <div className="rounded-2xl border border-primary/25 bg-primary/[0.05] p-4">
          <p className="flex items-center gap-2 text-[13px] font-semibold text-ink">
            <Sparkles className="size-4 text-primary" /> Demo mode is active
          </p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">
            No Supabase credentials are configured, so you can explore the full product with seeded data. No account needed.
          </p>
          <Button variant="primary" size="sm" className="mt-3" onClick={enterDemo}>
            Enter demo <ArrowRight className="size-3.5" />
          </Button>
        </div>
      )}

      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="nova@example.com" autoComplete="email" {...register("email")} />
        {errors.email && <p className="mt-1 text-[12px] text-danger">{errors.email.message}</p>}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link href="/forgot-password" className="text-[12px] font-medium text-primary hover:underline">
            Forgot it?
          </Link>
        </div>
        <Input id="password" type="password" placeholder="••••••••" autoComplete="current-password" {...register("password")} />
        {errors.password && <p className="mt-1 text-[12px] text-danger">{errors.password.message}</p>}
      </div>

      {error && (
        <p className="rounded-lg border border-danger/25 bg-danger/[0.06] px-3 py-2 text-[12.5px] text-danger">{error}</p>
      )}

      <Button type="submit" variant="primary" className="w-full" loading={isSubmitting} disabled={demo}>
        Sign in
      </Button>

      <p className="pt-1 text-center text-[13px] text-ink-muted">
        New here?{" "}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
