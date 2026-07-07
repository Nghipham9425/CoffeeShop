import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Building2, RefreshCw, UserRoundCheck } from "lucide-react";
import { AdminPanel } from "../../../components/admin/AdminPanel";
import { AdminStatusBadge } from "../../../components/admin/AdminStatusBadge";
import { Button } from "../../../components/ui/button";
import { useAdminOutlet } from "../../../layouts/AdminLayout";
import {
  adminApi,
  formatCurrency,
  formatDate,
  type BusinessCustomer,
  type RetailCustomer,
} from "../../../lib/adminApi";
import { EmptyState, ErrorState, LoadingState } from "../shared/ApiState";
import { AdminPageShell } from "../shared/AdminPageShell";

type BusinessForm = Pick<BusinessCustomer, "companyName" | "contactName" | "phone"> &
  Partial<Pick<BusinessCustomer, "taxCode" | "email" | "address" | "note">>;

const emptyBusinessForm: BusinessForm = {
  companyName: "",
  contactName: "",
  phone: "",
  taxCode: "",
  email: "",
  address: "",
  note: "",
};

export function CustomersPage() {
  const { token, sessionVersion } = useAdminOutlet();
  const [retailCustomers, setRetailCustomers] = useState<RetailCustomer[]>([]);
  const [businessCustomers, setBusinessCustomers] = useState<BusinessCustomer[]>([]);
  const [keyword, setKeyword] = useState("");
  const [businessForm, setBusinessForm] = useState<BusinessForm>(emptyBusinessForm);
  const [editingBusinessId, setEditingBusinessId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const totalRetailSpent = useMemo(
    () => retailCustomers.reduce((sum, customer) => sum + (customer.loyalty?.totalSpent ?? 0), 0),
    [retailCustomers],
  );

  const loadCustomers = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError("");

    try {
      const [retailResult, businessResult] = await Promise.all([
        adminApi.retailCustomers(token, { keyword }),
        adminApi.businessCustomers(token, { keyword }),
      ]);
      setRetailCustomers(retailResult);
      setBusinessCustomers(businessResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được khách hàng");
    } finally {
      setLoading(false);
    }
  }, [keyword, token]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers, sessionVersion]);

  function editBusiness(customer: BusinessCustomer) {
    setEditingBusinessId(customer.id);
    setBusinessForm({
      companyName: customer.companyName,
      contactName: customer.contactName,
      phone: customer.phone,
      taxCode: customer.taxCode ?? "",
      email: customer.email ?? "",
      address: customer.address ?? "",
      note: customer.note ?? "",
    });
  }

  function resetBusinessForm() {
    setEditingBusinessId(null);
    setBusinessForm(emptyBusinessForm);
  }

  async function submitBusiness(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    const payload = {
      companyName: businessForm.companyName.trim(),
      contactName: businessForm.contactName.trim(),
      phone: businessForm.phone.trim(),
      taxCode: businessForm.taxCode?.trim() || undefined,
      email: businessForm.email?.trim() || undefined,
      address: businessForm.address?.trim() || undefined,
      note: businessForm.note?.trim() || undefined,
    };

    setSaving(true);
    setError("");

    try {
      if (editingBusinessId) {
        const updated = await adminApi.updateBusinessCustomer(token, editingBusinessId, payload);
        setBusinessCustomers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      } else {
        const created = await adminApi.createBusinessCustomer(token, payload);
        setBusinessCustomers((current) => [created, ...current]);
      }
      resetBusinessForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không lưu được khách doanh nghiệp");
    } finally {
      setSaving(false);
    }
  }

  async function toggleRetailCustomer(customer: RetailCustomer) {
    if (!token) return;

    setError("");
    try {
      const updated = await adminApi.updateRetailCustomer(token, customer.id, { isActive: !customer.isActive });
      setRetailCustomers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không cập nhật được khách lẻ");
    }
  }

  return (
    <AdminPageShell title="Quản lý khách hàng" description="Theo dõi khách lẻ B2C, khách doanh nghiệp B2B và hồ sơ chăm sóc khách hàng.">
      {error ? <ErrorState message={error} /> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <AdminPanel title="Khách lẻ B2C" description="Tài khoản mua hàng thường.">
          <p className="p-5 text-3xl font-black text-[#553B2F]">{retailCustomers.length}</p>
        </AdminPanel>
        <AdminPanel title="Khách doanh nghiệp B2B" description="Đối tác báo giá, hợp đồng, công nợ.">
          <p className="p-5 text-3xl font-black text-[#553B2F]">{businessCustomers.length}</p>
        </AdminPanel>
        <AdminPanel title="Doanh số khách lẻ" description="Tổng tích lũy từ hồ sơ thân thiết.">
          <p className="p-5 text-3xl font-black text-[#553B2F]">{formatCurrency(totalRetailSpent)}</p>
        </AdminPanel>
      </div>

      <AdminPanel
        title="Tìm khách hàng"
        description="Tìm theo tên, email, số điện thoại, công ty hoặc mã số thuế."
        action={
          <Button onClick={loadCustomers} disabled={loading} className="rounded-lg bg-[#553B2F] text-white hover:bg-[#3f2a21]">
            <RefreshCw size={16} />
            Tải lại
          </Button>
        }
      >
        <div className="grid gap-3 p-5 md:grid-cols-[1fr_auto]">
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Nhập từ khóa khách hàng..."
            className="rounded-lg border border-[#C7A792] px-4 py-2 text-sm font-semibold outline-none focus:border-[#553B2F]"
          />
          <Button onClick={loadCustomers} className="rounded-lg bg-[#AA7864] text-white hover:bg-[#8d604f]">
            Tìm kiếm
          </Button>
        </div>
      </AdminPanel>

      <AdminPanel title={editingBusinessId ? "Cập nhật khách doanh nghiệp" : "Thêm khách doanh nghiệp"} description="Dùng cho đối tác B2B, khách sỉ, đại lý và khách cần báo giá riêng.">
        <form onSubmit={submitBusiness} className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-4">
          <input required value={businessForm.companyName} onChange={(event) => setBusinessForm((current) => ({ ...current, companyName: event.target.value }))} placeholder="Tên công ty" className="rounded-lg border border-[#C7A792] px-4 py-2 text-sm font-semibold" />
          <input required value={businessForm.contactName} onChange={(event) => setBusinessForm((current) => ({ ...current, contactName: event.target.value }))} placeholder="Người liên hệ" className="rounded-lg border border-[#C7A792] px-4 py-2 text-sm font-semibold" />
          <input required value={businessForm.phone} onChange={(event) => setBusinessForm((current) => ({ ...current, phone: event.target.value }))} placeholder="Số điện thoại" className="rounded-lg border border-[#C7A792] px-4 py-2 text-sm font-semibold" />
          <input value={businessForm.taxCode ?? ""} onChange={(event) => setBusinessForm((current) => ({ ...current, taxCode: event.target.value }))} placeholder="Mã số thuế" className="rounded-lg border border-[#C7A792] px-4 py-2 text-sm font-semibold" />
          <input value={businessForm.email ?? ""} onChange={(event) => setBusinessForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email" className="rounded-lg border border-[#C7A792] px-4 py-2 text-sm font-semibold" />
          <input value={businessForm.address ?? ""} onChange={(event) => setBusinessForm((current) => ({ ...current, address: event.target.value }))} placeholder="Địa chỉ" className="rounded-lg border border-[#C7A792] px-4 py-2 text-sm font-semibold" />
          <input value={businessForm.note ?? ""} onChange={(event) => setBusinessForm((current) => ({ ...current, note: event.target.value }))} placeholder="Ghi chú" className="rounded-lg border border-[#C7A792] px-4 py-2 text-sm font-semibold" />
          <div className="flex gap-2">
            <Button disabled={saving} className="flex-1 rounded-lg bg-[#553B2F] text-white hover:bg-[#3f2a21]">
              <Building2 size={16} />
              {editingBusinessId ? "Cập nhật" : "Thêm mới"}
            </Button>
            {editingBusinessId ? (
              <Button type="button" variant="outline" onClick={resetBusinessForm} className="rounded-lg border-[#C7A792] text-[#553B2F] hover:bg-[#E8D3C7]">
                Hủy
              </Button>
            ) : null}
          </div>
        </form>
      </AdminPanel>

      {loading ? <LoadingState /> : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <AdminPanel title="Khách lẻ B2C" description="Tài khoản khách mua lẻ trên website.">
          {!loading && retailCustomers.length ? (
            <div className="divide-y divide-[#E8D3C7]">
              {retailCustomers.map((customer) => (
                <article key={customer.id} className="flex flex-wrap items-start justify-between gap-4 p-5">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-black text-[#553B2F]">{customer.fullName}</h2>
                      <AdminStatusBadge status={customer.isActive ? "ACTIVE" : "LOCKED"} />
                    </div>
                    <p className="mt-1 text-sm font-semibold text-[#7a5547]">{customer.email}</p>
                    <p className="text-sm font-semibold text-[#7a5547]">{customer.phone ?? "Chưa có số điện thoại"}</p>
                    <p className="mt-2 text-xs font-bold text-[#AA7864]">Tạo ngày {formatDate(customer.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-[#553B2F]">{customer.orderCount} đơn</p>
                    <p className="text-sm font-bold text-[#AA7864]">{formatCurrency(customer.loyalty?.totalSpent ?? 0)}</p>
                    <Button type="button" variant="outline" onClick={() => toggleRetailCustomer(customer)} className="mt-3 rounded-lg border-[#C7A792] text-[#553B2F] hover:bg-[#E8D3C7]">
                      <UserRoundCheck size={16} />
                      {customer.isActive ? "Khóa" : "Mở khóa"}
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          ) : !loading ? (
            <EmptyState message="Chưa có khách lẻ phù hợp." />
          ) : null}
        </AdminPanel>

        <AdminPanel title="Khách doanh nghiệp B2B" description="Hồ sơ công ty, khách sỉ, đại lý và đối tác cần báo giá.">
          {!loading && businessCustomers.length ? (
            <div className="divide-y divide-[#E8D3C7]">
              {businessCustomers.map((customer) => (
                <article key={customer.id} className="flex flex-wrap items-start justify-between gap-4 p-5">
                  <div>
                    <h2 className="font-black text-[#553B2F]">{customer.companyName}</h2>
                    <p className="mt-1 text-sm font-semibold text-[#7a5547]">{customer.contactName} - {customer.phone}</p>
                    <p className="text-sm font-semibold text-[#7a5547]">{customer.email ?? "Chưa có email"}</p>
                    <p className="mt-2 text-xs font-bold text-[#AA7864]">
                      {customer.quoteRequestCount} báo giá · {customer.contractCount} hợp đồng · {customer.debtCount} công nợ
                    </p>
                  </div>
                  <Button type="button" variant="outline" onClick={() => editBusiness(customer)} className="rounded-lg border-[#C7A792] text-[#553B2F] hover:bg-[#E8D3C7]">
                    Sửa hồ sơ
                  </Button>
                </article>
              ))}
            </div>
          ) : !loading ? (
            <EmptyState message="Chưa có khách doanh nghiệp phù hợp." />
          ) : null}
        </AdminPanel>
      </div>
    </AdminPageShell>
  );
}
