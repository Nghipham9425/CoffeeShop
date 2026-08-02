import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CircleX, Eye, FileSignature, Plus, RefreshCw, Trash2, X } from "lucide-react";
import { AdminPanel } from "../../../components/admin/AdminPanel";
import { AdminStatusBadge } from "../../../components/admin/AdminStatusBadge";
import { Button } from "../../../components/ui/button";
import { useAdminOutlet } from "../../../layouts/AdminLayout";
import { adminApi, formatCurrency, formatDate, type Product, type QuoteRequest } from "../../../lib/adminApi";
import { EmptyState, ErrorState, LoadingState } from "../shared/ApiState";
import { AdminPageShell } from "../shared/AdminPageShell";

const quoteColumns: Array<{ status: QuoteRequest["status"]; title: string; description: string }> = [
  { status: "NEW", title: "Yêu cầu mới", description: "Chưa liên hệ khách hàng" },
  { status: "CONTACTED", title: "Đã liên hệ", description: "Đang làm rõ nhu cầu" },
  { status: "QUOTED", title: "Đã báo giá", description: "Chờ khách phản hồi" },
  { status: "ACCEPTED", title: "Đã chấp nhận", description: "Chờ tạo hợp đồng/đơn" },
  { status: "REJECTED", title: "Đã từ chối", description: "Khách không đồng ý" },
  { status: "CONVERTED", title: "Đã chuyển đổi", description: "Đã tạo hợp đồng/đơn" },
  { status: "CLOSED", title: "Hoàn tất", description: "Đã chốt xử lý" },
  { status: "CANCELLED", title: "Đã hủy", description: "Không tiếp tục báo giá" },
];

const nextQuoteStep: Partial<Record<QuoteRequest["status"], { status: QuoteRequest["status"]; label: string }>> = {
  NEW: { status: "CONTACTED", label: "Xác nhận đã liên hệ" },
};

