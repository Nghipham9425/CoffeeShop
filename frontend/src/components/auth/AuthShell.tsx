import { Coffee } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type AuthShellProps = {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthShell({ icon, eyebrow, title, description, children }: AuthShellProps) {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#dbeaf1] px-5 py-24 text-[#1f1f22]">
      <div className="pointer-events-none absolute -bottom-[52rem] left-1/2 h-[72rem] w-[72rem] -translate-x-1/2 rounded-full border border-white/70" />
      <div className="pointer-events-none absolute -bottom-[40rem] left-1/2 h-[56rem] w-[56rem] -translate-x-1/2 rounded-full border border-white/60" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-white/25 blur-3xl" />

      <Link to="/" className="absolute left-6 top-6 z-10 flex items-center gap-3 text-[#2d211d] md:left-10 md:top-8">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#2d211d] text-[#f0ddce] shadow-lg shadow-[#2d211d]/20">
          <Coffee size={23} />
        </span>
        <span>
          <span className="block text-lg font-black tracking-tight">Phú Tài</span>
          <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-[#6a554a]">Coffee Works</span>
        </span>
      </Link>

      <section className="relative z-10 w-full max-w-[460px] rounded-[28px] border border-white/80 bg-white/80 p-7 shadow-2xl shadow-[#6f8e9d]/20 backdrop-blur-md md:p-9">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-[24px] border border-white bg-white/90 text-[#553B2F] shadow-lg shadow-[#6f8e9d]/15">
          {icon}
        </div>
        <div className="mt-7 text-center">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#9c725d]">{eyebrow}</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-[#211917]">{title}</h1>
          <p className="mx-auto mt-3 max-w-sm text-sm font-semibold leading-6 text-[#70747c]">{description}</p>
        </div>
        {children}
      </section>
    </main>
  );
}
