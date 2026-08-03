import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { BadgeDollarSign, CheckCircle2, CircleX, FileCheck2, Landmark, RefreshCw } from "lucide-react";
import { AdminPanel } from "../../../components/admin/AdminPanel";
import { Button } from "../../../components/ui/button";
import { useAdminOutlet } from "../../../layouts/AdminLayout";
import { adminApi, formatCurrency, formatDate, type B2BContract, type B2BDebt, type B2BOverview } from "../../../lib/adminApi";
import { EmptyState, ErrorState, LoadingState } from "../shared/ApiState";
import { AdminPageShell } from "../shared/AdminPageShell";

type ContractUpdatePayload = {
  status?: B2BContract["status"];
  startDate?: string;
  endDate?: string;
  depositPercent?: number;
  paymentTermDays?: number;
  note?: string;
};

export function B2BFinancePage() {
  const { token, sessionVersion } = useAdminOutlet();
  const [data, setData] = useState<B2BOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [contractId, setContractId] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [paymentDebt, setPaymentDebt] = useState<B2BDebt | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [transactionCode, setTransactionCode] = useState("");
  const [updatingContractId, setUpdatingContractId] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      setData(await adminApi.b2bOverview(token));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Không tải được dữ liệu B2B.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { void load(); }, [load, sessionVersion]);

  const openDebts = useMemo(() => data?.debts.filter((item) => item.status !== "CLEARED") ?? [], [data]);

  async function updateContract(contract: B2BContract, payload: ContractUpdatePayload) {
    if (!token) return;
    setUpdatingContractId(contract.id);
    try {
      await adminApi.updateB2BContract(token, contract.id, payload);
      await load();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Không cập nhật được hợp đồng.");
    } finally {
      setUpdatingContractId(null);
    }
  }

  async function createInvoice(event: FormEvent) {
    event.preventDefault();
    if (!token || !data) return;
    const contract = data.contracts.find((item) => item.id === Number(contractId));
    if (!contract) {
      setError("Vui lòng chọn hợp đồng đang hiệu lực.");
      return;
    }
    try {
      await adminApi.createB2BInvoice(token, {
        contractId: contract.id,
        businessCustomerId: contract.businessCustomer.id,
        amount: Number(invoiceAmount),
        dueDate: dueDate || undefined,
      });
      setInvoiceAmount("");
      setDueDate("");
      await load();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Không tạo được hóa đơn.");
    }
  }

  async function recordPayment(event: FormEvent) {
    event.preventDefault();
    if (!token || !paymentDebt) return;
    try {
      await adminApi.recordDebtPayment(token, paymentDebt.id, {
        amount: Number(paymentAmount),
        transactionCode: transactionCode || undefined,
      });
      setPaymentDebt(null);
      setPaymentAmount("");
      setTransactionCode("");
      await load();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Không ghi nhận được khoản thu.");
    }
  }

  return <AdminPageShell title="Hợp đồng, hóa đơn và công nợ" description="Theo dõi luồng B2B sau khi khách hàng chấp nhận báo giá.">
    {error ? <ErrorState message={error} /> : null}
    <div className="grid gap-4 md:grid-cols-3">
      <Metric icon={FileCheck2} label="Hợp đồng" value={data?.contracts.length ?? 0} />
      <Metric icon={Landmark} label="Hóa đơn" value={data?.invoices.length ?? 0} />
      <Metric icon={BadgeDollarSign} label="Công nợ còn mở" value={openDebts.length} />
    </div>

    <AdminPanel title="Lập hóa đơn từ hợp đồng" description="Chỉ lập hóa đơn từ hợp đồng đang hiệu lực. Mỗi hóa đơn tự tạo một khoản công nợ." action={<Button onClick={load} variant="outline" className="border-[#C7A792] text-[#553B2F]"><RefreshCw size={16} />Tải lại</Button>}>
      <form onSubmit={createInvoice} className="grid gap-3 p-5 md:grid-cols-4">
        <select required value={contractId} onChange={(event) => setContractId(event.target.value)} className="h-10 rounded-lg border border-[#C7A792] px-3 text-sm font-semibold md:col-span-2">
          <option value="">Chọn hợp đồng đang hiệu lực</option>
          {data?.contracts.filter((contract) => contract.status === "ACTIVE").map((contract) => <option key={contract.id} value={contract.id}>{contract.contractCode} - {contract.businessCustomer.companyName}</option>)}
        </select>
        <input required min={1} type="number" value={invoiceAmount} onChange={(event) => setInvoiceAmount(event.target.value)} placeholder="Giá trị hóa đơn" className="h-10 rounded-lg border border-[#C7A792] px-3 text-sm font-semibold" />
        <input required type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="h-10 rounded-lg border border-[#C7A792] px-3 text-sm font-semibold" />
        <Button className="bg-[#553B2F] text-white hover:bg-[#3f2a21] md:col-span-4">Tạo hóa đơn và công nợ</Button>
      </form>
    </AdminPanel>

    {loading ? <LoadingState /> : <div className="grid gap-5 xl:grid-cols-2">
      <AdminPanel title="Hợp đồng B2B" description="Nháp → hiệu lực → hoàn thành. Thiết lập điều khoản trước khi kích hoạt.">
        {data?.contracts.length ? <div className="divide-y divide-[#E8D3C7]">
          {data.contracts.map((contract) => <article key={contract.id} className="grid gap-4 p-5 lg:grid-cols-[1fr_320px]">
            <div>
              <p className="font-black text-[#553B2F]">{contract.contractCode} · {contract.businessCustomer.companyName}</p>
              <p className="mt-1 text-sm font-semibold text-[#7a5547]">{contract.title}</p>
              <p className="mt-3 text-xs font-bold text-[#AA7864]">{formatCurrency(contract.totalValue)} · Đặt cọc {contract.depositPercent}% · Công nợ {contract.paymentTermDays} ngày</p>
              <p className="mt-1 text-xs font-semibold text-[#7a5547]">Thời hạn: {contract.startDate ? formatDate(contract.startDate) : "Chưa thiết lập"} - {contract.endDate ? formatDate(contract.endDate) : "Chưa thiết lập"}</p>
              <p className="mt-2 text-xs font-black uppercase text-[#AA7864]">Trạng thái: {contract.status === "DRAFT" ? "Nháp" : contract.status === "ACTIVE" ? "Đang hiệu lực" : contract.status === "COMPLETED" ? "Hoàn thành" : "Đã hủy"}</p>
            </div>
            <div>
              <ContractActions contract={contract} isUpdating={updatingContractId === contract.id} onUpdate={updateContract} />
              {contract.status === "DRAFT" ? <ContractTermsForm contract={contract} disabled={updatingContractId === contract.id} onSave={updateContract} /> : null}
            </div>
          </article>)}
        </div> : <EmptyState message="Chưa có hợp đồng. Chuyển báo giá đã chấp nhận thành hợp đồng trước." />}
      </AdminPanel>

      <AdminPanel title="Công nợ cần thu" description="Ghi nhận từng lần thu tiền, số dư tự cập nhật.">
        {data?.debts.length ? <div className="divide-y divide-[#E8D3C7]">
          {data.debts.map((debt) => <article key={debt.id} className="flex flex-wrap items-start justify-between gap-3 p-5">
            <div>
              <p className="font-black text-[#553B2F]">{debt.debtCode} · {debt.businessCustomer.companyName}</p>
              <p className="mt-1 text-sm font-semibold text-[#7a5547]">Còn phải thu: {formatCurrency(debt.remainingAmount)}</p>
              <p className="mt-1 text-xs font-bold text-[#AA7864]">Hóa đơn {debt.invoice?.invoiceCode ?? "Không liên kết"} · {debt.dueDate ? `Hạn ${formatDate(debt.dueDate)}` : "Chưa đặt hạn"}</p>
            </div>
            {debt.status !== "CLEARED" ? <Button onClick={() => { setPaymentDebt(debt); setPaymentAmount(String(debt.remainingAmount)); }} variant="outline" className="border-[#C7A792] text-[#553B2F] hover:bg-[#f8f2ed]">Thu tiền</Button> : <span className="text-sm font-black text-emerald-700">Đã tất toán</span>}
          </article>)}
        </div> : <EmptyState message="Chưa có công nợ B2B." />}
      </AdminPanel>
    </div>}

    {paymentDebt ? <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <form onSubmit={recordPayment} className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-black text-[#553B2F]">Ghi nhận thu tiền</h2>
        <p className="mt-2 text-sm text-[#7a5547]">{paymentDebt.debtCode} · còn {formatCurrency(paymentDebt.remainingAmount)}</p>
        <input required min={1} max={paymentDebt.remainingAmount} type="number" value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value)} className="mt-5 h-11 w-full rounded-lg border border-[#C7A792] px-3" placeholder="Số tiền thu" />
        <input value={transactionCode} onChange={(event) => setTransactionCode(event.target.value)} className="mt-3 h-11 w-full rounded-lg border border-[#C7A792] px-3" placeholder="Mã giao dịch / chứng từ" />
        <div className="mt-5 flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setPaymentDebt(null)}>Hủy</Button><Button className="bg-[#553B2F] text-white hover:bg-[#3f2a21]">Xác nhận thu</Button></div>
      </form>
    </div> : null}
  </AdminPageShell>;
}

