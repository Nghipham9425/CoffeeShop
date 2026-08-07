import { Bell, Building2, CheckCheck, Clock3, LogIn, LogOut, MapPin, Menu, Package, PackageSearch, Phone, ShoppingCart, UserRound, X } from "lucide-react";
import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";
import { NavLink, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import CustomerChatbot from "../components/Chatbot/CustomerChatbot";
import { useCart } from "../contexts/CartContext";
import { adminAuth } from "../lib/adminApi";
import { profileApi, type UserNotification } from "../lib/profileApi";

const navItems = [
  ["Trang chủ", "/"],
  ["Về nhà máy", "/ve-nha-may"],
  ["Sản phẩm", "/san-pham"],
  ["Báo giá", "/bao-gia"],
] as const;

const socials = [
  ["Facebook", "https://www.facebook.com/", FaFacebookF],
  ["Instagram", "https://www.instagram.com/", FaInstagram],
  ["TikTok", "https://www.tiktok.com/", FaTiktok],
  ["YouTube", "https://www.youtube.com/", FaYoutube],
] as const;

export function PublicLayout() {
  const { itemCount } = useCart();
  const user = adminAuth.getUser();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showFloatingSocials, setShowFloatingSocials] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowFloatingSocials(window.scrollY > 180);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    let alive = true;
    const loadNotifications = async () => {
      try {
        const result = await profileApi.notifications();
        if (!alive) return;
        setNotifications(result.items);
        setUnreadCount(result.unreadCount);
      } catch {
        // Không để lỗi thông báo làm gián đoạn website công khai.
      }
    };

    void loadNotifications();
    const timer = window.setInterval(loadNotifications, 60_000);
    return () => { alive = false; window.clearInterval(timer); };
  }, [user?.id]);

  async function markNotificationRead(notification: UserNotification) {
    if (notification.isRead) return;
    try {
      await profileApi.markNotificationRead(notification.id);
      setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, isRead: true } : item));
      setUnreadCount((current) => Math.max(0, current - 1));
    } catch {
      // Liên kết thông báo vẫn sử dụng được nếu API đánh dấu đã đọc tạm thời lỗi.
    }
  }

  async function markAllNotificationsRead() {
    try {
      await profileApi.markAllNotificationsRead();
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Giữ nguyên trạng thái để người dùng có thể thử lại.
    }
  }

  function handleLogout() {
    adminAuth.clearSession();
    setIsMenuOpen(false);
    window.location.assign("/");
  }

  return (
    <div className="min-h-screen bg-white text-(--ink)">
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-375 items-center justify-between gap-5 px-4 py-3 sm:px-6 lg:px-10">
          <NavLink to="/" onClick={() => setIsMenuOpen(false)} className="flex min-w-0 items-center gap-3">
            <div className="grid h-14 w-17.5 shrink-0 place-items-center overflow-hidden sm:h-16 sm:w-20">
              <img src="/images/brand/logo-phu-tai.png" alt="Phú Tài Coffee Works" className="h-20 w-20 scale-[1.3] object-contain" />
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-base font-black uppercase text-[#3a2116] sm:text-xl">Phú Tài Coffee Works</p>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#9a6c4e] sm:text-xs">Nhà máy cà phê B2B</p>
            </div>
          </NavLink>

          <div className="hidden items-center gap-7 xl:flex">
            <InfoItem icon={Clock3} label="Giờ làm việc" value="08:00 - 20:00" />
            <InfoItem icon={Phone} label="Điện thoại" value="0886 332 533" />
            <InfoItem icon={MapPin} label="Địa chỉ" value="KCN Tân Bình, TP. Hồ Chí Minh" wide />
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <HeaderActions compact itemCount={itemCount} user={user} notifications={notifications} unreadCount={unreadCount} onRead={markNotificationRead} onReadAll={markAllNotificationsRead} />
            <button type="button" onClick={() => setIsMenuOpen((current) => !current)} className="grid h-10 w-10 place-items-center rounded-xl border border-stone-200 text-stone-800 hover:bg-stone-100" aria-label={isMenuOpen ? "Đóng menu" : "Mở menu"}>{isMenuOpen ? <X size={20} /> : <Menu size={21} />}</button>
          </div>
        </div>

        <div className="mx-auto hidden max-w-375 border-t border-stone-200 px-6 lg:block lg:px-10">
          <div className="flex h-14 items-center justify-between">
            <nav className="flex h-full items-center gap-6">{navItems.map(([label, href]) => <NavLink key={href} to={href} className={({ isActive }) => `hm-nav-link ${isActive ? "hm-nav-link-active" : ""}`}>{label}</NavLink>)}</nav>
            <HeaderActions itemCount={itemCount} user={user} notifications={notifications} unreadCount={unreadCount} onRead={markNotificationRead} onReadAll={markAllNotificationsRead} />
          </div>
        </div>

        {isMenuOpen ? <div className="border-t border-stone-200 bg-white px-4 py-4 lg:hidden"><nav className="grid gap-1">{navItems.map(([label, href]) => <NavLink key={href} to={href} onClick={() => setIsMenuOpen(false)} className={({ isActive }) => `rounded-lg px-4 py-3 text-sm font-black ${isActive ? "bg-[#f5ebdf] text-[#4b2418]" : "text-stone-700 hover:bg-stone-100"}`}>{label}</NavLink>)}</nav><div className="mt-3 grid gap-2 border-t border-stone-100 pt-3"><NavLink to="/tra-cuu-don-hang" onClick={() => setIsMenuOpen(false)} className="rounded-lg px-4 py-3 text-sm font-bold text-stone-700 hover:bg-stone-100">Tra cứu đơn hàng</NavLink>{user ? <><NavLink to="/tai-khoan/thong-tin" onClick={() => setIsMenuOpen(false)} className="rounded-lg px-4 py-3 text-sm font-bold text-stone-700 hover:bg-stone-100">Tài khoản của tôi</NavLink><button type="button" onClick={handleLogout} className="flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-bold text-red-700 hover:bg-red-50"><LogOut size={16} /> Đăng xuất</button></> : <NavLink to="/dang-nhap" onClick={() => setIsMenuOpen(false)} className="rounded-lg px-4 py-3 text-sm font-bold text-stone-700 hover:bg-stone-100">Đăng nhập</NavLink>}</div></div> : null}
      </header>

      <Outlet />

      <footer className="mt-auto border-t border-[#dcc6b1] bg-[#f1e3d6] text-[#3b2419]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 border-b border-[#d7bdab] pb-10 md:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-3"><div className="grid h-16 w-16 place-items-center overflow-hidden"><img src="/images/brand/logo-phu-tai.png" alt="Phú Tài Coffee Works" className="h-20 w-20 scale-[1.35] object-contain" /></div><div><p className="text-lg font-black uppercase">Phú Tài Coffee Works</p><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#a56842]">Coffee factory</p></div></div>
              <p className="mt-5 max-w-sm text-sm leading-7 text-[#674938]">Nhà máy rang xay, cung ứng và gia công cà phê cho quán, đại lý, doanh nghiệp F&B và thương hiệu riêng.</p>
            </div>
            <FooterColumn title="Khám phá" links={[["Về nhà máy", "/ve-nha-may"], ["Sản phẩm", "/san-pham"], ["Báo giá doanh nghiệp", "/bao-gia"], ["Tra cứu đơn hàng", "/tra-cuu-don-hang"]]} />
            <FooterColumn title="Dịch vụ" links={[["Cà phê hạt rang", "/san-pham"], ["Cung ứng cho quán", "/bao-gia"], ["Gia công OEM / Private Label", "/bao-gia"], ["Tư vấn blend và quy cách", "/bao-gia"]]} />
            <div><p className="text-sm font-black uppercase tracking-[0.12em] text-[#8b583a]">Liên hệ</p><div className="mt-4 space-y-3 text-sm leading-6 text-[#674938]"><p><span className="block text-xs font-black uppercase text-[#9a7c68]">Hotline</span>0886 332 533</p><p><span className="block text-xs font-black uppercase text-[#9a7c68]">Email</span>sales@phutaicoffee.vn</p><p><span className="block text-xs font-black uppercase text-[#9a7c68]">Địa chỉ</span>KCN Tân Bình, TP. Hồ Chí Minh</p></div></div>
          </div>
          <div className="flex flex-col gap-2 pt-5 text-xs font-medium text-[#806556] sm:flex-row sm:items-center sm:justify-between"><p>© 2026 Phú Tài Coffee Works. All rights reserved.</p><p>Rang xay · Gia công · Cung ứng cà phê</p></div>
        </div>
      </footer>
      <FloatingSocialLinks visible={showFloatingSocials} />
      <CustomerChatbot />
    </div>
  );
}

