"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, LogOut } from "lucide-react";
import { signOut } from "@/server/actions/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ProfileMenu({ email }: { email: string }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleSignOut() {
    setIsPending(true);
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-neutral-200 transition-colors hover:bg-white/20 hover:text-white"
          aria-label="תפריט משתמש"
        >
          <User className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="normal-case">
          <div className="flex flex-col gap-0.5">
            <span className="truncate text-sm font-medium text-white">{email}</span>
            <span className="text-xs text-neutral-500">מנהל מערכת</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleSignOut} disabled={isPending} destructive>
          <LogOut className="h-4 w-4" />
          {isPending ? "מתנתק..." : "התנתקות"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