function Metric({ icon: Icon, label, value }: { icon: typeof FileCheck2; label: string; value: number }) {
  return <div className="rounded-xl border border-[#E8D3C7] bg-white p-5 shadow-sm"><Icon className="text-[#AA7864]" size={22} /><p className="mt-3 text-3xl font-black text-[#553B2F]">{value}</p><p className="mt-1 text-sm font-bold text-[#7a5547]">{label}</p></div>;
}

function ContractActions({ contract, isUpdating, onUpdate }: { contract: B2BContract; isUpdating: boolean; onUpdate: (contract: B2BContract, payload: ContractUpdatePayload) => Promise<void> }) {
  if (["COMPLETED", "CANCELLED"].includes(contract.status)) return null;
  return <div className="flex flex-wrap gap-2">
    {contract.status === "DRAFT" ? <Button disabled={isUpdating} onClick={() => void onUpdate(contract, { status: "ACTIVE" })} className="bg-[#553B2F] text-white hover:bg-[#3f2a21]"><CheckCircle2 size={16} />Kích hoạt</Button> : <Button disabled={isUpdating} onClick={() => void onUpdate(contract, { status: "COMPLETED" })} className="bg-emerald-700 text-white hover:bg-emerald-800"><CheckCircle2 size={16} />Hoàn thành</Button>}
    <Button disabled={isUpdating} variant="outline" onClick={() => { if (window.confirm(`Hủy hợp đồng ${contract.contractCode}?`)) void onUpdate(contract, { status: "CANCELLED" }); }} className="border-red-200 text-red-700 hover:bg-red-50"><CircleX size={16} />Hủy</Button>
  </div>;
}

