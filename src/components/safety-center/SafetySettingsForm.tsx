"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { SafetySettings } from "@/types/safety-center";

export function SafetySettingsForm({
  value,
  onChange,
  onSave
}: {
  value: SafetySettings;
  onChange: (next: SafetySettings) => void;
  onSave: () => void;
}) {
  const toggle = (key: keyof SafetySettings, checked: boolean) => {
    onChange({ ...value, [key]: checked });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {(
          [
            ["autoShareLocation", "Auto-share location during SOS"],
            ["panicButtonEnabled", "Panic button enabled for riders/drivers"],
            ["shareTripWithContacts", "Share live trip with emergency contacts"],
            ["notifyEmergencyContacts", "Notify emergency contacts on SOS"],
            ["autoAlertOnRouteDeviation", "Auto-alert on major route deviation"]
          ] as const
        ).map(([key, label]) => (
          <div
            key={key}
            className="flex items-center justify-between gap-4 rounded-xl border border-border/60 px-4 py-3"
          >
            <Label htmlFor={key} className="cursor-pointer text-sm font-medium">
              {label}
            </Label>
            <Switch
              id={key}
              checked={Boolean(value[key])}
              onCheckedChange={(checked) => toggle(key, checked)}
            />
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="longStop">Long-stop threshold (minutes)</Label>
          <Input
            id="longStop"
            type="number"
            min={1}
            value={value.longStopMinutes}
            onChange={(e) =>
              onChange({ ...value, longStopMinutes: Number(e.target.value) || 1 })
            }
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="cooldown">SOS cooldown (seconds)</Label>
          <Input
            id="cooldown"
            type="number"
            min={0}
            value={value.sosCooldownSeconds}
            onChange={(e) =>
              onChange({ ...value, sosCooldownSeconds: Number(e.target.value) || 0 })
            }
          />
        </div>
      </div>

      <Button type="button" onClick={onSave}>
        Save settings
      </Button>
    </div>
  );
}
