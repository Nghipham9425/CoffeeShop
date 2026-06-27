type SectionHeadingProps = {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({ title, subtitle, align = "center", className = "" }: SectionHeadingProps) {
  const alignment = align === "left" ? "text-left" : "text-center";

  return (
    <div className={`${alignment} ${className}`}>
      <h2 className="hm-heading text-5xl font-black uppercase leading-tight text-[var(--ink)]">{title}</h2>
      {subtitle ? (
        <p className="mx-auto mt-7 max-w-4xl text-2xl font-semibold leading-9 text-[var(--tan)]">{subtitle}</p>
      ) : null}
    </div>
  );
}
