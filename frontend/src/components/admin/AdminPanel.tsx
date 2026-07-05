import type { ReactNode } from "react";
import { Card, CardContent } from "../ui/card";

export function AdminPanel({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="rounded-xl border-[#E8D3C7] bg-white shadow-sm">
      <CardContent className="p-0">
        <div className="flex flex-col gap-3 border-b border-[#E8D3C7] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-[#553B2F]">{title}</h2>
            {description ? <p className="mt-1 text-sm font-semibold text-[#AA7864]">{description}</p> : null}
          </div>
          {action}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
