import { ArrowLeft, KeyRound, Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AuthShell } from "../../../components/auth/AuthShell";
import { Button } from "../../../components/ui/button";
import { adminApi } from "../../../lib/adminApi";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const result = await adminApi.forgotPassword(email);
      setMessage(result.message);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Không thể gửi yêu cầu đặt lại mật khẩu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      icon={<KeyRound size={35} strokeWidth={1.8} />}
      eyebrow="Khôi phục tài khoản"
      title="Quên mật khẩu?"
      description="Nhập email đã đăng ký. Chúng tôi sẽ gửi cho bạn một liên kết bảo mật để tạo mật khẩu mới."
    >
      <form onSubmit={handleSubmit} className="mt-7 grid gap-4">
        <label className="flex h-14 items-center gap-3 rounded-xl bg-[#f1f4f6] px-4 focus-within:ring-2 focus-within:ring-[#9c725d]/35">
          <Mail className="shrink-0 text-[#8d949d]" size={20} />
          <input
            className="h-full min-w-0 flex-1 bg-transparent text-sm font-bold text-[#2d2e31] outline-none placeholder:font-semibold placeholder:text-[#9298a1]"
            type="email"
            autoComplete="email"
            placeholder="Email đã đăng ký"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p> : null}
        {message ? <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold leading-6 text-emerald-800">{message}</p> : null}

        <Button type="submit" disabled={loading} className="h-12 rounded-xl bg-[#242126] text-base text-white shadow-lg shadow-[#242126]/20 hover:bg-[#553B2F]">
          {loading ? "Đang gửi email..." : "Gửi liên kết đặt lại"}
        </Button>
      </form>

      <Link to="/dang-nhap" className="mt-6 flex items-center justify-center gap-2 text-sm font-black text-[#553B2F] hover:underline">
        <ArrowLeft size={17} />
        Quay lại đăng nhập
      </Link>
    </AuthShell>
  );
}
