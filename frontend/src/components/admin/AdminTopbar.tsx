import { Home } from "lucide-react";
import { NavLink } from "react-router-dom";

export function AdminTopbar() {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center border-b border-[#eadfd6] bg-white/92 px-4 backdrop-blur md:px-6">
      <NavLink to="/" className="flex items-center gap-2 text-sm font-black text-[#4c3025] transition hover:text-[#9a6444]">
        <Home size={17} />
        Xem website
      </NavLink>
    </header>
  );
}
