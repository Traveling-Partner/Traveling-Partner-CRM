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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import type { EmergencyService, EmergencyServiceType } from "@/types/safety-center";

type FormState = {
  name: string;
  type: EmergencyServiceType;
  phone: string;
  city: string;
  available24h: boolean;
  notes: string;
};

const empty: FormState = {
  name: "",
  type: "POLICE",
  phone: "",
  city: "",
  available24h: true,
  notes: ""
};

export function EmergencyServiceFormDialog({
  open,
  onOpenChange,
  initial,
  onSave
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: EmergencyService | null;
  onSave: (value: Omit<EmergencyService, "id"> & { id?: string }) => void;
}) {
  const [form, setForm] = useState<FormState>(empty);

  useEffect(() => {
    if (!open) return;
    setForm(
      initial
        ? {
            name: initial.name,
            type: initial.type,
            phone: initial.phone,
            city: initial.city,
            available24h: initial.available24h,
            notes: initial.notes ?? ""
          }
        : empty
    );
  }, [open, initial]);

  const canSave = form.name.trim() && form.phone.trim() && form.city.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit emergency service" : "Add emergency service"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="es-name">Name</Label>
            <Input
              id="es-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Type</Label>
            <Select
              value={form.type}
              onValueChange={(v) => setForm((f) => ({ ...f, type: v as EmergencyServiceType }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="POLICE">Police</SelectItem>
                <SelectItem value="AMBULANCE">Ambulance</SelectItem>
                <SelectItem value="FIRE">Fire</SelectItem>
                <SelectItem value="ROADSIDE">Roadside</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="es-phone">Phone</Label>
            <Input
              id="es-phone"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="es-city">City</Label>
            <Input
              id="es-city"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="es-notes">Notes</Label>
            <Input
              id="es-notes"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.available24h}
              onChange={(e) => setForm((f) => ({ ...f, available24h: e.target.checked }))}
            />
            Available 24 hours
          </label>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!canSave}
            onClick={() => {
              onSave({
                id: initial?.id,
                name: form.name,
                type: form.type,
                phone: form.phone,
                city: form.city,
                available24h: form.available24h,
                notes: form.notes || undefined
              });
              onOpenChange(false);
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
