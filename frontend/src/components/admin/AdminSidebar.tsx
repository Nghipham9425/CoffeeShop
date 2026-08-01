import { Coffee, LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";
import { adminNavItems } from "../../data/admin";
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
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-[#3c271f] bg-[#553B2F] text-white lg:flex lg:flex-col">
      <div className="flex h-20 items-center gap-3 border-b border-white/12 px-6">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#E8D3C7] text-[#553B2F]">
          <Coffee size={23} />
        </span>
        <div>
          <p className="text-sm font-black uppercase tracking-wide">Phú Tài</p>
          <p className="text-xs font-semibold text-[#E8D3C7]">Coffee Works Admin</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {adminNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-bold text-[#E8D3C7] transition hover:bg-[#AA7864] hover:text-white",
                isActive && "bg-[#E8D3C7] text-[#553B2F] shadow-sm hover:bg-[#E8D3C7] hover:text-[#553B2F]",
              )
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/12 p-4">
        <div className="mb-3 rounded-lg bg-white/10 p-3">
          <p className="text-xs font-semibold text-[#E8D3C7]">Đăng nhập</p>
          <p className="mt-1 text-sm font-black">{user?.fullName ?? "Chưa đăng nhập"}</p>
        </div>
        <Button
          className="w-full rounded-lg border border-[#C7A792] bg-transparent text-white hover:bg-[#AA7864]"
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
