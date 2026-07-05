import { useEffect, useMemo, useState } from "react";
import { FileText, Inbox, Package, Tags } from "lucide-react";
import { AdminMetricCard } from "../../../components/admin/AdminMetricCard";
import { AdminPanel } from "../../../components/admin/AdminPanel";
import { AdminStatusBadge } from "../../../components/admin/AdminStatusBadge";
import { useAdminOutlet } from "../../../layouts/AdminLayout";
import {
  adminApi,
  formatCurrency,
  formatDate,
  type Category,
  type ContactMessage,
  type Product,
  type QuoteRequest,
} from "../../../lib/adminApi";
import { EmptyState, ErrorState, LoadingState } from "../shared/ApiState";
import { AdminPageShell } from "../shared/AdminPageShell";

export function HomePage() {
  const { token, sessionVersion } = useAdminOutlet();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [loadingPublic, setLoadingPublic] = useState(true);
  const [error, setError] = useState("");
  const [protectedError, setProtectedError] = useState("");

  useEffect(() => {
    let alive = true;

    async function loadPublicData() {
      setLoadingPublic(true);
      setError("");

      try {
        const [categoryResult, productResult] = await Promise.all([
          adminApi.categories(),
          adminApi.products(),
        ]);

        if (!alive) return;
        setCategories(categoryResult);
        setProducts(productResult);
      } catch (err) {
        if (alive) setError(err instanceof Error ? err.message : "Không tải được dữ liệu tổng quan");
      } finally {
        if (alive) setLoadingPublic(false);
      }
    }

    loadPublicData();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    async function loadProtectedData() {
      if (!token) return;

      setProtectedError("");

      try {
        const [quoteResult, contactResult] = await Promise.all([
          adminApi.quoteRequests(token),
          adminApi.contactMessages(token),
        ]);

        if (!alive) return;
        setQuotes(quoteResult);
        setContacts(contactResult);
      } catch (err) {
        if (alive) setProtectedError(err instanceof Error ? err.message : "Không tải được dữ liệu quản trị");
      }
    }

    loadProtectedData();
    return () => {
      alive = false;
    };
  }, [token, sessionVersion]);

  const activeQuotes = useMemo(
    () => quotes.filter((quote) => quote.status === "NEW" || quote.status === "CONTACTED").length,
    [quotes],
  );
  const unreadContacts = useMemo(() => contacts.filter((contact) => !contact.isRead).length, [contacts]);

  return (
    <AdminPageShell
      title="Tổng quan quản trị"
      description="Theo dõi nhanh sản phẩm, danh mục, yêu cầu báo giá B2B và tin nhắn liên hệ đang có trong hệ thống."
    >
      {error ? <ErrorState message={error} /> : null}
      {protectedError ? <ErrorState message={protectedError} /> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard label="Sản phẩm" value={String(products.length)} helper="Danh mục hàng" icon={Package} />
        <AdminMetricCard label="Danh mục" value={String(categories.length)} helper="Đang bán" icon={Tags} />
        <AdminMetricCard label="Báo giá cần xử lý" value={String(activeQuotes)} helper="B2B" icon={FileText} />
        <AdminMetricCard label="Tin nhắn chưa đọc" value={String(unreadContacts)} helper="CSKH" icon={Inbox} />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <AdminPanel title="Sản phẩm mới" description="Danh sách sản phẩm mới nhất đang hiển thị trong hệ thống.">
          {loadingPublic ? (
            <LoadingState />
          ) : products.length ? (
            <div className="divide-y divide-[#E8D3C7]">
              {products.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between gap-4 p-5">
                  <div>
                    <p className="font-black text-[#553B2F]">{product.name}</p>
                    <p className="mt-1 text-sm font-semibold text-[#AA7864]">{product.categoryName}</p>
                  </div>
                  <p className="text-sm font-black text-[#553B2F]">{formatCurrency(product.price)}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="Chưa có sản phẩm." />
          )}
        </AdminPanel>

        <AdminPanel title="Yêu cầu báo giá gần đây" description="Các yêu cầu B2B cần đội bán hàng theo dõi và phản hồi.">
          {quotes.length ? (
            <div className="divide-y divide-[#E8D3C7]">
              {quotes.slice(0, 5).map((quote) => (
                <div key={quote.id} className="flex items-start justify-between gap-4 p-5">
                  <div>
                    <p className="font-black text-[#553B2F]">{quote.companyName}</p>
                    <p className="mt-1 text-sm font-semibold text-[#AA7864]">{quote.productNeed}</p>
                    <p className="mt-1 text-xs font-bold text-[#7a5547]">{formatDate(quote.createdAt)}</p>
                  </div>
                  <AdminStatusBadge status={quote.status} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="Chưa có yêu cầu báo giá." />
          )}
        </AdminPanel>
      </div>
    </AdminPageShell>
  );
}
