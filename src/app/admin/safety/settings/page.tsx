"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { useToast } from "@/components/ui/toast";
import { SafetySettingsForm } from "@/components/safety-center/SafetySettingsForm";
import { safetySettingsSeed } from "@/mock-data/safety-center";

export default function AdminSafetySettingsPage() {
  const { success } = useToast();
  const [settings, setSettings] = useState(safetySettingsSeed);

  return (
    <AppShell title="Safety Settings">
      <PageContainer>
        <SectionCard
          title="Safety settings"
          description="Platform SOS preferences. Saved to local mock state only."
        >
          <SafetySettingsForm
            value={settings}
            onChange={setSettings}
            onSave={() => success("Safety settings saved (mock)")}
          />
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