function ContractTermsForm({ contract, disabled, onSave }: { contract: B2BContract; disabled: boolean; onSave: (contract: B2BContract, payload: ContractUpdatePayload) => Promise<void> }) {
  const [startDate, setStartDate] = useState(toDateInput(contract.startDate));
  const [endDate, setEndDate] = useState(toDateInput(contract.endDate));
  const [depositPercent, setDepositPercent] = useState(String(contract.depositPercent));
  const [paymentTermDays, setPaymentTermDays] = useState(String(contract.paymentTermDays ?? 30));

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!startDate || !endDate) return;
    void onSave(contract, {
      startDate: new Date(`${startDate}T00:00:00`).toISOString(),
      endDate: new Date(`${endDate}T00:00:00`).toISOString(),
      depositPercent: Number(depositPercent),
      paymentTermDays: Number(paymentTermDays),
    });
  }

  return <form onSubmit={submit} className="mt-3 grid gap-2 rounded-lg border border-[#E8D3C7] bg-[#fcf8f5] p-3 text-xs">
    <p className="font-black text-[#553B2F]">Thiết lập điều khoản trước khi kích hoạt</p>
    <div className="grid grid-cols-2 gap-2">
      <label className="grid gap-1 font-bold text-[#7a5547]">Bắt đầu<input required type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="h-9 rounded border border-[#C7A792] bg-white px-2 text-sm" /></label>
      <label className="grid gap-1 font-bold text-[#7a5547]">Kết thúc<input required min={startDate || undefined} type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="h-9 rounded border border-[#C7A792] bg-white px-2 text-sm" /></label>
    </div>
    <div className="grid grid-cols-2 gap-2">
      <label className="grid gap-1 font-bold text-[#7a5547]">Đặt cọc (%)<input required min={0} max={100} type="number" value={depositPercent} onChange={(event) => setDepositPercent(event.target.value)} className="h-9 rounded border border-[#C7A792] bg-white px-2 text-sm" /></label>
      <label className="grid gap-1 font-bold text-[#7a5547]">Hạn công nợ (ngày)<input required min={1} max={180} type="number" value={paymentTermDays} onChange={(event) => setPaymentTermDays(event.target.value)} className="h-9 rounded border border-[#C7A792] bg-white px-2 text-sm" /></label>
    </div>
    <Button disabled={disabled} type="submit" variant="outline" className="h-9 border-[#C7A792] bg-white text-[#553B2F] hover:bg-[#f3e6de]">Lưu điều khoản</Button>
  </form>;
}

function toDateInput(value: string | null) { return value ? value.slice(0, 10) : ""; }
