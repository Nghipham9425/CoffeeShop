import { ArrowRightToLine, Building2, Coffee, Eye, EyeOff, LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import { useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { GoogleSignInButton } from "../../../components/auth/GoogleSignInButton";
import { adminApi, adminAuth, type AdminUser } from "../../../lib/adminApi";

type AuthPageProps = {
  mode: "login" | "register";
  adminOnly?: boolean;
  redirectTo?: string;
};

const staffRoles = new Set(["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTANT", "MARKETING"]);

export function AuthPage({ mode, adminOnly = false, redirectTo = "/admin" }: AuthPageProps) {
  const navigate = useNavigate();
  const token = adminAuth.getToken();
  const user = adminAuth.getUser();
  const [email, setEmail] = useState(adminOnly ? "admin@phutaicoffee.vn" : "");
  const [password, setPassword] = useState(adminOnly ? "Admin@123" : "");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isBusiness, setIsBusiness] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const isLogin = mode === "login";

  if (isLogin && token && user) {
    return <Navigate to={staffRoles.has(user.role) ? redirectTo : "/"} replace />;
  }

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await adminApi.login(email, password);
      adminAuth.setSession(result.token, result.user);
      navigate(resolveRedirect(result.user, redirectTo), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể đăng nhập vào hệ thống.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await adminApi.register({ fullName, email, password, phone: phone || undefined });
      adminAuth.setSession(result.token, result.user);
      setMessage(isBusiness ? "Đã tạo tài khoản. Nhân viên sẽ liên hệ để xác minh hồ sơ B2B." : "Đăng ký thành công. Bạn có thể tiếp tục mua hàng.");
      window.setTimeout(() => navigate(resolveRedirect(result.user, redirectTo), { replace: true }), 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tạo tài khoản.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin(credential: string) {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await adminApi.googleLogin(credential);
      adminAuth.setSession(result.token, result.user);
      navigate(resolveRedirect(result.user, redirectTo), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể đăng nhập bằng Google.");
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleError(errorMessage: string) {
    setError("");
    setMessage("");
    setError(errorMessage);
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#dbeaf1] px-5 py-10 text-[#1f1f22]">
      <div className="pointer-events-none absolute -bottom-[52rem] left-1/2 h-[72rem] w-[72rem] -translate-x-1/2 rounded-full border border-white/70" />
      <div className="pointer-events-none absolute -bottom-[40rem] left-1/2 h-[56rem] w-[56rem] -translate-x-1/2 rounded-full border border-white/60" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-white/25 blur-3xl" />

      <Link to="/" className="absolute left-6 top-6 z-10 flex items-center gap-3 text-[#2d211d] md:left-10 md:top-8">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#2d211d] text-[#f0ddce] shadow-lg shadow-[#2d211d]/20">
          <Coffee size={23} />
        </span>
        <span>
          <span className="block text-lg font-black tracking-tight">Phú Tài</span>
          <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-[#6a554a]">Coffee Works</span>
        </span>
      </Link>

      <section className="relative z-10 w-full max-w-[460px] rounded-[28px] border border-white/80 bg-white/80 p-7 shadow-2xl shadow-[#6f8e9d]/20 backdrop-blur-md md:p-9">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-[24px] border border-white bg-white/90 text-[#553B2F] shadow-lg shadow-[#6f8e9d]/15">
          <ArrowRightToLine size={36} strokeWidth={1.8} />
        </div>

        <div className="mt-7 text-center">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#9c725d]">
            {adminOnly ? "Quản trị hệ thống" : isLogin ? "Tài khoản Phú Tài" : "Tạo tài khoản"}
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-[#211917]">
            {isLogin ? "Đăng nhập bằng email" : "Tạo tài khoản mới"}
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm font-semibold leading-6 text-[#7f8188]">
            {isLogin
              ? "Quản lý đơn hàng, báo giá và hồ sơ của bạn tại Phú Tài Coffee Works."
              : "Đăng ký để mua lẻ, gửi yêu cầu báo giá hoặc làm việc cùng đội ngũ Phú Tài."}
          </p>
        </div>

        <form onSubmit={isLogin ? handleLogin : handleRegister} className="mt-7 grid gap-3">
          {!isLogin ? (
            <>
              <Field icon={UserRound} value={fullName} onChange={setFullName} placeholder="Họ và tên" required />
              <Field icon={Phone} value={phone} onChange={setPhone} placeholder="Số điện thoại" required type="tel" />
              <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-[#f2f5f6] px-4 py-3 text-sm font-bold text-[#514c49]">
                <input checked={isBusiness} type="checkbox" onChange={(event) => setIsBusiness(event.target.checked)} className="h-4 w-4 accent-[#553B2F]" />
                <Building2 size={17} className="text-[#9c725d]" />
                Đăng ký tài khoản doanh nghiệp B2B
              </label>
            </>
          ) : null}

          <Field icon={Mail} value={email} onChange={setEmail} placeholder="Email" required type="email" autoComplete="email" />
          <Field
            icon={LockKeyhole}
            value={password}
            onChange={setPassword}
            placeholder="Mật khẩu"
            required
            type={showPassword ? "text" : "password"}
            autoComplete={isLogin ? "current-password" : "new-password"}
            endAdornment={
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="grid h-8 w-8 place-items-center rounded-md text-[#8a8e96] hover:bg-white hover:text-[#553B2F]" aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}>
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            }
          />

          {isLogin ? (
            <Link to="/quen-mat-khau" className="justify-self-end text-sm font-bold text-[#514c49] hover:text-[#553B2F] hover:underline">
              Quên mật khẩu?
            </Link>
          ) : null}

          {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p> : null}
          {message ? <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold leading-6 text-emerald-800">{message}</p> : null}

          <Button type="submit" disabled={loading} className="mt-2 h-12 rounded-xl bg-[#242126] text-base text-white shadow-lg shadow-[#242126]/20 hover:bg-[#553B2F]">
            {loading ? "Đang xử lý..." : isLogin ? "Đăng nhập" : "Tạo tài khoản"}
          </Button>
        </form>

        <div className="my-7 flex items-center gap-3 text-xs font-bold text-[#94969c]">
          <span className="h-px flex-1 bg-[#e3e7e9]" />
          Hoặc tiếp tục với
          <span className="h-px flex-1 bg-[#e3e7e9]" />
        </div>

        <div className="mx-auto w-full max-w-sm">
          <GoogleSignInButton disabled={loading} onCredential={handleGoogleLogin} onError={handleGoogleError} />
        </div>

        <p className="mt-7 text-center text-sm font-semibold text-[#6d7077]">
          {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
          <Link className="font-black text-[#553B2F] hover:underline" to={isLogin ? "/dang-ky" : "/dang-nhap"}>
            {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
          </Link>
        </p>
      </section>
    </main>
  );
}

function resolveRedirect(user: AdminUser, redirectTo: string) {
  return staffRoles.has(user.role) ? redirectTo : "/";
}

function Field({
  icon: Icon,
  value,
  onChange,
  endAdornment,
  ...props
}: {
  icon: typeof Mail;
  value: string;
  onChange: (value: string) => void;
  endAdornment?: ReactNode;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <label className="flex h-14 items-center gap-3 rounded-xl bg-[#f1f4f6] px-4 focus-within:ring-2 focus-within:ring-[#9c725d]/35">
      <Icon className="shrink-0 text-[#8d949d]" size={20} />
      <input
        {...props}
        className="h-full min-w-0 flex-1 bg-transparent text-sm font-bold text-[#2d2e31] outline-none placeholder:font-semibold placeholder:text-[#9298a1]"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {endAdornment}
    </label>
  );
}
