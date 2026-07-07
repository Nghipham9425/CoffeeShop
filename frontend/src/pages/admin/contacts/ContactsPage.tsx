import { useCallback, useEffect, useState } from "react";
import { MailCheck, RotateCw, Trash2 } from "lucide-react";
import { AdminPanel } from "../../../components/admin/AdminPanel";
import { AdminStatusBadge } from "../../../components/admin/AdminStatusBadge";
import { Button } from "../../../components/ui/button";
import { useAdminOutlet } from "../../../layouts/AdminLayout";
import { adminApi, formatDate, type ContactMessage } from "../../../lib/adminApi";
import { EmptyState, ErrorState, LoadingState } from "../shared/ApiState";
import { AdminPageShell } from "../shared/AdminPageShell";

export function ContactsPage() {
  const { token, sessionVersion } = useAdminOutlet();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const loadMessages = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError("");

    try {
      const result = await adminApi.contactMessages(token);
      setMessages(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được liên hệ");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages, sessionVersion]);

  async function toggleRead(message: ContactMessage) {
    if (!token) return;

    setUpdatingId(message.id);
    setError("");

    try {
      const updated = await adminApi.updateContactReadStatus(token, message.id, !message.isRead);
      setMessages((current) => current.map((item) => (item.id === message.id ? updated : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không cập nhật được tin nhắn");
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteMessage(message: ContactMessage) {
    if (!token) return;
    if (!window.confirm(`Xóa tin nhắn của ${message.fullName}?`)) return;

    setUpdatingId(message.id);
    setError("");

    try {
      await adminApi.deleteContactMessage(token, message.id);
      setMessages((current) => current.filter((item) => item.id !== message.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không xóa được tin nhắn");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <AdminPageShell
      title="Chăm sóc khách hàng"
      description="Theo dõi tin nhắn liên hệ từ website và đánh dấu đã đọc khi nhân viên đã xử lý."
    >
      {error ? <ErrorState message={error} /> : null}

      <AdminPanel
        title="Tin nhắn liên hệ"
        description="Các tin nhắn từ khách hàng cần được phản hồi và ghi nhận trạng thái xử lý."
        action={
          <Button onClick={loadMessages} disabled={loading} className="rounded-lg bg-[#553B2F] text-white hover:bg-[#3f2a21]">
            <RotateCw size={16} />
            Tải lại
          </Button>
        }
      >
        {loading ? (
          <LoadingState />
        ) : messages.length ? (
          <div className="divide-y divide-[#E8D3C7]">
            {messages.map((message) => (
              <article key={message.id} className="grid gap-4 p-5 xl:grid-cols-[1fr_1.4fr_auto] xl:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-black text-[#553B2F]">{message.fullName}</h2>
                    <AdminStatusBadge status={message.isRead ? "READ" : "UNREAD"} />
                  </div>
                  <p className="mt-1 text-sm font-semibold text-[#7a5547]">{message.email ?? message.phone ?? "Chưa có liên hệ"}</p>
                  <p className="mt-1 text-xs font-bold text-[#AA7864]">{formatDate(message.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-black text-[#553B2F]">{message.subject ?? "Không có tiêu đề"}</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[#7a5547]">{message.message}</p>
                </div>
                <div className="flex flex-wrap gap-2 xl:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={updatingId === message.id}
                    onClick={() => toggleRead(message)}
                    className="rounded-lg border-[#C7A792] text-[#553B2F] hover:bg-[#E8D3C7]"
                  >
                    <MailCheck size={16} />
                    {message.isRead ? "Đánh dấu chưa đọc" : "Đánh dấu đã đọc"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={updatingId === message.id}
                    onClick={() => deleteMessage(message)}
                    className="rounded-lg border-red-200 text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                    Xóa
                  </Button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState message="Chưa có tin nhắn liên hệ." />
        )}
      </AdminPanel>
    </AdminPageShell>
  );
}
