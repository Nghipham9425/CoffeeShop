import { Card, CardContent } from "../../components/ui/card";
import { adminModules } from "../../data/site";

export function AdminPage() {
  return (
    <main className="p-6">
      <h1 className="text-3xl font-black">Dashboard nội bộ</h1>
      <p className="mt-2 text-stone-600">Khu vực này mới quản lý đơn hàng, báo giá, công nợ và vận hành.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        {adminModules.map(([label, value, Icon]) => (
          <Card key={label as string}>
            <CardContent>
              <Icon className="text-[var(--leaf)]" />
              <p className="mt-4 text-sm font-bold text-stone-500">{label as string}</p>
              <p className="mt-2 text-3xl font-black">{value as string}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
