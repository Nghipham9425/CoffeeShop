import { KeyRound, MapPin, Package, UserRound, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link, Navigate, NavLink } from "react-router-dom";
import { adminAuth } from "../../../lib/adminApi";

const navigation: Array<[string, string, LucideIcon]> = [
  ["Thông tin cá nhân", "/tai-khoan/thong-tin", UserRound],
  ["Sổ địa chỉ", "/tai-khoan/dia-chi", MapPin],
  ["Đổi mật khẩu", "/tai-khoan/doi-mat-khau", KeyRound],
];

export function AccountPageShell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  const user = adminAuth.getUser();
  if (!user) return <Navigate to="/dang-nhap" replace />;

  return <main className="bg-stone-50"><section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <div className="flex flex-col gap-5 border-b border-stone-200 pb-8 md:flex-row md:items-end md:justify-between">
      <div><p className="text-sm font-black uppercase tracking-[0.15em] text-[var(--roast)]">Tài khoản khách hàng</p><h1 className="mt-2 font-serif text-4xl font-black text-stone-950 md:text-5xl">{title}</h1><p className="mt-3 max-w-2xl text-stone-600">{description}</p></div>
      <Link to="/gio-hang" className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-4 text-sm font-bold text-stone-950 hover:bg-stone-100"><Package size={17} /> Giỏ hàng</Link>
    </div>
    <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
      <aside className="h-fit rounded-2xl border border-stone-200 bg-white p-3 shadow-sm"><div className="border-b border-stone-100 px-3 py-4"><p className="font-black text-stone-950">{user.fullName}</p><p className="mt-1 truncate text-sm text-stone-500">{user.email}</p></div><nav className="mt-2 grid gap-1">{navigation.map(([label, href, Icon]) => <NavLink key={href as string} to={href as string} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${isActive ? "bg-[#342018] text-white" : "text-stone-700 hover:bg-stone-100"}`}><Icon size={18} />{label}</NavLink>)}</nav></aside>
      <div>{children}</div>
    </div>
  </section></main>;
}

export function Alert({ tone, children }: { tone: "error" | "success"; children: ReactNode }) { return <p className={`mb-5 rounded-xl border px-4 py-3 text-sm font-semibold ${tone === "error" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{children}</p>; }
