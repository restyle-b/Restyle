"use client";

import { MoreVertical, Pencil, Star, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { UserAddress } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export function AddressCard({
  address,
  onEdit,
  onSetDefault,
  onDelete,
}: {
  address: UserAddress;
  onEdit: () => void;
  onSetDefault: () => void;
  onDelete: () => void;
}) {
  const t = useTranslations("account.addresses");

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 pt-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-white">{address.label}</p>
            {address.isDefault && <Badge tone="accent">{t("defaultBadge")}</Badge>}
          </div>
          <p className="mt-1 text-sm text-neutral-300">
            {address.line}, {address.city}
          </p>
          {address.notes && <p className="mt-1 text-sm text-neutral-500">{address.notes}</p>}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={t("editCta")}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              <MoreVertical className="h-4 w-4" aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={onEdit}>
              <Pencil className="h-4 w-4" aria-hidden="true" />
              {t("editCta")}
            </DropdownMenuItem>
            {!address.isDefault && (
              <DropdownMenuItem onSelect={onSetDefault}>
                <Star className="h-4 w-4" aria-hidden="true" />
                {t("setDefaultCta")}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem destructive onSelect={onDelete}>
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              {t("deleteCta")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
}
