"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";

export default function AdminSettingsPage() {
  const { success } = useToast();
  const [defaultCommission, setDefaultCommission] = useState(10);
  const [appName, setAppName] = useState("Traveling Partner Portal");
  const [notifyOnDriver, setNotifyOnDriver] = useState(true);
  const [notifyOnPartner, setNotifyOnPartner] = useState(true);
  const [notifyOnCommission, setNotifyOnCommission] = useState(false);

  const saveCommission = () => {
    success("Commission config saved (mock).");
  };
  const saveApp = () => {
    success("App settings saved (mock).");
  };
  const saveNotifications = () => {
    success("Notification preferences saved (mock).");
  };

  return (
    <AppShell title="Settings">
      <PageContainer>
        <Tabs defaultValue="commission" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="commission">Commission config</TabsTrigger>
            <TabsTrigger value="app">App settings</TabsTrigger>
            <TabsTrigger value="notifications">Notification toggles</TabsTrigger>
          </TabsList>
          <TabsContent value="commission">
            <SectionCard
              title="Default commission rate"
              description="Default percentage for new agents (mock)."
            >
              <div className="flex max-w-xs flex-col gap-3">
                <div>
                  <Label htmlFor="commission">Default rate %</Label>
                  <Input
                    id="commission"
                    type="number"
                    min={0}
                    max={100}
                    value={defaultCommission}
                    onChange={(e) => setDefaultCommission(Number(e.target.value))}
                  />
                </div>
                <Button onClick={saveCommission}>Save</Button>
              </div>
            </SectionCard>
          </TabsContent>
          <TabsContent value="app">
            <SectionCard title="App settings" description="Global app name and branding (mock).">
              <div className="flex max-w-xs flex-col gap-3">
                <div>
                  <Label htmlFor="appName">Application name</Label>
                  <Input
                    id="appName"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                  />
                </div>
                <Button onClick={saveApp}>Save</Button>
              </div>
            </SectionCard>
          </TabsContent>
          <TabsContent value="notifications">
            <SectionCard
              title="Notification toggles"
              description="Choose which events trigger notifications (mock)."
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
                  <Label htmlFor="notify-driver">New driver onboarded</Label>
                  <Switch
                    id="notify-driver"
                    checked={notifyOnDriver}
                    onCheckedChange={setNotifyOnDriver}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
                  <Label htmlFor="notify-partner">New partner onboarded</Label>
                  <Switch
                    id="notify-partner"
                    checked={notifyOnPartner}
                    onCheckedChange={setNotifyOnPartner}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
                  <Label htmlFor="notify-commission">Commission paid</Label>
                  <Switch
                    id="notify-commission"
                    checked={notifyOnCommission}
                    onCheckedChange={setNotifyOnCommission}
                  />
                </div>
                <Button onClick={saveNotifications}>Save preferences</Button>
              </div>
            </SectionCard>
          </TabsContent>
        </Tabs>
      </PageContainer>
    </AppShell>
  );
}
