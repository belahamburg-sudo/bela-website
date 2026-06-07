import { requireAdmin } from "@/lib/admin";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { ToastProvider } from "@/components/admin/toast";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAdmin();

  return (
    <ToastProvider>
      <div className="admin-root flex min-h-screen bg-obsidian">
        <AdminSidebar email={user.email ?? "admin"} />
        <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </ToastProvider>
  );
}
