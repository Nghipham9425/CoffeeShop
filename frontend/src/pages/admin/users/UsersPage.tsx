import { useCallback, useEffect, useState } from "react";
import { ShieldCheck, UserRoundCheck, UserRoundX } from "lucide-react";
import { AdminPanel } from "../../../components/admin/AdminPanel";
import { Button } from "../../../components/ui/button";
import { staffRoleLabels } from "../../../data/adminPermissions";
import { useAdminOutlet } from "../../../layouts/AdminLayout";
import { adminApi, formatDate, type ManagedUser } from "../../../lib/adminApi";
import { ErrorState, LoadingState } from "../shared/ApiState";
import { AdminPageShell } from "../shared/AdminPageShell";

const allRoles: ManagedUser["role"][] = ["CUSTOMER", "SALES", "WAREHOUSE", "ACCOUNTANT", "ADMIN"];

const roleNames: Record<ManagedUser["role"], string> = {
  ADMIN: staffRoleLabels.ADMIN,
  SALES: staffRoleLabels.SALES,
  WAREHOUSE: staffRoleLabels.WAREHOUSE,
  ACCOUNTANT: staffRoleLabels.ACCOUNTANT,
  CUSTOMER: "Khách hàng",
};

export function UsersPage() {
  const { token, user: currentUser, sessionVersion } = useAdminOutlet();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [keyword, setKeyword] = useState("");
  const [role, setRole] = useState<ManagedUser["role"] | "">("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const loadUsers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      setUsers(await adminApi.users(token, { keyword: keyword.trim() || undefined, role: role || undefined }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  }, [keyword, role, token]);

  useEffect(() => {
    const timer = window.setTimeout(loadUsers, 250);
    return () => window.clearTimeout(timer);
  }, [loadUsers, sessionVersion]);

  async function updateRole(target: ManagedUser, nextRole: ManagedUser["role"]) {
    if (!token || target.id === currentUser?.id || target.role === nextRole) return;
    if (!window.confirm(`Đổi vai trò của ${target.fullName} thành ${roleNames[nextRole]}?`)) return;
    setSavingId(target.id);
    setError("");
    try {
      const updated = await adminApi.updateUserRole(token, target.id, nextRole);
      setUsers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể cập nhật vai trò.");
    } finally {
      setSavingId(null);
    }
  }

  async function updateActive(target: ManagedUser) {
    if (!token || target.id === currentUser?.id) return;
    const action = target.isActive ? "khóa" : "mở khóa";
    if (!window.confirm(`Bạn muốn ${action} tài khoản ${target.fullName}?`)) return;
    setSavingId(target.id);
    setError("");
    try {
      const updated = await adminApi.updateUserActive(token, target.id, !target.isActive);
      setUsers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể cập nhật trạng thái tài khoản.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <AdminPageShell
      title="Quản lý người dùng"
      description="Chỉ quản trị viên được thay đổi vai trò hoặc khóa, mở khóa tài khoản. Hệ thống không hỗ trợ xóa tài khoản để bảo toàn lịch sử đơn hàng và giao dịch."
    >
      <AdminPanel title="Danh sách tài khoản" description="Tìm kiếm, phân vai trò và kiểm soát trạng thái hoạt động.">
        <div className="flex flex-col gap-3 border-b border-[#eadfd6] p-5 md:flex-row">
          <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tìm theo tên, email hoặc số điện thoại" className="h-10 flex-1 rounded-md border border-[#d8c1b1] bg-white px-3 text-sm outline-none focus:border-[#8f5a3a]" />
          <select value={role} onChange={(event) => setRole(event.target.value as ManagedUser["role"] | "")} className="h-10 rounded-md border border-[#d8c1b1] bg-white px-3 text-sm font-semibold outline-none focus:border-[#8f5a3a]">
            <option value="">Tất cả vai trò</option>
            {allRoles.map((item) => <option key={item} value={item}>{roleNames[item]}</option>)}
          </select>
        </div>

        {error ? <div className="p-5"><ErrorState message={error} /></div> : null}
        {loading ? <div className="p-5"><LoadingState /></div> : null}
        {!loading && !error ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-[#fcf8f5] text-xs font-black uppercase tracking-wide text-[#806556]">
                <tr><th className="px-5 py-3">Người dùng</th><th className="px-5 py-3">Vai trò</th><th className="px-5 py-3">Hoạt động</th><th className="px-5 py-3">Lịch sử</th><th className="px-5 py-3">Tham gia</th><th className="px-5 py-3 text-right">Thao tác</th></tr>
              </thead>
              <tbody>
                {users.map((item) => {
                  const isSelf = item.id === currentUser?.id;
                  const isSaving = savingId === item.id;
                  return <tr key={item.id} className="border-t border-[#f0e7e0] align-middle">
                    <td className="px-5 py-4"><p className="font-black text-[#3b2419]">{item.fullName}</p><p className="mt-1 text-xs text-[#806556]">{item.email}{item.phone ? ` · ${item.phone}` : ""}</p></td>
                    <td className="px-5 py-4"><select disabled={isSelf || isSaving} value={item.role} onChange={(event) => updateRole(item, event.target.value as ManagedUser["role"])} className="h-9 rounded-md border border-[#d8c1b1] bg-white px-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60">{allRoles.map((value) => <option key={value} value={value}>{roleNames[value]}</option>)}</select></td>
                    <td className="px-5 py-4"><span className={item.isActive ? "inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-800" : "inline-flex rounded-full bg-stone-200 px-2.5 py-1 text-xs font-black text-stone-700"}>{item.isActive ? "Đang hoạt động" : "Đã khóa"}</span></td>
                    <td className="px-5 py-4 text-[#806556]">{item._count.orders} đơn · {item._count.addresses} địa chỉ</td>
                    <td className="px-5 py-4 text-[#806556]">{formatDate(item.createdAt)}</td>
                    <td className="px-5 py-4 text-right"><Button variant="outline" disabled={isSelf || isSaving} onClick={() => updateActive(item)} className="h-8 border-[#caa489] px-2 text-xs text-[#5b3524] hover:bg-[#f5e7dc]">{item.isActive ? <UserRoundX size={15} /> : <UserRoundCheck size={15} />}{item.isActive ? "Khóa" : "Mở khóa"}</Button></td>
                  </tr>;
                })}
              </tbody>
            </table>
            {users.length === 0 ? <div className="p-8 text-center text-sm font-semibold text-[#806556]"><ShieldCheck className="mx-auto mb-2" />Không có người dùng phù hợp.</div> : null}
          </div>
        ) : null}
      </AdminPanel>
    </AdminPageShell>
  );
}
