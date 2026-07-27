import { LoaderCircle, Save, UserRound } from "lucide-react"
import { useEffect, useState, type FormEvent } from "react"
import { Button } from "../../../components/ui/button"
import { adminAuth } from "../../../lib/adminApi"
import { profileApi } from "../../../lib/profileApi"
import { AccountPageShell, Alert } from "./AccountPageShell"

export function ProfilePage() {
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  useEffect(() => {
    void (async () => {
      try {
        const me = await profileApi.me()
        setFullName(me.fullName)
        setPhone(me.phone ?? "")
        setEmail(me.email)
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : "Không tải được thông tin tài khoản.",
        )
      } finally {
        setLoading(false)
      }
    })()
  }, [])
  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError("")
    setSuccess("")
    if (!fullName.trim()) {
      setError("Họ tên không được để trống.")
      return
    }
    setSaving(true)
    try {
      const user = await profileApi.updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim() || null,
      })
      adminAuth.setSession(adminAuth.getToken()!, user)
      setFullName(user.fullName)
      setPhone(user.phone ?? "")
      setSuccess("Đã cập nhật hồ sơ thành công.")
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Cập nhật thất bại.")
    } finally {
      setSaving(false)
    }
  }
  return (
    <AccountPageShell
      title="Thông tin cá nhân"
      description="Cập nhật thông tin cá nhân để đặt hàng nhanh hơn."
    >
      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-stone-100 text-[var(--roast)]">
            <UserRound size={21} />
          </span>
          <div>
            <h2 className="text-xl font-black text-stone-950">
              Hồ sơ tài khoản
            </h2>
            <p className="text-sm text-stone-500">
              Email được bảo vệ và không thể thay đổi.
            </p>
          </div>
        </div>
        {loading ? (
          <div className="grid min-h-64 place-items-center">
            <LoaderCircle className="animate-spin text-stone-500" size={28} />
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
            <Field
              label="Email (không sửa được)"
              value={email}
              onChange={() => undefined}
              type="email"
              disabled
            />
            <Field
              label="Họ và tên"
              value={fullName}
              onChange={setFullName}
              required
            />
            <Field
              label="Số điện thoại"
              value={phone}
              onChange={setPhone}
              placeholder="Ví dụ: 0901234567"
              type="tel"
            />
            {error ? (
              <div className="md:col-span-2">
                <Alert tone="error">{error}</Alert>
              </div>
            ) : null}
            {success ? (
              <div className="md:col-span-2">
                <Alert tone="success">{success}</Alert>
              </div>
            ) : null}
            <div className="md:col-span-2">
              <Button disabled={saving} type="submit">
                {saving ? (
                  "Đang lưu..."
                ) : (
                  <>
                    <Save size={17} /> Lưu thay đổi
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </section>
    </AccountPageShell>
  )
}
function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  disabled,
  required,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-stone-700">
      <span>{label}</span>
      <input
        className="h-11 rounded-xl border border-stone-300 bg-white px-3 font-medium outline-none focus:border-emerald-800 disabled:bg-stone-100 disabled:text-stone-500"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
      />
    </label>
  )
}
