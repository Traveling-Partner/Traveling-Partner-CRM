import { redirect } from "next/navigation";

/** Ride Management uses live GET /api/rides/{id}. Mock pool-rides must not render. */
export default function PoolRideDetailRedirectPage({
  params
}: {
  params: { id: string };
}) {
  const id = params.id?.trim() ?? "";
  if (/^\d+$/.test(id)) {
    redirect(`/admin/rides/${id}`);
  }
  redirect("/admin/rides");
}
