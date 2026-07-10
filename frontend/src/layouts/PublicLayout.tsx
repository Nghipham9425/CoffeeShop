import { Clock3, Leaf, MapPin, Menu, Phone, ShoppingCart } from "lucide-react";
import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";
import { NavLink, Outlet } from "react-router-dom";
import { useCart } from "../contexts/CartContext";

const navItems = [
  ["Trang chủ", "/"],
  ["Giới thiệu", "/ve-nha-may"],
  ["Dịch vụ", "/dich-vu"],
  ["Sản phẩm", "/san-pham"],
  ["Giỏ hàng", "/gio-hang"],
  ["Báo giá cà phê", "/bao-gia"],
  ["Liên hệ", "/lien-he"],
];

const socials = [
  ["Facebook", FaFacebookF],
  ["Instagram", FaInstagram],
  ["TikTok", FaTiktok],
  ["YouTube", FaYoutube],
];

export function PublicLayout() {
  const { itemCount } = useCart();

  return (
    <div className="min-h-screen bg-white text-[var(--ink)]">
      <header className="bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-8 px-6 py-5 lg:px-10">
          <NavLink to="/" className="flex items-center gap-4">
            <div className="brand-mark">
              <span className="brand-cafe">CAFÉ</span>
              <span className="brand-cup" />
              <span className="brand-bean brand-bean-one" />
              <span className="brand-bean brand-bean-two" />
              <Leaf className="brand-leaf brand-leaf-top" size={18} strokeWidth={2} />
              <Leaf className="brand-leaf brand-leaf-side" size={20} strokeWidth={2} />
            </div>
            <div className="leading-tight">
              <p className="text-2xl font-black uppercase">Phú Tài Coffee Works</p>
              <p className="text-sm font-bold uppercase text-stone-500">Nhà máy cà phê B2B</p>
            </div>
          </NavLink>

          <div className="hidden items-center gap-9 xl:flex">
            <InfoItem icon={Clock3} label="Giờ làm việc:" value="8.00 - 20.00" />
            <InfoItem icon={Phone} label="Điện thoại:" value="0886.33.25.33" />
            <InfoItem icon={MapPin} label="Địa chỉ:" value="KCN Tân Bình, TP. Hồ Chí Minh" wide />
          </div>
        </div>

        <div className="mx-auto max-w-[1500px] border-t border-stone-200 px-6 lg:px-10">
          <div className="flex h-16 items-center justify-between">
            <nav className="hidden h-full items-center gap-7 lg:flex">
              {navItems.map(([label, href]) => (
                <NavLink
                  key={href}
                  to={href}
                  className={({ isActive }) => `hm-nav-link ${isActive ? "hm-nav-link-active" : ""}`}
                >
                  {label}
                </NavLink>
              ))}
            </nav>

            <button className="grid h-11 w-11 place-items-center border border-stone-300 lg:hidden" aria-label="Menu">
              <Menu size={22} />
            </button>

            <div className="ml-auto flex items-center gap-4 text-stone-950">
              <NavLink
                to="/gio-hang"
                className="relative grid h-10 w-10 place-items-center rounded-full border border-stone-200 hover:bg-stone-100"
                aria-label="Giỏ hàng"
              >
                <ShoppingCart size={20} />
                {itemCount ? (
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--coffee)] px-1 text-xs font-black text-white">
                    {itemCount}
                  </span>
                ) : null}
              </NavLink>
              {socials.map(([label, Icon]) => (
                <a key={label as string} href="#" aria-label={label as string} className="social-icon">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </header>

      <Outlet />

      <footer className="border-t border-stone-200 bg-[#151515] text-white">
        <div className="mx-auto grid max-w-[1280px] gap-10 px-6 py-12 md:grid-cols-[1.1fr_1fr_0.8fr] lg:px-10">
          <div>
            <p className="hm-heading text-3xl uppercase">Phú Tài Coffee Works</p>
            <p className="mt-4 max-w-md leading-7 text-white/70">
              Nhà máy rang xay, gia công và đóng gói cà phê cho quán, đại lý, doanh nghiệp F&B và thương hiệu riêng.
            </p>
          </div>
          <div>
            <p className="text-lg font-black uppercase">Liên hệ</p>
            <p className="mt-4 leading-8 text-white/70">
              Email: sales@phutaicoffee.vn<br />
              Hotline: 0886.33.25.33<br />
              Thời gian: 8.00 - 20.00
            </p>
          </div>
          <div>
            <p className="text-lg font-black uppercase">Dịch vụ chính</p>
            <p className="mt-4 leading-8 text-white/70">
              Gia công cà phê hạt rang<br />
              Gia công cà phê hòa tan<br />
              OEM / Private Label
            </p>
          </div>
        </div>
        <div className="bg-[var(--coffee)] py-4 text-center text-sm text-white/70">
          Copyright 2026 © Phú Tài Coffee Works
        </div>
      </footer>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
  wide,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 ${wide ? "max-w-[420px]" : ""}`}>
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-stone-800">
        <Icon size={25} strokeWidth={1.7} />
      </span>
      <span>
        <span className="block text-sm font-bold uppercase text-stone-700">{label}</span>
        <span className="block text-xl font-semibold text-stone-600">{value}</span>
      </span>
    </div>
  );
}
