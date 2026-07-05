import { CheckCircle2, Hammer } from "lucide-react";
import { AdminPanel } from "../../../components/admin/AdminPanel";
import { adminFallbackPages } from "../../../data/admin";
import { AdminPageShell } from "./AdminPageShell";

export function ResourceNoticePage({ type }: { type: keyof typeof adminFallbackPages }) {
  const page = adminFallbackPages[type];

  return (
    <AdminPageShell title={page.title} description={page.desc}>
      <AdminPanel
        title="Màn hình đã sẵn sàng"
        description="Phần giao diện được đặt đúng vị trí, chờ bổ sung nghiệp vụ backend tương ứng."
        action={
          <span className="inline-flex items-center gap-2 rounded-full bg-[#E8D3C7] px-3 py-1 text-xs font-black text-[#553B2F]">
            <Hammer size={14} />
            Chờ nghiệp vụ
          </span>
        }
      >
        <div className="grid gap-3 p-5 md:grid-cols-3">
          {page.tasks.map((task) => (
            <div key={task} className="flex items-center gap-3 rounded-xl border border-[#E8D3C7] bg-[#fbf7f4] p-4">
              <CheckCircle2 className="text-[#AA7864]" size={20} />
              <span className="text-sm font-black text-[#553B2F]">{task}</span>
            </div>
          ))}
        </div>
      </AdminPanel>
    </AdminPageShell>
  );
}
