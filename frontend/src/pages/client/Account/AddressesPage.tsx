import { LoaderCircle, MapPin, Pencil, Plus, Save, Trash2 } from "lucide-react"
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react"
import { Button } from "../../../components/ui/button"
import { locationApi, type AdministrativeUnit } from "../../../lib/locationApi"
import {
  profileApi,
  type AddressPayload,
  type ProfileAddress,
} from "../../../lib/profileApi"
import { AccountPageShell, Alert } from "./AccountPageShell"

const emptyForm: AddressPayload = {
  receiverName: "",
  phone: "",
  province: "",
  district: "",
  ward: "",
  detail: "",
  isDefault: false,
}
export function AddressesPage() {
  const [addresses, setAddresses] = useState<ProfileAddress[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<ProfileAddress | null>(null)
  const [form, setForm] = useState<AddressPayload>(emptyForm)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  async function load() {
    setLoading(true)
    try {
      const me = await profileApi.me()
      setAddresses(me.addresses)
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Không tải được danh sách địa chỉ.",
      )
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    void load()
  }, [])
  function openNew() {
    setForm(emptyForm)
    setEditing(null)
    setShowForm(true)
    setError("")
    setSuccess("")
  }
  function openEdit(address: ProfileAddress) {
    setEditing(address)
    setForm({
      receiverName: address.receiverName,
      phone: address.phone,
      province: address.province,
      district: address.district,
      ward: address.ward,
      detail: address.detail,
      isDefault: address.isDefault,
    })
    setShowForm(true)
    setError("")
    setSuccess("")
  }
  function closeForm() {
    setEditing(null)
    setForm(emptyForm)
    setShowForm(false)
  }
  async function submit(event: FormEvent) {
    event.preventDefault()
    setError("")
    setSuccess("")
    if (
      !form.receiverName.trim() ||
      !form.phone.trim() ||
      !form.detail.trim()
    ) {
      setError("Vui lòng nhập người nhận, số điện thoại và địa chỉ đầy đủ.")
      return
    }
    if (!form.province.trim() || !form.district.trim() || !form.ward.trim()) {
      setError("Vui lòng nhập đầy đủ Phường/Xã, Quận/Huyện và Tỉnh/Thành phố.")
      return
    }
    setSaving(true)
    try {
      if (editing) await profileApi.updateAddress(editing.id, clean(form))
      else await profileApi.createAddress(clean(form))
      setSuccess(
        editing
          ? "Đã cập nhật địa chỉ thành công."
          : "Đã thêm địa chỉ mới thành công.",
      )
      closeForm()
      await load()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Lưu địa chỉ thất bại.")
    } finally {
      setSaving(false)
    }
  }
  async function remove(address: ProfileAddress) {
    if (!window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) return
    setSaving(true)
    try {
      await profileApi.deleteAddress(address.id)
      setSuccess("Đã xóa địa chỉ.")
      await load()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Xóa địa chỉ thất bại.")
    } finally {
      setSaving(false)
    }
  }
  return (
    <AccountPageShell
      title="Sổ địa chỉ"
      description="Quản lý địa chỉ nhận hàng của bạn."
    >
      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-stone-100 text-[var(--roast)]">
              <MapPin size={21} />
            </span>
            <div>
              <h2 className="text-xl font-black text-stone-950">
                Địa chỉ nhận hàng
              </h2>
              <p className="text-sm text-stone-500">
                Chọn một địa chỉ mặc định để đặt hàng nhanh.
              </p>
            </div>
          </div>
          {!showForm ? (
            <Button onClick={openNew}>
              <Plus size={17} /> Thêm địa chỉ
            </Button>
          ) : null}
        </div>
        {error ? (
          <div className="mt-5">
            <Alert tone="error">{error}</Alert>
          </div>
        ) : null}
        {success ? (
          <div className="mt-5">
            <Alert tone="success">{success}</Alert>
          </div>
        ) : null}
        {showForm ? (
          <AddressForm
            form={form}
            setForm={setForm}
            editing={Boolean(editing)}
            saving={saving}
            onSubmit={submit}
            onCancel={closeForm}
          />
        ) : null}
        {loading ? (
          <div className="grid min-h-52 place-items-center">
            <LoaderCircle className="animate-spin text-stone-500" size={28} />
          </div>
        ) : addresses.length ? (
          <div className="mt-6 space-y-4">
            {addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                onEdit={() => openEdit(address)}
                onDelete={() => void remove(address)}
              />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-dashed border-stone-300 bg-stone-50 p-8 text-center">
            <p className="text-stone-600">Bạn chưa có địa chỉ nào.</p>
            <Button className="mt-4" onClick={openNew}>
              <Plus size={17} /> Thêm địa chỉ đầu tiên
            </Button>
          </div>
        )}
      </section>
    </AccountPageShell>
  )
}
function clean(form: AddressPayload): AddressPayload {
  return {
    ...form,
    receiverName: form.receiverName.trim(),
    phone: form.phone.trim(),
    province: form.province.trim(),
    district: form.district.trim(),
    ward: form.ward.trim(),
    detail: form.detail.trim(),
  }
}
function AddressForm({
  form,
  setForm,
  editing,
  saving,
  onSubmit,
  onCancel,
}: {
  form: AddressPayload
  setForm: Dispatch<SetStateAction<AddressPayload>>
  editing: boolean
  saving: boolean
  onSubmit: (event: FormEvent) => void
  onCancel: () => void
}) {
  const [provinces, setProvinces] = useState<AdministrativeUnit[]>([])
  const [districts, setDistricts] = useState<AdministrativeUnit[]>([])
  const [wards, setWards] = useState<AdministrativeUnit[]>([])
  const [locationError, setLocationError] = useState("")
  const [loadingProvinces, setLoadingProvinces] = useState(true)
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [loadingWards, setLoadingWards] = useState(false)

  const set = (key: keyof AddressPayload, value: string | boolean) =>
    setForm((current) => ({ ...current, [key]: value }))
  const selectedProvince = provinces.find(
    (province) => province.name === form.province,
  )
  const selectedDistrict = districts.find(
    (district) => district.name === form.district,
  )

  useEffect(() => {
    void (async () => {
      setLoadingProvinces(true)
      try {
        setProvinces(await locationApi.provinces())
      } catch (cause) {
        setLocationError(
          cause instanceof Error
            ? cause.message
            : "Không thể tải tỉnh/thành phố.",
        )
      } finally {
        setLoadingProvinces(false)
      }
    })()
  }, [])

  useEffect(() => {
    if (!selectedProvince) {
      setDistricts([])
      setWards([])
      return
    }
    void (async () => {
      setLoadingDistricts(true)
      setLocationError("")
      try {
        setDistricts(await locationApi.districts(selectedProvince.code))
      } catch (cause) {
        setLocationError(
          cause instanceof Error ? cause.message : "Không thể tải quận/huyện.",
        )
      } finally {
        setLoadingDistricts(false)
      }
    })()
  }, [selectedProvince?.code])

  useEffect(() => {
    if (!selectedDistrict) {
      setWards([])
      return
    }
    void (async () => {
      setLoadingWards(true)
      setLocationError("")
      try {
        setWards(await locationApi.wards(selectedDistrict.code))
      } catch (cause) {
        setLocationError(
          cause instanceof Error ? cause.message : "Không thể tải phường/xã.",
        )
      } finally {
        setLoadingWards(false)
      }
    })()
  }, [selectedDistrict?.code])

  return (
    <form
      onSubmit={onSubmit}
      className="mt-6 rounded-xl border border-stone-200 bg-stone-50 p-4"
    >
      <h3 className="text-lg font-black text-stone-950">
        {editing ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
      </h3>
      <p className="mt-1 text-sm text-stone-500">
        Chọn tỉnh/thành phố, quận/huyện và phường/xã theo danh mục hành chính.
      </p>
      {locationError ? (
        <p className="mt-3 text-sm font-semibold text-rose-700">
          {locationError}
        </p>
      ) : null}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Field
          label="Người nhận *"
          value={form.receiverName}
          onChange={(value) => set("receiverName", value)}
          placeholder="Trần Phú Tày"
        />
        <Field
          label="Số điện thoại *"
          value={form.phone}
          onChange={(value) => set("phone", value)}
          placeholder="(+___) ___ ___ ___"
        />
        <SelectField
          label="Tỉnh / Thành phố *"
          value={form.province}
          disabled={loadingProvinces}
          placeholder={
            loadingProvinces
              ? "Đang tải tỉnh/thành phố..."
              : "Chọn tỉnh/thành phố"
          }
          options={provinces}
          onChange={(value) =>
            setForm((current) => ({
              ...current,
              province: value,
              district: "",
              ward: "",
            }))
          }
        />
        <SelectField
          label="Quận / Huyện *"
          value={form.district}
          disabled={!selectedProvince || loadingDistricts}
          placeholder={
            loadingDistricts ? "Đang tải quận/huyện..." : "Chọn quận/huyện"
          }
          options={districts}
          onChange={(value) =>
            setForm((current) => ({ ...current, district: value, ward: "" }))
          }
        />
        <SelectField
          label="Phường / Xã *"
          value={form.ward}
          disabled={!selectedDistrict || loadingWards}
          placeholder={
            loadingWards ? "Đang tải phường/xã..." : "Chọn phường/xã"
          }
          options={wards}
          onChange={(value) => set("ward", value)}
        />
        <label className="flex items-center gap-2 self-end pb-3 text-sm font-bold text-stone-700">
          <input
            type="checkbox"
            checked={Boolean(form.isDefault)}
            onChange={(event) => set("isDefault", event.target.checked)}
          />{" "}
          Đặt làm địa chỉ mặc định
        </label>
        <label className="grid gap-2 text-sm font-bold text-stone-700 md:col-span-2">
          <span>Địa chỉ chi tiết *</span>
          <textarea
            className="min-h-24 rounded-xl border border-stone-300 bg-white px-3 py-2 font-medium outline-none focus:border-emerald-800"
            value={form.detail}
            onChange={(event) => set("detail", event.target.value)}
            placeholder="Số nhà, tên đường, tòa nhà..."
          />
        </label>
      </div>
      <div className="mt-5 flex gap-3">
        <Button disabled={saving} type="submit">
          {saving ? (
            "Đang lưu..."
          ) : (
            <>
              <Save size={17} /> {editing ? "Cập nhật" : "Thêm địa chỉ"}
            </>
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
      </div>
    </form>
  )
}

function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder,
  disabled,
}: {
  label: string
  value: string
  options: AdministrativeUnit[]
  onChange: (value: string) => void
  placeholder: string
  disabled?: boolean
}) {
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLLabelElement>(null)

  useEffect(() => {
    if (value) setQuery(value)
  }, [value])

  useEffect(() => {
    const closeWhenClickOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", closeWhenClickOutside)
    return () =>
      document.removeEventListener("mousedown", closeWhenClickOutside)
  }, [])

  const normalizedQuery = normalizeText(query)
  const suggestions = options
    .filter((option) => normalizeText(option.name).includes(normalizedQuery))
    .slice(0, 8)

  function choose(option: AdministrativeUnit) {
    setQuery(option.name)
    onChange(option.name)
    setOpen(false)
  }

  return (
    <label
      ref={rootRef}
      className="relative grid gap-2 text-sm font-bold text-stone-700"
    >
      <span>{label}</span>
      <input
        className="h-11 rounded-xl border border-stone-300 bg-white px-3 font-medium outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-stone-100"
        value={query}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          const nextQuery = event.target.value
          setQuery(nextQuery)
          setOpen(true)
          if (value) onChange("")
        }}
      />
      {open && !disabled ? (
        <div className="absolute left-0 right-0 top-[76px] z-20 max-h-56 overflow-auto rounded-xl border border-stone-200 bg-white p-1 shadow-xl">
          {suggestions.length ? (
            suggestions.map((option) => (
              <button
                key={option.code}
                type="button"
                className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-100 hover:text-[var(--coffee)]"
                onClick={() => choose(option)}
              >
                {option.name}
              </button>
            ))
          ) : (
            <p className="px-3 py-3 text-sm font-medium text-stone-500">
              Không tìm thấy địa danh phù hợp.
            </p>
          )}
        </div>
      ) : null}
    </label>
  )
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
}
function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-stone-700">
      <span>{label}</span>
      <input
        className="h-11 rounded-xl border border-stone-300 bg-white px-3 font-medium outline-none focus:border-emerald-800"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  )
}
function AddressCard({
  address,
  onEdit,
  onDelete,
}: {
  address: ProfileAddress
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${address.isDefault ? "border-emerald-300 bg-emerald-50" : "border-stone-200"}`}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <strong className="text-stone-950">{address.receiverName}</strong>
            <span className="text-sm text-stone-600">{address.phone}</span>
            {address.isDefault ? (
              <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white">
                Mặc định
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-stone-600">
            {address.detail}, {address.ward}, {address.district},{" "}
            {address.province}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="outline"
            aria-label="Sửa địa chỉ"
            onClick={onEdit}
          >
            <Pencil size={16} />
          </Button>
          <Button
            size="icon"
            variant="outline"
            aria-label="Xóa địa chỉ"
            onClick={onDelete}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </div>
  )
}
