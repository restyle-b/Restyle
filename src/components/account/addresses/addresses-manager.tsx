"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import type { UserAddress } from "@prisma/client";
import { buttonVariants } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AddressCard } from "@/components/account/addresses/address-card";
import { AddressFormSheet } from "@/components/account/addresses/address-form-sheet";
import { createAddress, updateAddress, setDefaultAddress, deleteAddress } from "@/server/actions/account/addresses";
import type { AddressInput } from "@/lib/account/address-schema";
import { cn } from "@/lib/utils";

/**
 * מסך ניהול הכתובות — ux-spec.md §A4b. אחרי כל מוטציה מרעננים מהשרת
 * (router.refresh()) במקום לתקן ידנית מצב מקומי — "הגדרה כברירת מחדל"
 * משפיעה על 2 שורות בו-זמנית (הישנה+החדשה), תיקון ידני שם יותר שביר
 * מלתת לשרת (מקור האמת) לספר את הסיפור מחדש.
 */
export function AddressesManager({ initialAddresses }: { initialAddresses: UserAddress[] }) {
  const t = useTranslations("account.addresses");
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [deletingAddress, setDeletingAddress] = useState<UserAddress | null>(null);

  function openCreate() {
    setEditingAddress(null);
    setSheetOpen(true);
  }

  function openEdit(address: UserAddress) {
    setEditingAddress(address);
    setSheetOpen(true);
  }

  async function handleFormSubmit(values: AddressInput) {
    const result = editingAddress
      ? await updateAddress(editingAddress.id, values, locale)
      : await createAddress(values, locale);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(editingAddress ? t("toasts.updated") : t("toasts.created"));
    setSheetOpen(false);
    router.refresh();
  }

  function handleSetDefault(address: UserAddress) {
    startTransition(async () => {
      const result = await setDefaultAddress(address.id, locale);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(t("toasts.defaultSet"));
      router.refresh();
    });
  }

  async function handleDeleteConfirmed() {
    if (!deletingAddress) return;
    const result = await deleteAddress(deletingAddress.id, locale);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(t("toasts.deleted"));
    router.refresh();
  }

  return (
    <div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={openCreate}
          className={cn(buttonVariants({ variant: "light", size: "sm" }))}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t("addCta")}
        </button>
      </div>

      {initialAddresses.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <MapPin className="h-10 w-10 text-neutral-600" aria-hidden="true" />
          <p className="max-w-sm text-sm text-neutral-400">{t("empty")}</p>
          <button
            type="button"
            onClick={openCreate}
            className={cn(buttonVariants({ variant: "light", size: "sm" }))}
          >
            {t("emptyCta")}
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {initialAddresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={() => openEdit(address)}
              onSetDefault={() => handleSetDefault(address)}
              onDelete={() => setDeletingAddress(address)}
            />
          ))}
        </div>
      )}

      <AddressFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        editingAddress={editingAddress}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={deletingAddress !== null}
        onOpenChange={(open) => !open && setDeletingAddress(null)}
        title={t("deleteConfirmTitle")}
        description={t("deleteConfirmDescription")}
        confirmLabel={t("deleteCta")}
        onConfirm={handleDeleteConfirmed}
      />

      {isPending && <span className="sr-only" role="status">{t("form.saving")}</span>}
    </div>
  );
}
