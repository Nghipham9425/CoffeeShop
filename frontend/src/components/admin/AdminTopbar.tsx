import { Bell, Home, Menu, Search, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "../ui/button";

export function AdminTopbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-[#E8D3C7] bg-[#f8f2ed]/92 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <Button size="icon" variant="outline" className="rounded-lg border-[#C7A792] text-[#553B2F] hover:bg-[#E8D3C7] lg:hidden">
          <Menu size={18} />
        </Button>
        <NavLink to="/" className="hidden items-center gap-2 text-sm font-black text-[#553B2F] md:flex">
          <Home size={17} />
          Website
        </NavLink>
        <div className="relative ml-0 flex-1 md:ml-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#AA7864]" size={17} />
          <input
            className="h-10 w-full rounded-lg border border-[#C7A792] bg-white px-10 text-sm font-semibold text-[#553B2F] outline-none transition placeholder:text-[#AA7864] focus:border-[#553B2F] md:max-w-md"
            placeholder="Tìm đơn hàng, sản phẩm, khách hàng..."
          />
        </div>
        <Button size="icon" variant="outline" className="rounded-lg border-[#C7A792] text-[#553B2F] hover:bg-[#E8D3C7]">
          <Bell size={18} />
        </Button>
        <Button size="icon" variant="outline" className="rounded-lg border-[#C7A792] text-[#553B2F] hover:bg-[#E8D3C7]">
          <Settings size={18} />
        </Button>
      </div>
    </header>
  );
}
