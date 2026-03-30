import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { createRestaurant, getRestaurantById, updateRestaurant } from '../services/api/restaurants'
import type { RestaurantCreateInput } from '../types'

type Props = {
  restaurantId?: number
  onSaved: (id: number) => void
  onCancel: () => void
}

type FormState = {
  ownerId: string
  name: string
  address: string
  latitude: string
  longitude: string
  openingTime: string
  closingTime: string
  imageUrl: string
  isOpen: boolean
}

type FormErrors = Partial<Record<'name' | 'latitude' | 'longitude', string>>

const emptyForm: FormState = {
  ownerId: '1',
  name: '',
  address: '',
  latitude: '0',
  longitude: '0',
  openingTime: '07:00',
  closingTime: '22:00',
  imageUrl: '',
  isOpen: true,
}

function normalizeTime(value: string) {
  return value.length === 5 ? `${value}:00` : value
}

function trimSeconds(value: string) {
  return value.slice(0, 5)
}

function validateForm(form: FormState) {
  const nextErrors: FormErrors = {}
  const latitude = Number(form.latitude)
  const longitude = Number(form.longitude)

  if (!form.name.trim()) {
    nextErrors.name = 'Ten nha hang la bat buoc'
  }

  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    nextErrors.latitude = 'Latitude phai nam trong khoang -90 den 90'
  }

  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    nextErrors.longitude = 'Longitude phai nam trong khoang -180 den 180'
  }

  return nextErrors
}

function buildPayload(form: FormState): RestaurantCreateInput {
  return {
    ownerId: Number(form.ownerId),
    name: form.name.trim(),
    address: form.address.trim(),
    latitude: Number(form.latitude),
    longitude: Number(form.longitude),
    openingTime: normalizeTime(form.openingTime),
    closingTime: normalizeTime(form.closingTime),
    imageUrl: form.imageUrl.trim() || null,
    isOpen: form.isOpen,
  }
}

export default function RestaurantFormPage({ restaurantId, onSaved, onCancel }: Props) {
  const isEditMode = useMemo(() => typeof restaurantId === 'number', [restaurantId])
  const [form, setForm] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!isEditMode || restaurantId === undefined) {
      setForm(emptyForm)
      return
    }

    let ignore = false

    const loadRestaurant = async () => {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const data = await getRestaurantById(restaurantId)
        if (!ignore) {
          setForm({
            ownerId: String(data.ownerId),
            name: data.name,
            address: data.address || '',
            latitude: String(data.latitude),
            longitude: String(data.longitude),
            openingTime: trimSeconds(data.openingTime),
            closingTime: trimSeconds(data.closingTime),
            imageUrl: data.imageUrl || '',
            isOpen: data.isOpen,
          })
        }
      } catch (err) {
        if (!ignore) {
          setErrorMessage(err instanceof Error ? err.message : 'Khong the tai du lieu nha hang')
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    void loadRestaurant()

    return () => {
      ignore = true
    }
  }, [isEditMode, restaurantId])

  const handleInputChange =
    (field: keyof FormState) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = field === 'isOpen' ? event.target.checked : event.target.value
      setForm((prev) => ({ ...prev, [field]: value }))
      setErrors((prev) => ({ ...prev, [field]: undefined }))
      setSubmitMessage(null)
      setErrorMessage(null)
    }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validateForm(form)
    setErrors(nextErrors)
    setSubmitMessage(null)
    setErrorMessage(null)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setIsLoading(true)

    try {
      const payload = buildPayload(form)
      const savedRestaurant =
        isEditMode && restaurantId !== undefined ? await updateRestaurant(restaurantId, payload) : await createRestaurant(payload)
      setSubmitMessage(isEditMode ? 'Cap nhat nha hang thanh cong' : 'Tao nha hang thanh cong')
      onSaved(savedRestaurant.id)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Luu nha hang that bai')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="restaurant-page-shell">
      <div className="restaurant-page-head">
        <div>
          <p className="restaurant-page-kicker">Restaurant Form</p>
          <h1>{isEditMode ? 'Chinh sua nha hang' : 'Tao nha hang moi'}</h1>
          <p className="restaurant-page-subtitle">
            {isEditMode ? 'Du lieu se duoc cap nhat bang `PUT /api/restaurants/:id`.' : 'Du lieu se duoc tao bang `POST /api/restaurants`.'}
          </p>
        </div>
        <button type="button" className="secondary-button" onClick={onCancel}>
          Quay lai
        </button>
      </div>

      <form className="restaurant-form-card" onSubmit={handleSubmit}>
        {submitMessage ? <p className="restaurant-feedback success">{submitMessage}</p> : null}
        {errorMessage ? <p className="restaurant-feedback error">{errorMessage}</p> : null}

        <div className="restaurant-form-grid">
          <label className="form-field">
            <span>Owner ID</span>
            <input type="number" min="1" value={form.ownerId} onChange={handleInputChange('ownerId')} required />
          </label>

          <label className="form-field">
            <span>Ten nha hang</span>
            <input type="text" value={form.name} onChange={handleInputChange('name')} required />
            {errors.name ? <small>{errors.name}</small> : null}
          </label>

          <label className="form-field form-field-full">
            <span>Dia chi</span>
            <input type="text" value={form.address} onChange={handleInputChange('address')} />
          </label>

          <label className="form-field">
            <span>Latitude</span>
            <input type="number" step="0.000001" value={form.latitude} onChange={handleInputChange('latitude')} required />
            {errors.latitude ? <small>{errors.latitude}</small> : null}
          </label>

          <label className="form-field">
            <span>Longitude</span>
            <input type="number" step="0.000001" value={form.longitude} onChange={handleInputChange('longitude')} required />
            {errors.longitude ? <small>{errors.longitude}</small> : null}
          </label>

          <label className="form-field">
            <span>Gio mo cua</span>
            <input type="time" value={form.openingTime} onChange={handleInputChange('openingTime')} required />
          </label>

          <label className="form-field">
            <span>Gio dong cua</span>
            <input type="time" value={form.closingTime} onChange={handleInputChange('closingTime')} required />
          </label>

          <label className="form-field form-field-full">
            <span>Image URL</span>
            <input type="url" value={form.imageUrl} onChange={handleInputChange('imageUrl')} placeholder="https://example.com/restaurant.jpg" />
          </label>

          <label className="form-checkbox">
            <input type="checkbox" checked={form.isOpen} onChange={handleInputChange('isOpen')} />
            <span>Nha hang dang mo cua</span>
          </label>
        </div>

        <div className="restaurant-actions">
          <button type="submit" className="primary-button" disabled={isLoading}>
            {isLoading ? 'Dang luu...' : isEditMode ? 'Cap nhat nha hang' : 'Tao nha hang'}
          </button>
          <button type="button" className="secondary-button" onClick={onCancel} disabled={isLoading}>
            Huy
          </button>
        </div>
      </form>
    </section>
  )
}
