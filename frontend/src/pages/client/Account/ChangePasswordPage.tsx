import { KeyRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { adminAuth } from "../../../lib/adminApi";
import { profileApi } from "../../../lib/profileApi";
import { AccountPageShell, Alert } from "./AccountPageShell";

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState(""); const [newPassword, setNewPassword] = useState(""); const [confirmPassword, setConfirmPassword] = useState(""); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  async function onSubmit(event: FormEvent) {
    event.preventDefault(); setError("");
    if (!currentPassword || !newPassword || !confirmPassword) { setError("Vui lòng nhập đầy đủ thông tin mật khẩu."); return; }
    if (newPassword.length < 8) { setError("Mật khẩu mới phải có ít nhất 8 ký tự."); return; }
    if (newPassword !== confirmPassword) { setError("Xác nhận mật khẩu chưa khớp."); return; }
    setLoading(true);
    try { await profileApi.changePassword({ currentPassword, newPassword, confirmPassword }); adminAuth.clearSession(); navigate("/dang-nhap", { replace: true }); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Không thể đổi mật khẩu."); }
    finally { setLoading(false); }
  }
  return <AccountPageShell title="Đổi mật khẩu" description="Mật khẩu mới cần tối thiểu 8 ký tự. Sau khi đổi thành công, bạn sẽ cần đăng nhập lại."><section className="max-w-3xl rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-stone-100 text-[var(--roast)]"><KeyRound size={21} /></span><div><h2 className="text-xl font-black text-stone-950">Bảo mật tài khoản</h2><p className="text-sm text-stone-500">Không dùng lại mật khẩu hiện tại.</p></div></div><form onSubmit={onSubmit} className="mt-6 grid gap-4 md:grid-cols-2"><PasswordField label="Mật khẩu hiện tại" value={currentPassword} onChange={setCurrentPassword} placeholder="Nhập mật khẩu hiện tại" wide /><PasswordField label="Mật khẩu mới" value={newPassword} onChange={setNewPassword} placeholder="Ít nhất 8 ký tự" /><PasswordField label="Xác nhận mật khẩu mới" value={confirmPassword} onChange={setConfirmPassword} placeholder="Nhập lại mật khẩu mới" />{error ? <div className="md:col-span-2"><Alert tone="error">{error}</Alert></div> : null}<div className="md:col-span-2"><Button disabled={loading} type="submit">{loading ? "Đang xử lý..." : <><KeyRound size={17} /> Xác nhận đổi mật khẩu</>}</Button></div></form></section></AccountPageShell>;
}
function PasswordField({ label, value, onChange, placeholder, wide }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; wide?: boolean }) { return <label className={`grid gap-2 text-sm font-bold text-stone-700 ${wide ? "md:col-span-2" : ""}`}><span>{label}</span><input className="h-11 rounded-xl border border-stone-300 bg-white px-3 font-medium outline-none focus:border-emerald-800" type="password" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></label>; }
