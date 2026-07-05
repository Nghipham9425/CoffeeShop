import { Coffee, Home } from "lucide-react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AdminAuthCard } from "../../../components/admin/AdminAuthCard";
import { Button } from "../../../components/ui/button";
import { adminAuth, type AdminUser } from "../../../lib/adminApi";

type LoginLocationState = {
  from?: string;
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = adminAuth.getToken();
  const user = adminAuth.getUser();
  const state = location.state as LoginLocationState | null;
  const from = state?.from && state.from !== "/admin/dang-nhap" ? state.from : "/admin";

  if (token && user) {
    return <Navigate to="/admin" replace />;
  }

  function handleLogin(nextToken: string, nextUser: AdminUser) {
    adminAuth.setSession(nextToken, nextUser);
    navigate(from, { replace: true });
  }

  return (
    <main className="min-h-screen bg-[#f8f2ed] px-4 py-10 text-[#553B2F]">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-2xl border border-[#E8D3C7] bg-white shadow-sm lg:grid-cols-[0.9fr_1.1fr]">
          <div className="bg-[#553B2F] p-8 text-white md:p-10">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#E8D3C7] text-[#553B2F]">
                <Coffee size={26} />
              </span>
              <div>
                <p className="text-lg font-black">Phú Tài Coffee Works</p>
                <p className="text-sm font-semibold text-[#E8D3C7]">Trang quản trị nhà máy</p>
              </div>
            </div>

            <h1 className="mt-12 text-4xl font-black leading-tight md:text-5xl">Đăng nhập quản trị</h1>
            <p className="mt-4 max-w-md text-sm font-semibold leading-7 text-[#E8D3C7]">
              Khu vực dành cho nhân sự quản trị, bán hàng, kho và marketing. Sau này có thể dùng chung form với khách hàng,
              sau đó phân quyền theo vai trò tài khoản.
            </p>

            <Button asChild variant="outline" className="mt-8 rounded-lg border-[#C7A792] bg-transparent text-white hover:bg-[#AA7864]">
              <Link to="/">
                <Home size={16} />
                Về website
              </Link>
            </Button>
          </div>

          <div className="flex items-center p-6 md:p-10">
            <div className="w-full">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#AA7864]">Admin access</p>
              <h2 className="mt-2 text-3xl font-black text-[#553B2F]">Chào mừng quay lại</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#7a5547]">
                Dùng tài khoản seed để kiểm thử giao diện quản trị trong giai đoạn đồ án.
              </p>
              <div className="mt-6">
                <AdminAuthCard onLogin={handleLogin} compact />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
