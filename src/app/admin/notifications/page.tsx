"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth.store";
import { notifications } from "@/mock-data/notifications";
import { format, parseISO } from "date-fns";
import { EmptyState } from "@/components/common/EmptyState";

export default function AdminNotificationsPage() {
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<string>("all");

  const myNotifications = notifications.filter((n) => n.userId === user?.id);
  const unread = myNotifications.filter((n) => !n.read);
  const list = activeTab === "unread" ? unread : myNotifications;

  const markAsRead = (id: string) => {
    // Mock: would call API; list is from mock so we can't mutate. UI could track local read set.
    return () => {};
  };

  return (
    <AppShell title="Notifications">
      <PageContainer>
        <SectionCard
          title="Notifications"
          description="Your inbox. Mark as read is mock."
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">
                All ({myNotifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread">
                Unread ({unread.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              {list.length === 0 ? (
                <EmptyState
                  title="No notifications"
                  description="You're all caught up."
                />
              ) : (
                <ul className="space-y-2">
                  {list.map((n) => (
                    <li
                      key={n.id}
                      className={`flex items-start justify-between gap-3 rounded-lg border border-border/60 px-3 py-3 ${
                        n.read ? "bg-muted/30" : "bg-muted/50"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{n.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{n.body}</p>
                        <p className="mt-1 text-[0.7rem] text-muted-foreground">
                          {format(parseISO(n.createdAt), "MMM d, HH:mm")}
                        </p>
                      </div>
                      {!n.read && (
                        <Button variant="outline" size="sm" onClick={markAsRead(n.id)}>
                          Mark read
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
            <TabsContent value="unread" className="mt-4">
              {unread.length === 0 ? (
                <EmptyState title="No unread notifications" description="You're all caught up." />
              ) : (
                <ul className="space-y-2">
                  {unread.map((n) => (
                    <li
                      key={n.id}
                      className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-muted/50 px-3 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{n.title}</p>
                        <p className="text-xs text-muted-foreground">{n.body}</p>
                        <p className="mt-1 text-[0.7rem] text-muted-foreground">
                          {format(parseISO(n.createdAt), "MMM d, HH:mm")}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={markAsRead(n.id)}>
                        Mark read
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
          </Tabs>
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
