import { useState, type FormEvent } from "react";
import { KeyRound } from "lucide-react";
import { adminApi, type AdminUser } from "../../lib/adminApi";
import { Button } from "../ui/button";

export function AdminAuthCard({
  onLogin,
  compact = false,
}: {
  onLogin: (token: string, user: AdminUser) => void;
  compact?: boolean;
}) {
  const [email, setEmail] = useState("admin@phutaicoffee.vn");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await adminApi.login(email, password);
      onLogin(result.token, result.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không đăng nhập được");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-[#E8D3C7] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#553B2F] text-white">
          <KeyRound size={18} />
        </span>
        <div>
          <p className="font-black text-[#553B2F]">Đăng nhập admin</p>
          {!compact ? <p className="text-sm font-semibold text-[#AA7864]">Dùng tài khoản seed để xem dữ liệu bảo vệ.</p> : null}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <input
          className="h-10 rounded-lg border border-[#E8D3C7] px-3 text-sm font-semibold outline-none focus:border-[#553B2F]"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
        />
        <input
          className="h-10 rounded-lg border border-[#E8D3C7] px-3 text-sm font-semibold outline-none focus:border-[#553B2F]"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Mật khẩu"
          type="password"
        />
      </div>

      {error ? <p className="mt-3 text-sm font-bold text-red-700">{error}</p> : null}

      <Button className="mt-4 rounded-lg bg-[#553B2F] text-white hover:bg-[#3f2a21]">
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </Button>
    </form>
  );
}
