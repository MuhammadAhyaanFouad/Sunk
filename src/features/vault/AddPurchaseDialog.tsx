"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useAddPurchase, useUpdatePurchase } from "@/hooks/use-data";
import type { Purchase } from "@/types";
import { PLATFORMS, PURCHASE_CATEGORIES, CATEGORY_META, PLATFORM_META } from "@/lib/constants";
import { useApp } from "@/context/app-context";

const schema = z.object({
  title: z.string().min(1, "Give it a name"),
  amount: z.coerce.number({ message: "Enter an amount" }).positive("Must be more than 0"),
  platform: z.enum(PLATFORMS),
  category: z.enum(PURCHASE_CATEGORIES),
  purchasedAt: z.string().min(1, "Pick a date"),
  tags: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function AddPurchaseDialog({
  open,
  onClose,
  purchase,
  onCloseEditing,
}: {
  open: boolean;
  onClose: () => void;
  purchase: Purchase | null;
  onCloseEditing: () => void;
}) {
  const addPurchase = useAddPurchase();
  const updatePurchase = useUpdatePurchase();
  const { isDemo } = useApp();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: {
      title: "",
      amount: undefined,
      platform: "steam",
      category: "games",
      purchasedAt: new Date().toISOString().slice(0, 10),
      tags: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (purchase) {
        reset({
          title: purchase.title,
          amount: purchase.amount,
          platform: purchase.platform,
          category: purchase.category,
          purchasedAt: purchase.purchasedAt.slice(0, 10),
          tags: purchase.tags.join(", "),
          notes: purchase.notes ?? "",
        });
      } else {
        reset();
      }
    }
  }, [open, purchase, reset]);

  const submit = async (values: FormValues) => {
    const tags = values.tags
      ?.split(",")
      .map((t) => t.trim())
      .filter(Boolean) ?? [];

    if (purchase) {
      await updatePurchase.mutateAsync({
        id: purchase.id,
        patch: {
          title: values.title,
          amount: values.amount,
          platform: values.platform,
          category: values.category,
          purchasedAt: new Date(values.purchasedAt).toISOString(),
          tags,
          notes: values.notes || null,
        },
      });
      onCloseEditing();
    } else {
      await addPurchase.mutateAsync({
        title: values.title,
        platform: values.platform,
        category: values.category,
        amount: values.amount,
        purchasedAt: new Date(values.purchasedAt).toISOString(),
        tags,
        notes: values.notes || null,
      });
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        onClose();
        onCloseEditing();
      }}
      title={purchase ? "Edit purchase" : "Add a purchase"}
      description={purchase ? "Update the details of this entry." : "Log another chapter in your gaming story."}
      footer={
        <>
          <Button variant="ghost" onClick={() => { onClose(); onCloseEditing(); }}>
            Cancel
          </Button>
          <Button form="add-purchase-form" type="submit" variant="primary" loading={isSubmitting}>
            {purchase ? "Save changes" : isDemo ? "Add to Vault" : "Add to Vault"}
          </Button>
        </>
      }
    >
      <form id="add-purchase-form" onSubmit={handleSubmit(submit)} className="space-y-4">
        <div>
          <Label htmlFor="title">Name</Label>
          <Input id="title" placeholder="e.g. Elden Ring: Shadow of the Erdtree" {...register("title")} />
          {errors.title && <p className="mt-1 text-[12px] text-danger">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="amount">Amount (USD)</Label>
            <Input id="amount" type="number" step="0.01" min="0" placeholder="59.99" {...register("amount")} />
            {errors.amount && <p className="mt-1 text-[12px] text-danger">{errors.amount.message}</p>}
          </div>
          <div>
            <Label htmlFor="purchasedAt">Date</Label>
            <Input id="purchasedAt" type="date" {...register("purchasedAt")} />
            {errors.purchasedAt && <p className="mt-1 text-[12px] text-danger">{errors.purchasedAt.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="platform">Platform</Label>
            <Select
              id="platform"
              {...register("platform")}
              options={PLATFORMS.map((p) => ({ value: p, label: PLATFORM_META[p].label }))}
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              id="category"
              {...register("category")}
              options={PURCHASE_CATEGORIES.map((c) => ({ value: c, label: CATEGORY_META[c].label }))}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="tags">Tags</Label>
          <Input id="tags" placeholder="skin, battle pass, sale (comma separated)" {...register("tags")} />
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" placeholder="Optional — why did you buy it?" {...register("notes")} />
        </div>
      </form>
    </Dialog>
  );
}