function HeaderActions({ itemCount, user, notifications, unreadCount, onRead, onReadAll, compact = false }: { itemCount: number; user: ReturnType<typeof adminAuth.getUser>; notifications: UserNotification[]; unreadCount: number; onRead: (notification: UserNotification) => Promise<void>; onReadAll: () => Promise<void>; compact?: boolean }) {
  return <div className="flex items-center gap-2 text-stone-950">
    {user ? <div className="group relative hidden md:block"><button type="button" aria-label="Thông báo" className="relative grid h-10 w-10 place-items-center rounded-full border border-stone-200 transition-colors hover:bg-stone-100"><Bell size={19} />{unreadCount ? <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#4b2418] px-1 text-[10px] font-black text-white">{unreadCount > 9 ? "9+" : unreadCount}</span> : null}</button><div className="invisible absolute right-0 top-full z-30 mt-2 w-80 translate-y-1 rounded-xl border border-stone-200 bg-white p-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100"><div className="flex items-center justify-between px-3 py-2"><p className="font-black text-stone-950">Thông báo</p>{unreadCount ? <button type="button" onClick={() => void onReadAll()} className="flex items-center gap-1 text-xs font-bold text-[#4b2418] hover:underline"><CheckCheck size={14} /> Đã đọc tất cả</button> : null}</div><div className="max-h-80 overflow-y-auto border-t border-stone-100">{notifications.length ? notifications.map((notification) => <NavLink key={notification.id} to={notification.link ?? "/tai-khoan/don-hang"} onClick={() => void onRead(notification)} className={`block border-b border-stone-100 px-3 py-3 transition-colors hover:bg-stone-50 ${notification.isRead ? "" : "bg-[#fff8f1]"}`}><p className="text-sm font-black text-stone-950">{notification.title}</p><p className="mt-1 text-xs leading-5 text-stone-600">{notification.content}</p></NavLink>) : <p className="px-3 py-7 text-center text-sm font-medium text-stone-500">Chưa có thông báo mới.</p>}</div></div></div> : null}
    {!compact && (user ? <div className="group relative hidden md:block"><NavLink to="/tai-khoan/thong-tin" className="flex h-10 items-center gap-2 rounded-full border border-stone-200 px-4 text-sm font-black transition-colors hover:bg-stone-100"><UserRound size={17} /> Tài khoản</NavLink><div className="invisible absolute right-0 top-full z-30 mt-2 w-60 translate-y-1 rounded-xl border border-stone-200 bg-white p-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100"><NavLink to="/tai-khoan/thong-tin" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-stone-700 hover:bg-stone-100 hover:text-[#4b2418]"><UserRound size={17} /> Thông tin khách hàng</NavLink><NavLink to="/tai-khoan/dia-chi" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-stone-700 hover:bg-stone-100 hover:text-[#4b2418]"><MapPin size={17} /> Sổ địa chỉ</NavLink><NavLink to="/tai-khoan/don-hang" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-stone-700 hover:bg-stone-100 hover:text-[#4b2418]"><Package size={17} /> Lịch sử đơn hàng</NavLink><NavLink to="/tai-khoan/b2b" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-stone-700 hover:bg-stone-100 hover:text-[#4b2418]"><Building2 size={17} /> Khu vực doanh nghiệp</NavLink><div className="my-1 border-t border-stone-100" /><button type="button" onClick={() => { adminAuth.clearSession(); window.location.assign("/"); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-bold text-red-700 hover:bg-red-50"><LogOut size={17} /> Đăng xuất</button></div></div> : <NavLink to="/dang-nhap" className="hidden h-10 items-center gap-2 rounded-full border border-stone-200 px-4 text-sm font-black hover:bg-stone-100 md:flex"><LogIn size={17} /> Đăng nhập</NavLink>)}
    {!compact && <NavLink to="/tra-cuu-don-hang" className="hidden h-10 items-center gap-2 rounded-full border border-stone-200 px-4 text-sm font-black hover:bg-stone-100 md:flex"><PackageSearch size={17} /> Tra cứu đơn</NavLink>}
    <NavLink to="/gio-hang" className="relative grid h-10 w-10 place-items-center rounded-full border border-stone-200 hover:bg-stone-100" aria-label="Giỏ hàng"><ShoppingCart size={20} />{itemCount ? <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#4b2418] px-1 text-xs font-black text-white">{itemCount}</span> : null}</NavLink>
  </div>;
}

function FooterColumn({ title, links }: { title: string; links: Array<readonly [string, string]> }) {
  return <div><p className="text-sm font-black uppercase tracking-[0.12em] text-[#8b583a]">{title}</p><nav className="mt-4 grid gap-3">{links.map(([label, href]) => <NavLink key={label} to={href} className="text-sm text-[#674938] transition-colors hover:text-[#9d5f3c]">{label}</NavLink>)}</nav></div>;
}

function FloatingSocialLinks({ visible }: { visible: boolean }) {
  return <aside className={`fixed left-4 top-1/2 z-30 -translate-y-1/2 transition-all duration-300 sm:left-6 ${visible ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-5 opacity-0"}`} aria-label="Mạng xã hội">
    <div className="flex flex-col overflow-hidden rounded-full border border-[#decbbb] bg-white/95 p-1.5 shadow-lg backdrop-blur">
      {socials.map(([label, href, Icon]) => <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="grid h-9 w-9 place-items-center rounded-full text-[#684230] transition hover:bg-[#5b3322] hover:text-white"><Icon size={16} /></a>)}
    </div>
  </aside>;
}

function InfoItem({ icon: Icon, label, value, wide }: { icon: typeof Clock3; label: string; value: string; wide?: boolean }) {
  return <div className={`flex items-center gap-3 ${wide ? "max-w-97.5" : ""}`}><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-stone-300 text-[#70422e]"><Icon size={20} strokeWidth={1.8} /></span><span><span className="block text-[10px] font-black uppercase tracking-wide text-stone-500">{label}</span><span className="block text-sm font-bold text-stone-700">{value}</span></span></div>;
}
