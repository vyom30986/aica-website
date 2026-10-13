import { adminConfigured, isAdmin } from "@/lib/admin-auth";
import { listLeads, storageMode } from "@/lib/leads";
import { Dashboard, Login } from "./ui";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!adminConfigured()) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24">
        <h1 className="text-2xl font-semibold">Leads dashboard is locked</h1>
        <p className="mt-3 text-muted">
          Set the <code className="rounded bg-white px-1.5 py-0.5">ADMIN_PASSWORD</code> environment variable to turn on the dashboard.
        </p>
      </div>
    );
  }
  if (!(await isAdmin())) return <Login />;
  const leads = await listLeads();
  return <Dashboard initial={leads} storage={storageMode()} emailAlerts={Boolean(process.env.RESEND_API_KEY && process.env.LEAD_NOTIFY_TO)} />;
}
