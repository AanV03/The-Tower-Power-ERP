"use client";

import { useState, useId } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { formatMessage, getDictionary, type Locale } from "@/lib/i18n";

type BranchOption = {
  id: string;
  name: string;
};

export function WarehouseFormDialog({ branches, locale }: { branches: BranchOption[]; locale: Locale }) {
  const t = getDictionary(locale).inventory;
  const router = useRouter();
  const formId = useId();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [branchId, setBranchId] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(t.toast.warehouseNameRequired);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/inventory/warehouses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          branchId: branchId || undefined,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || t.toast.warehouseCreateFailed);
      }

      toast.success(formatMessage(t.toast.warehouseCreated, { name: result.data.name }));
      setOpen(false);
      setName("");
      setBranchId("");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || t.toast.unexpected);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant="outline">
            <Plus className="size-4" />
            {t.actions.newWarehouse}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.warehouseDialog.title}</DialogTitle>
          <DialogDescription>
            {t.warehouseDialog.description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <label className="grid gap-1.5 text-sm font-medium text-foreground" htmlFor={`${formId}-name`}>
            <span>{t.warehouseDialog.name}</span>
            <Input
              id={`${formId}-name`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.warehouseDialog.namePlaceholder}
              required
            />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-foreground" htmlFor={`${formId}-branch`}>
            <span>{t.warehouseDialog.branch}</span>
            <NativeSelect
              id={`${formId}-branch`}
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full"
            >
              <NativeSelectOption value="">{t.warehouseDialog.selectBranch}</NativeSelectOption>
              {branches.map((branch) => (
                <NativeSelectOption key={branch.id} value={branch.id}>
                  {branch.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </label>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              {t.actions.cancel}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t.actions.creating : t.actions.createWarehouse}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
