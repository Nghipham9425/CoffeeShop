import { PackageCheck, Truck, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import type { AdminOrder } from "../../lib/adminApi";

const carriers = ["GHN", "Giao Hàng Tiết Kiệm", "Viettel Post", "J&T Express", "Ahamove", "Đơn vị khác"];

function generateTrackingCode(orderCode: string) {
  const orderPart = orderCode.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(-8) || "ORDER";
  const timePart = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `PTG-${orderPart}-${timePart}${randomPart}`;
}

export function ShipmentHandoffDialog({ order, saving, onClose, onSubmit }: { order: AdminOrder; saving?: boolean; onClose: () => void; onSubmit: (payload: { carrier: string; trackingCode: string; note?: string }) => Promise<void> }) {
  const initialCarrier = order.shipment?.carrier && carriers.includes(order.shipment.carrier) ? order.shipment.carrier : "GHN";
  const [carrier, setCarrier] = useState(initialCarrier);
  const [customCarrier, setCustomCarrier] = useState(order.shipment?.carrier && !carriers.includes(order.shipment.carrier) ? order.shipment.carrier : "");
  const [trackingCode] = useState(order.shipment?.trackingCode ?? generateTrackingCode(order.orderCode));
  const [note, setNote] = useState(order.shipment?.note ?? "");
  const actualCarrier = carrier === "Đơn vị khác" ? customCarrier.trim() : carrier;
  const canSubmit = Boolean(actualCarrier && trackingCode.trim());
  const shipmentSummary = useMemo(() => `${order.customerName} · ${order.customerPhone}`, [order.customerName, order.customerPhone]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    await onSubmit({ carrier: actualCarrier, trackingCode: trackingCode.trim().toUpperCase(), note: note.trim() || undefined });
  }

  return <div className="fixed inset-0 z-[60] grid place-items-center bg-black/45 p-4" role="dialog" aria-modal="true" aria-label="Bàn giao đơn vị vận chuyển">
    <form onSubmit={(event) => void submit(event)} className="w-full max-w-xl overflow-hidden rounded-2xl border border-[#E8D3C7] bg-white shadow-2xl">
      <div className="flex items-start justify-between gap-4 bg-[#553B2F] p-5 text-white"><div><p className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-[#e9c9b6]"><Truck size={17} /> Bàn giao vận chuyển</p><h2 className="mt-1 text-xl font-black">Đơn hàng {order.orderCode}</h2><p className="mt-1 text-sm text-white/75">{shipmentSummary}</p></div><button type="button" onClick={onClose} disabled={saving} className="grid h-9 w-9 place-items-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white" aria-label="Đóng"><X size={20} /></button></div>
      <div className="space-y-5 p-5"><div className="rounded-xl border border-[#E8D3C7] bg-[#fdf9f5] p-4"><p className="text-xs font-black uppercase tracking-wide text-[#AA7864]">Bàn giao nội bộ</p><div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs font-bold"><span className="rounded-lg bg-[#eee3da] px-2 py-2 text-[#553B2F]">1. Đơn đã đóng gói</span><span className="rounded-lg bg-[#553B2F] px-2 py-2 text-white">2. Bàn giao vận chuyển</span></div><p className="mt-3 text-xs leading-5 text-[#7A665D]">Hệ thống chỉ lưu thông tin bàn giao. Không tích hợp theo dõi hành trình trực tiếp từ đơn vị vận chuyển.</p></div>
        <label className="block text-sm font-black text-[#553B2F]">Đơn vị vận chuyển<select value={carrier} onChange={(event) => setCarrier(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[#C7A792] bg-white px-3 font-semibold outline-none focus:border-[#553B2F]" required>{carriers.map((item) => <option key={item}>{item}</option>)}</select></label>
        {carrier === "Đơn vị khác" ? <label className="block text-sm font-black text-[#553B2F]">Tên đơn vị vận chuyển<input value={customCarrier} onChange={(event) => setCustomCarrier(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[#C7A792] px-3 font-semibold outline-none focus:border-[#553B2F]" placeholder="Ví dụ: Nhà xe Thành Công" required /></label> : null}
        <label className="block text-sm font-black text-[#553B2F]">Mã vận đơn<input value={trackingCode} readOnly className="mt-2 h-11 w-full cursor-not-allowed rounded-lg border border-[#C7A792] bg-[#f8f2ed] px-3 font-mono text-sm font-bold text-[#553B2F] outline-none" /><p className="mt-2 text-xs font-semibold text-[#7A665D]">Mã vận đơn được hệ thống tự tạo khi lập thông tin bàn giao và không chỉnh sửa thủ công.</p></label>
        <label className="block text-sm font-black text-[#553B2F]">Ghi chú bàn giao <span className="font-semibold text-[#AA7864]">(không bắt buộc)</span><textarea value={note} onChange={(event) => setNote(event.target.value)} className="mt-2 min-h-20 w-full resize-y rounded-lg border border-[#C7A792] p-3 text-sm font-medium outline-none focus:border-[#553B2F]" placeholder="Ví dụ: Giao hàng giờ hành chính, gọi trước khi giao." /></label>
      </div>
      <div className="flex flex-col-reverse gap-2 border-t border-[#E8D3C7] bg-[#fdf9f5] p-4 sm:flex-row sm:justify-end"><Button type="button" variant="outline" onClick={onClose} disabled={saving} className="rounded-lg border-[#C7A792] text-[#553B2F] hover:bg-white">Hủy</Button><Button type="submit" disabled={saving || !canSubmit} className="rounded-lg bg-[#553B2F] text-white hover:bg-[#3c271f]"><PackageCheck size={17} />{saving ? "Đang bàn giao..." : "Xác nhận bàn giao"}</Button></div>
    </form>
  </div>;
}
