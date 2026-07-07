"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/server/actions/auth";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleSignOut() {
    setIsPending(true);
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isPending}
      className={cn(buttonVariants({ variant: "outline" }), className)}
    >
      {isPending ? "מתנתק..." : "התנתקות"}
    </button>
  );
}
