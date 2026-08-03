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
    <Card className="rounded-lg border-[#dfcec0] bg-white shadow-sm">
      <CardContent className="p-0">
        <div className="flex flex-col gap-3 border-b border-[#eadfd6] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-[#3b2419]">{title}</h2>
            {description ? <p className="mt-1 text-sm font-medium text-[#806556]">{description}</p> : null}
          </div>
          {action}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
