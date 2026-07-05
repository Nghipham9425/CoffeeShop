import type { ReactNode } from "react";

export function AdminPageShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="space-y-6 p-4 md:p-6">
      <section>
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#AA7864]">Phú Tài Coffee Works</p>
        <h1 className="mt-2 text-3xl font-black text-[#553B2F] md:text-4xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-[#7a5547] md:text-base">{description}</p>
      </section>
      {children}
    </main>
  );
}
