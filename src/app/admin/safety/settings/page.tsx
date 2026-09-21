import { redirect } from "next/navigation";

/** Safety Settings is hidden — the backend exposes no settings API. */
export default function AdminSafetySettingsPage() {
  redirect("/admin/safety");
}
