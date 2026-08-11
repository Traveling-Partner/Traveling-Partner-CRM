"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActiveInactiveStatusField } from "@/components/common/ActiveInactiveStatusField";
import type { SosApiRecord, SosStatus, SosUpsertPayload } from "@/services/sos";

const emptyForm: SosUpsertPayload = {
  name: "",
  number: "",
  state: "",
  status: "ACTIVE"
};

export function SosServiceFormDialog({
  open,
  onOpenChange,
  initial,
  onSave
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: SosApiRecord | null;
  /** Resolves on success; rejection keeps the dialog open (page shows the error toast). */
  onSave: (payload: SosUpsertPayload, id?: number) => Promise<void>;
}) {
  const [form, setForm] = useState<SosUpsertPayload>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(
      initial
        ? {
            name: initial.name,
            number: initial.number,
            state: initial.state,
            status: initial.status
          }
        : emptyForm
    );
  }, [open, initial]);

  const canSave =
    form.name.trim().length > 0 &&
    form.number.trim().length > 0 &&
    form.state.trim().length > 0 &&
    !saving;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(
        {
          name: form.name.trim(),
          number: form.number.trim(),
          state: form.state.trim(),
          status: form.status
        },
        initial?.id
      );
      onOpenChange(false);
    } catch {
      // Error toast is shown by the page; keep dialog open for corrections.
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !saving && onOpenChange(next)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initial ? "Edit SOS service" : "Add SOS service"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="sos-name">Name</Label>
            <Input
              id="sos-name"
              placeholder="e.g., Police Emergency"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="sos-number">Number</Label>
            <Input
              id="sos-number"
              placeholder="e.g., 15"
              value={form.number}
              onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="sos-state">State</Label>
            <Input
              id="sos-state"
              placeholder="e.g., Sindh"
              value={form.state}
              onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Status</Label>
            <ActiveInactiveStatusField
              value={form.status}
              onChange={(status: SosStatus) => setForm((f) => ({ ...f, status }))}
              disabled={saving}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" disabled={!canSave} onClick={() => void handleSave()}>
            {saving ? "Saving…" : initial ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
