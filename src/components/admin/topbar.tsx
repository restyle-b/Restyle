import { MobileNav } from "@/components/admin/mobile-nav";
import { NotificationsMenu } from "@/components/admin/notifications-menu";
import { ProfileMenu } from "@/components/admin/profile-menu";
import { getDashboardStats } from "@/server/actions/admin/dashboard";

export async function Topbar({ email }: { email: string }) {
  const stats = await getDashboardStats();

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-line-dark bg-ink/95 px-4 backdrop-blur sm:px-6">
      <MobileNav />
      <div className="flex items-center gap-2">
        <NotificationsMenu pendingOrders={stats.pendingOrders} pendingEnrollments={stats.pendingEnrollments} />
        <ProfileMenu email={email} />
      </div>
    </header>
  );
}
