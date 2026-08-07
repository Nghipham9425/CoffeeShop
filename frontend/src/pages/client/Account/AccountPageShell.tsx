import { Building2, FileCheck2, FileText, Landmark, MapPin, Package, UserRound, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link, Navigate, NavLink, useNavigate } from "react-router-dom";
import { adminAuth } from "../../../lib/adminApi";
import { Button } from "../../../components/ui/button";

const navigation: Array<[string, string, LucideIcon]> = [
  ["Thông tin cá nhân", "/tai-khoan/thong-tin", UserRound],
  ["Lịch sử đơn hàng", "/tai-khoan/don-hang", Package],
  ["Sổ địa chỉ", "/tai-khoan/dia-chi", MapPin],
  ["Tổng quan doanh nghiệp", "/tai-khoan/b2b", Building2],
  ["Báo giá doanh nghiệp", "/tai-khoan/b2b/bao-gia", FileText],
  ["Hợp đồng doanh nghiệp", "/tai-khoan/b2b/hop-dong", FileCheck2],
  ["Hóa đơn và công nợ", "/tai-khoan/b2b/cong-no", Landmark],
];

export function AccountPageShell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  const user = adminAuth.getUser();
  const navigate = useNavigate();

  function handleLogout() {
    adminAuth.clearSession();
    navigate("/dang-nhap", { replace: true });
  }

  if (!user) return <Navigate to="/dang-nhap" replace />;

  return <main className="bg-stone-50"><section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <div className="flex flex-col gap-5 border-b border-stone-200 pb-8 md:flex-row md:items-end md:justify-between">
      <div><p className="text-sm font-black uppercase tracking-[0.15em] text-(--roast)">Tài khoản khách hàng</p><h1 className="mt-2 font-serif text-4xl font-black text-stone-950 md:text-5xl">{title}</h1><p className="mt-3 max-w-2xl text-stone-600">{description}</p></div>
      <div className="flex flex-wrap items-center gap-2">
        <Link to="/gio-hang" className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-4 text-sm font-bold text-stone-950 hover:bg-stone-100"><Package size={17} /> Giỏ hàng</Link>
        <Button type="button" variant="outline" className="h-10 rounded-full border-stone-200 px-4 text-sm font-bold text-rose-700 hover:bg-rose-50" onClick={handleLogout}>
          <UserRound size={17} /> Đăng xuất
        </Button>
      </div>
    </div>
    <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
      <aside className="h-fit rounded-2xl border border-stone-200 bg-white p-3 shadow-sm"><div className="border-b border-stone-100 px-3 py-4"><p className="font-black text-stone-950">{user.fullName}</p><p className="mt-1 truncate text-sm text-stone-500">{user.email}</p></div><nav className="mt-2 grid gap-1">{navigation.map(([label, href, Icon]) => <NavLink key={href} to={href} style={({ isActive }) => isActive ? { color: "#ffffff" } : undefined} className={({ isActive }) => isActive ? "flex items-center gap-3 rounded-xl bg-[#342018] px-3 py-3 text-sm font-bold transition hover:bg-[#21130f]" : "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-stone-700 transition hover:bg-stone-100"}><Icon size={18} />{label}</NavLink>)}</nav></aside>
      <div>{children}</div>
    </div>
  </section></main>;
}

export function Alert({ tone, children }: { tone: "error" | "success"; children: ReactNode }) { return <p className={`mb-5 rounded-xl border px-4 py-3 text-sm font-semibold ${tone === "error" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{children}</p>; }
