import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "../ui/card";

export function AdminMetricCard({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="rounded-xl border-[#E8D3C7] bg-white shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#E8D3C7] text-[#553B2F]">
            <Icon size={21} />
          </span>
          <span className="rounded-full bg-[#553B2F] px-2.5 py-1 text-xs font-black text-white">{helper}</span>
        </div>
        <p className="mt-5 text-sm font-bold text-[#AA7864]">{label}</p>
        <p className="mt-2 text-3xl font-black text-[#553B2F]">{value}</p>
      </CardContent>
    </Card>
  );
}
