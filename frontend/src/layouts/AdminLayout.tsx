import { Coffee, LogOut } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const adminNav = ["Dashboard", "Sản phẩm", "Khách hàng", "Đơn hàng", "Báo giá", "Công nợ", "Ticket"];

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-stone-100 text-stone-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-stone-200 bg-white p-5 lg:block">
        <NavLink to="/" className="mb-8 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--coffee)] text-white">
            <Coffee size={22} />
          </span>
          <span className="font-black">Phú Tài Admin</span>
        </NavLink>
        <nav className="space-y-1">
          {adminNav.map((item) => (
            <a key={item} className="block rounded-xl px-3 py-2 text-sm font-bold text-stone-700 hover:bg-stone-100" href="#">
              {item}
            </a>
          ))}
        </nav>
        <button className="absolute bottom-5 left-5 right-5 flex items-center justify-center gap-2 rounded-xl border border-stone-200 px-3 py-2 text-sm font-bold">
          <LogOut size={16} />
          Đăng xuất
        </button>
      </aside>
      <main className="lg:pl-64">
        <Outlet />
      </main>
    </div>
  );
}
