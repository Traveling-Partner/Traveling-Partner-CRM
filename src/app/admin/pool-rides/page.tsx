import { redirect } from "next/navigation";

/** Ride Management uses live GET /api/rides. Mock pool-rides must not render. */
export default function PoolRidesRedirectPage() {
  redirect("/admin/rides");
}
