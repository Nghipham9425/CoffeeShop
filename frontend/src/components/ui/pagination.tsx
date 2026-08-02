import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({ page, pageSize, total, onChange }: { page: number; pageSize: number; total: number; onChange: (page: number) => void }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;
  return <div className="flex items-center justify-between gap-3 border-t border-stone-200 px-5 py-4 text-sm">
    <p className="font-medium text-stone-500">Hiển thị {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} / {total}</p>
    <div className="flex items-center gap-2">
      <button type="button" onClick={() => onChange(page - 1)} disabled={page === 1} className="grid h-9 w-9 place-items-center rounded-lg border border-stone-200 text-stone-700 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-stone-50" aria-label="Trang trước"><ChevronLeft size={17} /></button>
      <span className="min-w-20 text-center font-bold text-stone-700">Trang {page}/{totalPages}</span>
      <button type="button" onClick={() => onChange(page + 1)} disabled={page === totalPages} className="grid h-9 w-9 place-items-center rounded-lg border border-stone-200 text-stone-700 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-stone-50" aria-label="Trang sau"><ChevronRight size={17} /></button>
    </div>
  </div>;
}
