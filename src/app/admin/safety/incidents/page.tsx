import { redirect } from "next/navigation";

/** The incidents list lives on the Safety Center overview — this route only redirects. */
export default function AdminSafetyIncidentsPage() {
  redirect("/admin/safety");
}
