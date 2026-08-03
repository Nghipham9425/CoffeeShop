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
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#9a6444]">Phú Tài Coffee Works · Quản trị</p>
        <h1 className="mt-2 text-3xl font-black text-[#3b2419] md:text-4xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-[#806556] md:text-base">{description}</p>
      </section>
      {children}
    </main>
  );
}
