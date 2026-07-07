"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import type { AdminActionResult } from "@/server/actions/admin/products";

export function ProductToggleCell({
  id,
  checked,
  ariaLabel,
  onToggle,
}: {
  id: string;
  checked: boolean;
  ariaLabel: string;
  onToggle: (id: string, value: boolean) => Promise<AdminActionResult>;
}) {
  const router = useRouter();
  const [optimistic, setOptimistic] = useState(checked);
  const [isPending, startTransition] = useTransition();

  return (
    <Switch
      checked={optimistic}
      disabled={isPending}
      aria-label={ariaLabel}
      onCheckedChange={(value) => {
        setOptimistic(value);
        startTransition(async () => {
          const result = await onToggle(id, value);
          if (result.ok) {
            router.refresh();
          } else {
            setOptimistic(!value);
            toast.error(result.error);
          }
        });
      }}
    />
  );
}
