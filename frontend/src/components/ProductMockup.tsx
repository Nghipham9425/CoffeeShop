import { Coffee } from "lucide-react";

export function ProductMockup({ tone = "from-[#5a2f21] to-[#1f130e]" }: { tone?: string }) {
  return (
    <div className="relative mx-auto h-64 w-48">
      <div className={`coffee-pack absolute inset-0 bg-gradient-to-br ${tone}`} />
      <div className="absolute left-1/2 top-20 w-30 -translate-x-1/2 rounded-3xl bg-white/90 p-4 text-center">
        <Coffee className="mx-auto text-[var(--leaf)]" size={32} />
        <p className="mt-3 text-[11px] font-black uppercase text-stone-950">Phú Tài</p>
      </div>
    </div>
  );
}
