import SidebarNav from "@/components/nav/SidebarNav";
import MobileNav from "@/components/nav/MobileNav";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-dashboard flex min-h-dvh flex-col md:flex-row">
      <MobileNav />
      <SidebarNav />
      <main className="flex-1 overflow-y-auto px-5 py-8 md:px-10 md:py-10">{children}</main>
    </div>
  );
}