export function QuotesPage() {
  const { token, sessionVersion } = useAdminOutlet();
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [activeColumn, setActiveColumn] = useState<QuoteRequest["status"]>("NEW");
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const loadQuotes = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError("");

    try {
      setQuotes(await adminApi.quoteRequests(token));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được yêu cầu báo giá");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadQuotes();
  }, [loadQuotes, sessionVersion]);

  async function updateStatus(quote: QuoteRequest, status: QuoteRequest["status"]) {
    if (!token) return;

    setUpdatingId(quote.id);
    setError("");

    try {
      const updated = await adminApi.updateQuoteStatus(token, quote.id, status);
      setQuotes((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setActiveColumn(status);
      setSelectedQuote(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không cập nhật được trạng thái báo giá");
    } finally {
      setUpdatingId(null);
    }
  }

  async function cancelQuote(quote: QuoteRequest) {
    if (!window.confirm(`Hủy yêu cầu báo giá của ${quote.companyName}?`)) return;
    await updateStatus(quote, "CANCELLED");
  }

  async function saveQuotation(quote: QuoteRequest, payload: Parameters<typeof adminApi.createQuotation>[2]) {
    if (!token) return;
    setUpdatingId(quote.id); setError("");
    try {
      const updated = await adminApi.createQuotation(token, quote.id, payload);
      setQuotes((current) => current.map((item) => item.id === updated.id ? updated : item));
      setSelectedQuote(updated); setActiveColumn("QUOTED");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Không lưu được báo giá."); }
    finally { setUpdatingId(null); }
  }

  async function convertQuotation(quote: QuoteRequest, target: "CONTRACT" | "ORDER") {
    if (!token) return;
    setUpdatingId(quote.id); setError("");
    try { await adminApi.convertQuotation(token, quote.id, target); setSelectedQuote(null); setActiveColumn("CONVERTED"); await loadQuotes(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Không chuyển đổi được báo giá."); }
    finally { setUpdatingId(null); }
  }

  const activeColumnInfo = quoteColumns.find((column) => column.status === activeColumn)!;
  const visibleQuotes = useMemo(
    () => quotes.filter((quote) => quote.status === activeColumn),
    [activeColumn, quotes],
  );

  return (
    <AdminPageShell
      title="Yêu cầu báo giá B2B"
      description="Theo dõi yêu cầu từ khi tiếp nhận, liên hệ, gửi báo giá đến khi hoàn tất."
    >
      {error ? <ErrorState message={error} /> : null}

      <AdminPanel
        title="Tiến độ xử lý báo giá"
        description="Mỗi yêu cầu nằm trong đúng một trạng thái và chỉ chuyển sang bước nghiệp vụ kế tiếp."
        action={
          <Button onClick={loadQuotes} disabled={loading} className="rounded-lg bg-[#553B2F] text-white hover:bg-[#3f2a21]">
            <RefreshCw size={16} />
            Tải lại
          </Button>
        }
      >
        {loading ? (
          <LoadingState />
        ) : quotes.length ? (
          <div className="p-5">
            <div className="grid grid-cols-2 gap-2 border-b border-[#E8D3C7] pb-5 md:grid-cols-3 xl:grid-cols-5">
              {quoteColumns.map((column) => {
                const count = quotes.filter((quote) => quote.status === column.status).length;
                const isActive = activeColumn === column.status;

                return (
                  <button
                    key={column.status}
                    type="button"
                    onClick={() => setActiveColumn(column.status)}
                    className={`rounded-lg border p-3 text-left transition ${
                      isActive
                        ? "border-[#553B2F] bg-[#553B2F] text-white shadow-sm"
                        : "border-[#E8D3C7] bg-[#f8f2ed] text-[#553B2F] hover:border-[#AA7864] hover:bg-white"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2 text-sm font-black">
                      {column.title}
                      <span className={`grid h-6 min-w-6 place-items-center rounded-full px-1 text-xs ${isActive ? "bg-white/20" : "bg-white"}`}>{count}</span>
                    </span>
                    <span className={`mt-1 block text-xs font-semibold ${isActive ? "text-white/75" : "text-[#7a5547]"}`}>{column.description}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex items-end justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-[#553B2F]">{activeColumnInfo.title}</h3>
                <p className="mt-1 text-sm font-semibold text-[#7a5547]">{activeColumnInfo.description}</p>
              </div>
              <p className="text-sm font-black text-[#AA7864]">{visibleQuotes.length} yêu cầu</p>
            </div>

            {visibleQuotes.length ? (
              <div className="mt-4 grid gap-3">
                {visibleQuotes.map((quote) => (
                  <QuoteSummaryCard key={quote.id} quote={quote} onViewDetails={() => navigate(`/admin/bao-gia/${quote.id}`)} />
                ))}
              </div>
            ) : (
              <p className="py-12 text-center text-sm font-bold text-[#AA7864]">Chưa có yêu cầu ở trạng thái này.</p>
            )}
          </div>
        ) : (
          <EmptyState message="Chưa có yêu cầu báo giá." />
        )}
      </AdminPanel>

      {selectedQuote ? (
        <QuoteDetailDialog
          quote={selectedQuote}
          isUpdating={updatingId === selectedQuote.id}
          onClose={() => setSelectedQuote(null)}
          onUpdate={updateStatus}
          onCancel={cancelQuote}
          onSaveQuotation={saveQuotation}
          onConvert={convertQuotation}
        />
      ) : null}
    </AdminPageShell>
  );
}

function QuoteSummaryCard({ quote, onViewDetails }: { quote: QuoteRequest; onViewDetails: () => void }) {
  return (
    <article className="grid gap-4 rounded-lg border border-[#E8D3C7] bg-white p-4 shadow-sm lg:grid-cols-[1.1fr_1fr_1.2fr_auto] lg:items-center">
      <div>
        <p className="font-black text-[#553B2F]">{quote.companyName}</p>
        <p className="mt-1 text-xs font-bold text-[#AA7864]">Yêu cầu #{quote.id} · {formatDate(quote.createdAt)}</p>
      </div>
      <div>
        <p className="font-bold text-[#553B2F]">{quote.contactName}</p>
        <p className="mt-1 text-sm font-semibold text-[#7a5547]">{quote.phoneOrEmail}</p>
      </div>
      <div>
        <p className="line-clamp-1 text-sm font-bold text-[#553B2F]">{quote.productNeed}</p>
        <p className="mt-1 text-xs font-semibold text-[#7a5547]">
          {quote.expectedQuantityKg ? `${quote.expectedQuantityKg} kg dự kiến` : "Chưa ghi số lượng"}
        </p>
      </div>
      <div className="flex items-center gap-3 lg:justify-end">
        <AdminStatusBadge status={quote.status} />
        <Button variant="outline" onClick={onViewDetails} className="h-9 rounded-md border-[#C7A792] px-3 text-xs text-[#553B2F] hover:bg-[#f8f2ed]">
          <Eye size={15} /> Xem chi tiết
        </Button>
      </div>
    </article>
  );
}

function QuoteDetailDialog({
  quote,
  isUpdating,
  onClose,
  onUpdate,
  onCancel,
  onSaveQuotation,
  onConvert,
}: {
  quote: QuoteRequest;
  isUpdating: boolean;
  onClose: () => void;
  onUpdate: (quote: QuoteRequest, status: QuoteRequest["status"]) => Promise<void>;
  onCancel: (quote: QuoteRequest) => Promise<void>;
  onSaveQuotation: (quote: QuoteRequest, payload: Parameters<typeof adminApi.createQuotation>[2]) => Promise<void>;
  onConvert: (quote: QuoteRequest, target: "CONTRACT" | "ORDER") => Promise<void>;
}) {
  const nextStep = nextQuoteStep[quote.status];
  const canCancel = ["NEW", "CONTACTED", "QUOTED"].includes(quote.status);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4" role="dialog" aria-modal="true" aria-label={`Chi tiết yêu cầu báo giá ${quote.id}`}>
      <article className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-[#E8D3C7] bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-black text-[#553B2F]">Yêu cầu báo giá #{quote.id}</p>
              <AdminStatusBadge status={quote.status} />
            </div>
            <p className="mt-1 text-xs font-bold text-[#AA7864]">{formatDate(quote.createdAt)}</p>
          </div>
          <Button variant="outline" size="icon" onClick={onClose} className="h-9 w-9 rounded-md border-[#E8D3C7] text-[#553B2F] hover:bg-[#f8f2ed]" aria-label="Đóng chi tiết báo giá">
            <X size={18} />
          </Button>
        </div>

        <dl className="mt-5 grid gap-4 border-y border-[#f0e2da] py-4 sm:grid-cols-2">
          <QuoteDetail label="Doanh nghiệp" value={quote.companyName} />
          <QuoteDetail label="Người liên hệ" value={quote.contactName} />
          <QuoteDetail label="Điện thoại / email" value={quote.phoneOrEmail} />
          <QuoteDetail label="Số lượng dự kiến" value={quote.expectedQuantityKg ? `${quote.expectedQuantityKg} kg` : "Chưa cung cấp"} />
          <div className="sm:col-span-2"><QuoteDetail label="Nhu cầu sản phẩm" value={quote.productNeed} /></div>
          {quote.note ? <div className="sm:col-span-2"><QuoteDetail label="Ghi chú" value={quote.note} /></div> : null}
        </dl>

        {["CONTACTED", "QUOTED"].includes(quote.status) ? <QuotationEditor quote={quote} disabled={isUpdating} onSave={(payload) => onSaveQuotation(quote, payload)} /> : null}

        {quote.status === "ACCEPTED" ? <div className="mt-5 grid gap-2 sm:grid-cols-2"><Button disabled={isUpdating} onClick={() => onConvert(quote, "CONTRACT")} className="bg-[#553B2F] text-white hover:bg-[#3f2a21]"><FileSignature size={16} /> Tạo hợp đồng</Button><Button disabled={isUpdating} variant="outline" onClick={() => onConvert(quote, "ORDER")} className="border-[#C7A792] text-[#553B2F] hover:bg-[#f8f2ed]"><ArrowRight size={16} /> Tạo đơn B2B</Button></div> : null}

        {nextStep ? (
          <Button disabled={isUpdating} onClick={() => onUpdate(quote, nextStep.status)} className="mt-5 h-10 w-full rounded-md bg-[#553B2F] text-white hover:bg-[#3f2a21]">
            {nextStep.label} <ArrowRight size={16} />
          </Button>
        ) : !["CONTACTED", "QUOTED", "ACCEPTED"].includes(quote.status) ? (
          <p className="mt-5 rounded-lg bg-[#f8f2ed] px-4 py-3 text-center text-sm font-bold text-[#7a5547]">
            Yêu cầu này đã kết thúc, không còn bước xử lý tiếp theo.
          </p>
        ) : null}

        {canCancel ? (
          <Button variant="outline" disabled={isUpdating} onClick={() => onCancel(quote)} className="mt-2 h-9 w-full rounded-md border-red-200 text-red-700 hover:bg-red-50">
            <CircleX size={15} /> Hủy yêu cầu
          </Button>
        ) : null}
      </article>
    </div>
  );
}

type QuotationRow = { key: number; productId: string; description: string; quantity: string; unit: string; unitPrice: string };

function QuotationEditor({ quote, disabled, onSave }: { quote: QuoteRequest; disabled: boolean; onSave: (payload: Parameters<typeof adminApi.createQuotation>[2]) => Promise<void> }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [rows, setRows] = useState<QuotationRow[]>(quote.items.length ? quote.items.map((item) => ({ key: item.id, productId: item.productId?.toString() ?? "", description: item.description, quantity: String(item.quantity), unit: item.unit, unitPrice: String(item.unitPrice) })) : [{ key: Date.now(), productId: "", description: quote.productNeed, quantity: String(quote.expectedQuantityKg ?? 1), unit: "kg", unitPrice: "" }]);
  const [discount, setDiscount] = useState(String(quote.discountAmount || 0));
  const [validUntil, setValidUntil] = useState(toLocalDateTime(quote.validUntil ? new Date(quote.validUntil) : new Date(Date.now() + 7 * 86400000)));
  const [salesNote, setSalesNote] = useState(quote.salesNote ?? "");

  useEffect(() => { void adminApi.products({ isB2b: true }).then(setProducts); }, []);
  const subtotal = rows.reduce((sum, row) => sum + Number(row.quantity || 0) * Number(row.unitPrice || 0), 0);

  function updateRow(key: number, patch: Partial<QuotationRow>) { setRows((current) => current.map((row) => row.key === key ? { ...row, ...patch } : row)); }
  function chooseProduct(row: QuotationRow, productId: string) {
    const product = products.find((item) => item.id === Number(productId));
    updateRow(row.key, { productId, description: product?.name ?? row.description, unit: product?.unit ?? row.unit, unitPrice: product?.price == null ? row.unitPrice : String(product.price) });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    await onSave({ items: rows.map((row) => ({ productId: row.productId ? Number(row.productId) : undefined, description: row.description, quantity: Number(row.quantity), unit: row.unit, unitPrice: Number(row.unitPrice) })), discountAmount: Number(discount || 0), validUntil: new Date(validUntil).toISOString(), salesNote: salesNote.trim() || undefined });
  }

  return <form onSubmit={submit} className="mt-5 rounded-lg border border-[#E8D3C7] bg-[#FAF9F6] p-4"><div className="flex items-center justify-between gap-3"><div><h3 className="font-black text-[#553B2F]">Chi tiết báo giá</h3><p className="text-xs font-semibold text-[#7a5547]">Chọn sản phẩm để có thể chuyển thành đơn B2B.</p></div><Button type="button" variant="outline" className="h-8 border-[#C7A792] px-2 text-xs" onClick={() => setRows((current) => [...current, { key: Date.now(), productId: "", description: "", quantity: "1", unit: "kg", unitPrice: "" }])}><Plus size={14} /> Dòng hàng</Button></div>
    <div className="mt-4 space-y-3">{rows.map((row) => <div key={row.key} className="grid gap-2 rounded-lg border border-[#E8D3C7] bg-white p-3 sm:grid-cols-2"><select className="h-10 rounded-md border border-[#E8D3C7] px-2 text-sm" value={row.productId} onChange={(event) => chooseProduct(row, event.target.value)}><option value="">Sản phẩm tùy chỉnh</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select><input required className="h-10 rounded-md border border-[#E8D3C7] px-3 text-sm" placeholder="Mô tả sản phẩm" value={row.description} onChange={(event) => updateRow(row.key, { description: event.target.value })} /><input required min="1" type="number" className="h-10 rounded-md border border-[#E8D3C7] px-3 text-sm" placeholder="Số lượng" value={row.quantity} onChange={(event) => updateRow(row.key, { quantity: event.target.value })} /><div className="flex gap-2"><input required min="0" type="number" className="h-10 min-w-0 flex-1 rounded-md border border-[#E8D3C7] px-3 text-sm" placeholder="Đơn giá" value={row.unitPrice} onChange={(event) => updateRow(row.key, { unitPrice: event.target.value })} /><Button type="button" size="icon" variant="outline" disabled={rows.length === 1} onClick={() => setRows((current) => current.filter((item) => item.key !== row.key))}><Trash2 size={15} /></Button></div></div>)}</div>
    <div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-xs font-bold text-[#553B2F]">Chiết khấu (đ)<input min="0" type="number" className="mt-1 h-10 w-full rounded-md border border-[#E8D3C7] px-3 text-sm" value={discount} onChange={(event) => setDiscount(event.target.value)} /></label><label className="text-xs font-bold text-[#553B2F]">Hiệu lực đến<input required type="datetime-local" className="mt-1 h-10 w-full rounded-md border border-[#E8D3C7] px-3 text-sm" value={validUntil} onChange={(event) => setValidUntil(event.target.value)} /></label></div><textarea className="mt-3 min-h-20 w-full rounded-md border border-[#E8D3C7] p-3 text-sm" placeholder="Điều kiện giao hàng, thanh toán, công nợ..." value={salesNote} onChange={(event) => setSalesNote(event.target.value)} />
    <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#E8D3C7] pt-4"><div className="text-sm"><span className="text-[#7a5547]">Tổng báo giá: </span><strong className="text-[#553B2F]">{formatCurrency(Math.max(0, subtotal - Number(discount || 0)))}</strong></div><Button disabled={disabled} className="bg-[#553B2F] text-white hover:bg-[#3f2a21]">Lưu và gửi báo giá</Button></div>
  </form>;
}

function toLocalDateTime(date: Date) { const offset = date.getTimezoneOffset() * 60000; return new Date(date.getTime() - offset).toISOString().slice(0, 16); }

function QuoteDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-black uppercase text-[#AA7864]">{label}</dt>
      <dd className="mt-1 text-sm font-semibold leading-6 text-[#553B2F]">{value}</dd>
    </div>
  );
}
