import { useCallback, useEffect, useState } from "react";
import { RotateCw } from "lucide-react";
import { AdminPanel } from "../../../components/admin/AdminPanel";
import { AdminStatusBadge } from "../../../components/admin/AdminStatusBadge";
import { Button } from "../../../components/ui/button";
import { useAdminOutlet } from "../../../layouts/AdminLayout";
import { adminApi, formatDate, type QuoteRequest } from "../../../lib/adminApi";
import { EmptyState, ErrorState, LoadingState } from "../shared/ApiState";
import { AdminPageShell } from "../shared/AdminPageShell";

const quoteStatuses: QuoteRequest["status"][] = ["NEW", "CONTACTED", "QUOTED", "CLOSED", "CANCELLED"];

export function QuotesPage() {
  const { token, sessionVersion } = useAdminOutlet();
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const loadQuotes = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError("");

    try {
      const result = await adminApi.quoteRequests(token);
      setQuotes(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được báo giá");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadQuotes();
  }, [loadQuotes, sessionVersion]);

  async function updateStatus(id: number, status: QuoteRequest["status"]) {
    if (!token) return;

    setUpdatingId(id);
    setError("");

    try {
      const updated = await adminApi.updateQuoteStatus(token, id, status);
      setQuotes((current) => current.map((quote) => (quote.id === id ? updated : quote)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không cập nhật được trạng thái báo giá");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <AdminPageShell
      title="Yêu cầu báo giá B2B"
      description="Tiếp nhận nhu cầu rang gia công, OEM/private label và cập nhật trạng thái xử lý cho đội bán hàng."
    >
      {error ? <ErrorState message={error} /> : null}

      <AdminPanel
        title="Danh sách báo giá"
        description="Các yêu cầu từ khách doanh nghiệp cần được liên hệ, báo giá và chốt trạng thái rõ ràng."
        action={
          <Button onClick={loadQuotes} disabled={loading} className="rounded-lg bg-[#553B2F] text-white hover:bg-[#3f2a21]">
            <RotateCw size={16} />
            Tải lại
          </Button>
        }
      >
        {loading ? (
          <LoadingState />
        ) : quotes.length ? (
          <div className="divide-y divide-[#E8D3C7]">
            {quotes.map((quote) => (
              <article key={quote.id} className="grid gap-4 p-5 xl:grid-cols-[1.3fr_1fr_auto] xl:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-black text-[#553B2F]">{quote.companyName}</h2>
                    <AdminStatusBadge status={quote.status} />
                  </div>
                  <p className="mt-1 text-sm font-bold text-[#7a5547]">
                    {quote.contactName} • {quote.phoneOrEmail}
                  </p>
                  <p className="mt-1 text-xs font-bold text-[#AA7864]">{formatDate(quote.createdAt)}</p>
                </div>
                <div className="text-sm font-semibold leading-6 text-[#553B2F]">
                  <p>Nhu cầu: {quote.productNeed}</p>
                  <p>Số lượng dự kiến: {quote.expectedQuantityKg ? `${quote.expectedQuantityKg} kg` : "Chưa ghi"}</p>
                  {quote.note ? <p>Ghi chú: {quote.note}</p> : null}
                </div>
                <div className="flex flex-wrap gap-2 xl:justify-end">
                  {quoteStatuses.map((status) => (
                    <Button
                      key={status}
                      type="button"
                      variant="outline"
                      disabled={updatingId === quote.id || quote.status === status}
                      onClick={() => updateStatus(quote.id, status)}
                      className="h-9 rounded-lg border-[#C7A792] px-3 text-xs text-[#553B2F] hover:bg-[#E8D3C7]"
                    >
                      <AdminStatusBadge status={status} />
                    </Button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState message="Chưa có yêu cầu báo giá." />
        )}
      </AdminPanel>
    </AdminPageShell>
  );
}
