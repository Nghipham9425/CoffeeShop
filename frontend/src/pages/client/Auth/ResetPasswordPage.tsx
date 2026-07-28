import { CheckCircle2, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AuthShell } from "../../../components/auth/AuthShell";
import { Button } from "../../../components/ui/button";
import { adminApi } from "../../../lib/adminApi";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(token ? "" : "Liên kết đặt lại mật khẩu không hợp lệ.");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Liên kết đặt lại mật khẩu không hợp lệ.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Xác nhận mật khẩu chưa khớp.");
      return;
    }

    setLoading(true);
    try {
      const result = await adminApi.resetPassword({ token, newPassword, confirmPassword });
      setMessage(result.message);
      setNewPassword("");
      setConfirmPassword("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Không thể đặt lại mật khẩu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      icon={<LockKeyhole size={35} strokeWidth={1.8} />}
      eyebrow="Bảo mật tài khoản"
      title="Tạo mật khẩu mới"
      description="Mật khẩu cần có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và chữ số."
    >
      {message ? (
        <div className="mt-7 text-center">
          <CheckCircle2 className="mx-auto text-emerald-700" size={42} />
          <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold leading-6 text-emerald-800">{message}</p>
          <Button asChild className="mt-5 h-12 w-full rounded-xl bg-[#242126] text-base text-white hover:bg-[#553B2F]">
            <Link to="/dang-nhap">Đăng nhập ngay</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-7 grid gap-3">
          <PasswordField label="Mật khẩu mới" value={newPassword} onChange={setNewPassword} visible={showPassword} />
          <PasswordField label="Xác nhận mật khẩu mới" value={confirmPassword} onChange={setConfirmPassword} visible={showPassword} />

          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="flex items-center justify-end gap-2 text-sm font-bold text-[#514c49] hover:text-[#553B2F]"
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            {showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          </button>

          {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold leading-6 text-red-700">{error}</p> : null}

          <Button type="submit" disabled={loading || !token} className="mt-2 h-12 rounded-xl bg-[#242126] text-base text-white shadow-lg shadow-[#242126]/20 hover:bg-[#553B2F]">
            {loading ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  visible,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
}) {
  return (
    <label className="flex h-14 items-center gap-3 rounded-xl bg-[#f1f4f6] px-4 focus-within:ring-2 focus-within:ring-[#9c725d]/35">
      <LockKeyhole className="shrink-0 text-[#8d949d]" size={20} />
      <input
        className="h-full min-w-0 flex-1 bg-transparent text-sm font-bold text-[#2d2e31] outline-none placeholder:font-semibold placeholder:text-[#9298a1]"
        type={visible ? "text" : "password"}
        autoComplete="new-password"
        placeholder={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        minLength={8}
        required
      />
    </label>
  );
}
