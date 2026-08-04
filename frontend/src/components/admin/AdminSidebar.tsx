import { LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";
import { adminNavItems } from "../../data/admin";
import { type StaffRole } from "../../data/adminPermissions";
import { cn } from "../../lib/utils";
import { type AdminUser } from "../../lib/adminApi";
import { Button } from "../ui/button";

export function AdminSidebar({
  user,
  onLogout,
}: {
  user: AdminUser | null;
  onLogout: () => void;
}) {
  const role = user?.role as StaffRole | undefined;
  const visibleNavItems = adminNavItems.filter((item) => role && item.roles.includes(role));

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-[#342018] bg-[#3b2419] text-white lg:flex lg:flex-col">
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
        <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg border border-white/10 bg-[#f6ece4]">
          <img src="/images/brand/logo-phu-tai.png" alt="Phú Tài Coffee Works" className="h-12 w-12 object-contain" />
        </span>
        <div>
          <p className="text-sm font-black uppercase tracking-wide">Phú Tài</p>
          <p className="text-xs font-semibold text-[#dfb48c]">Coffee Works Admin</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-bold text-[#ead8ca] transition hover:bg-white/10 hover:text-white",
                isActive && "bg-[#f4e5d8] text-[#43271b] shadow-sm hover:bg-[#f4e5d8] hover:text-[#43271b]",
              )
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 rounded-lg bg-white/10 p-3">
          <p className="text-xs font-semibold text-[#ead8ca]">Đăng nhập</p>
          <p className="mt-1 text-sm font-black">{user?.fullName ?? "Chưa đăng nhập"}</p>
        </div>
        <Button
          className="w-full rounded-lg border border-[#b98a6d] bg-transparent text-white hover:bg-white/10"
          variant="ghost"
          onClick={onLogout}
        >
          <LogOut size={16} />
          Đăng xuất
        </Button>
      </div>
    </aside>
  );
}
