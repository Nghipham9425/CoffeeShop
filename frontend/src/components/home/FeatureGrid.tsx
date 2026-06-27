import type { LucideIcon } from "lucide-react";

export type FeatureItem = {
  icon: LucideIcon;
  title: string;
  text: string;
};

type FeatureGridProps = {
  items: FeatureItem[];
  columns?: "two" | "three";
  iconTone?: "tan" | "dark";
};

export function FeatureGrid({ items, columns = "two", iconTone = "tan" }: FeatureGridProps) {
  const gridCols = columns === "three" ? "xl:grid-cols-3" : "md:grid-cols-2";

  return (
    <div className={`grid gap-x-16 gap-y-16 md:grid-cols-2 ${gridCols}`}>
      {items.map(({ icon: Icon, title, text }) => (
        <div key={title} className="grid grid-cols-[58px_1fr] gap-6">
          <span
            className={
              iconTone === "dark"
                ? "grid h-14 w-14 place-items-center rounded-full border-2 border-stone-700 text-stone-800"
                : "text-[var(--tan)]"
            }
          >
            <Icon size={iconTone === "dark" ? 28 : 52} strokeWidth={1.6} />
          </span>
          <div>
            <h3 className="hm-heading text-2xl font-black leading-tight text-[var(--ink)]">{title}</h3>
            <p className="mt-5 text-lg leading-8 text-stone-700">{text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
