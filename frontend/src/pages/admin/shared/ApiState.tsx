export function LoadingState({ label = "Đang tải dữ liệu..." }: { label?: string }) {
  return <div className="p-5 text-sm font-bold text-[#AA7864]">{label}</div>;
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
      {message}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <div className="p-5 text-sm font-bold text-[#AA7864]">{message}</div>;
}
