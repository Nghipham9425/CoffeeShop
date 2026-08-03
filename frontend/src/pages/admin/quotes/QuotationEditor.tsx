import { useEffect, useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { adminApi, formatCurrency, type Product, type QuoteRequest } from "../../../lib/adminApi";

type QuotationRow = {
  key: number;
  productId: string;
  description: string;
  quantity: string;
  unit: string;
  unitPrice: string;
};

type QuotationPayload = Parameters<typeof adminApi.createQuotation>[2];

function toLocalDateTime(date: Date) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function QuotationEditor({
  quote,
  disabled,
  onSave,
}: {
  quote: QuoteRequest;
  disabled: boolean;
  onSave: (payload: QuotationPayload) => Promise<void>;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [rows, setRows] = useState<QuotationRow[]>(() => quote.items.length
    ? quote.items.map((item) => ({ key: item.id, productId: item.productId?.toString() ?? "", description: item.description, quantity: String(item.quantity), unit: item.unit, unitPrice: String(item.unitPrice) }))
    : [{ key: Date.now(), productId: "", description: quote.productNeed, quantity: String(quote.expectedQuantityKg ?? 1), unit: "kg", unitPrice: "" }]);
  const [discount, setDiscount] = useState(String(quote.discountAmount || 0));
  const [validUntil, setValidUntil] = useState(toLocalDateTime(quote.validUntil ? new Date(quote.validUntil) : new Date(Date.now() + 7 * 86400000)));
  const [salesNote, setSalesNote] = useState(quote.salesNote ?? "");

  useEffect(() => {
    void adminApi.products({ isB2b: true }).then(setProducts);
  }, []);

  const subtotal = rows.reduce((sum, row) => sum + Number(row.quantity || 0) * Number(row.unitPrice || 0), 0);

  function updateRow(key: number, patch: Partial<QuotationRow>) {
    setRows((current) => current.map((row) => row.key === key ? { ...row, ...patch } : row));
  }

  function chooseProduct(row: QuotationRow, productId: string) {
    const product = products.find((item) => item.id === Number(productId));
    updateRow(row.key, {
      productId,
      description: product?.name ?? row.description,
      unit: product?.unit ?? row.unit,
      unitPrice: product?.price == null ? row.unitPrice : String(product.price),
    });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    await onSave({
      items: rows.map((row) => ({
        productId: row.productId ? Number(row.productId) : undefined,
        description: row.description,
        quantity: Number(row.quantity),
        unit: row.unit,
        unitPrice: Number(row.unitPrice),
      })),
      discountAmount: Number(discount || 0),
      validUntil: new Date(validUntil).toISOString(),
      salesNote: salesNote.trim() || undefined,
    });
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-[#E8D3C7] bg-[#FAF9F6] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-black text-[#553B2F]">Chi tiết báo giá</h3>
          <p className="text-xs font-semibold text-[#7a5547]">Chọn sản phẩm, đơn giá và điều kiện trước khi gửi khách hàng.</p>
        </div>
        <Button type="button" variant="outline" className="h-8 border-[#C7A792] px-2 text-xs" onClick={() => setRows((current) => [...current, { key: Date.now(), productId: "", description: "", quantity: "1", unit: "kg", unitPrice: "" }])}>
          <Plus size={14} /> Dòng hàng
        </Button>
      </div>

      <div className="mt-4 space-y-3">
        {rows.map((row) => (
          <div key={row.key} className="grid gap-2 rounded-lg border border-[#E8D3C7] bg-white p-3 sm:grid-cols-2">
            <select className="h-10 rounded-md border border-[#E8D3C7] px-2 text-sm" value={row.productId} onChange={(event) => chooseProduct(row, event.target.value)}>
              <option value="">Sản phẩm tùy chỉnh</option>
              {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
            </select>
            <input required className="h-10 rounded-md border border-[#E8D3C7] px-3 text-sm" placeholder="Mô tả sản phẩm" value={row.description} onChange={(event) => updateRow(row.key, { description: event.target.value })} />
            <div className="grid grid-cols-[1fr_92px] gap-2"><input required min="1" type="number" className="h-10 min-w-0 rounded-md border border-[#E8D3C7] px-3 text-sm" placeholder="Số lượng" value={row.quantity} onChange={(event) => updateRow(row.key, { quantity: event.target.value })} /><input required className="h-10 min-w-0 rounded-md border border-[#E8D3C7] px-3 text-sm" placeholder="Đơn vị" value={row.unit} onChange={(event) => updateRow(row.key, { unit: event.target.value })} /></div>
            <div className="flex gap-2"><input required min="0" type="number" className="h-10 min-w-0 flex-1 rounded-md border border-[#E8D3C7] px-3 text-sm" placeholder="Đơn giá" value={row.unitPrice} onChange={(event) => updateRow(row.key, { unitPrice: event.target.value })} /><Button type="button" size="icon" variant="outline" disabled={rows.length === 1} onClick={() => setRows((current) => current.filter((item) => item.key !== row.key))}><Trash2 size={15} /></Button></div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-bold text-[#553B2F]">Chiết khấu (đ)<input min="0" type="number" className="mt-1 h-10 w-full rounded-md border border-[#E8D3C7] px-3 text-sm" value={discount} onChange={(event) => setDiscount(event.target.value)} /></label>
        <label className="text-xs font-bold text-[#553B2F]">Hiệu lực đến<input required type="datetime-local" className="mt-1 h-10 w-full rounded-md border border-[#E8D3C7] px-3 text-sm" value={validUntil} onChange={(event) => setValidUntil(event.target.value)} /></label>
      </div>
      <textarea className="mt-3 min-h-20 w-full rounded-md border border-[#E8D3C7] p-3 text-sm" placeholder="Điều kiện giao hàng, thanh toán, công nợ..." value={salesNote} onChange={(event) => setSalesNote(event.target.value)} />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#E8D3C7] pt-4"><div className="text-sm"><span className="text-[#7a5547]">Tổng báo giá: </span><strong className="text-[#553B2F]">{formatCurrency(Math.max(0, subtotal - Number(discount || 0)))}</strong></div><Button disabled={disabled} className="bg-[#553B2F] text-white hover:bg-[#3f2a21]">{disabled ? "Đang lưu..." : "Lưu và gửi báo giá"}</Button></div>
    </form>
  );
}
