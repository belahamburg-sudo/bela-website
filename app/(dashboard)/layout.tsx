export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-obsidian">
      {/* DashboardSidebar added in Plan 02 */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
