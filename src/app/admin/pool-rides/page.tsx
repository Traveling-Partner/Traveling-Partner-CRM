import { redirect } from "next/navigation";

/** Ride Management uses live GET /api/rides/portal/getAll. */
export default function PoolRidesRedirectPage() {
  redirect("/admin/rides");
}
