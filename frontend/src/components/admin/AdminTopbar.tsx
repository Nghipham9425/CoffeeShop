import { Home, Menu, X } from "lucide-react"
import { NavLink } from "react-router-dom"

export function AdminTopbar({
  onMenuClick,
  isMenuOpen,
}: {
  onMenuClick: () => void
  isMenuOpen: boolean
}) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-[#eadfd6] bg-white/92 px-4 backdrop-blur md:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="grid h-10 w-10 place-items-center rounded-full border border-[#eadfd6] text-[#4c3025] hover:bg-[#fbf5ef] lg:hidden"
        aria-label={isMenuOpen ? "Đóng menu quản trị" : "Mở menu quản trị"}
      >
        {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      <NavLink
        to="/"
        className="flex items-center gap-2 text-sm font-black text-[#4c3025] transition hover:text-[#9a6444]"
      >
        <Home size={17} />
        <span className="hidden sm:inline">Xem website</span>
        <span className="sm:hidden">Website</span>
      </NavLink>
    </header>
  )
}
