import type { LucideIcon } from "lucide-react";

export type StatGridItem = {
  icon: LucideIcon;
  value: string;
  label: string;
};

export function StatsGrid({ items }: { items: StatGridItem[] }) {
  return (
    <div className="mx-auto mt-20 grid max-w-[1400px] gap-12 md:grid-cols-4">
      {items.map(({ value, label, icon: Icon }) => (
        <div key={label} className="text-center">
          <Icon className="mx-auto text-[var(--tan)]" size={76} strokeWidth={1.5} />
          <p className="mt-8 text-7xl font-light text-[var(--ink)]">{value}</p>
          <p className="mt-8 text-lg font-black uppercase leading-7 text-[var(--tan)]">{label}</p>
        </div>
      ))}
    </div>
  );
}
