import { useEffect, useState } from 'react'
import { deleteRestaurant, getRestaurants, patchRestaurantStatus } from '../services/api/restaurants'
import type { Restaurant } from '../types'

type Props = {
  onCreate: () => void
  onView: (id: number) => void
  onEdit: (id: number) => void
}

function formatTime(value: string) {
  return value?.slice(0, 5) || '--:--'
}

export default function RestaurantListPage({ onCreate, onView, onEdit }: Props) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionId, setActionId] = useState<number | null>(null)

  const loadRestaurants = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await getRestaurants()
      setRestaurants(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Khong the tai danh sach nha hang')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadRestaurants()
  }, [])

  const handleDelete = async (id: number) => {
    if (!window.confirm('Ban chac chan muon xoa nha hang nay?')) {
      return
    }

    setActionId(id)
    setError(null)

    try {
      await deleteRestaurant(id)
      setRestaurants((prev) => prev.filter((item) => item.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xoa nha hang that bai')
    } finally {
      setActionId(null)
    }
  }

  const handleToggleStatus = async (restaurant: Restaurant) => {
    setActionId(restaurant.id)
    setError(null)

    try {
      const updated = await patchRestaurantStatus(restaurant.id, !restaurant.isOpen)
      setRestaurants((prev) => prev.map((item) => (item.id === restaurant.id ? updated : item)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cap nhat trang thai that bai')
    } finally {
      setActionId(null)
    }
  }

  return (
    <section className="restaurant-page-shell">
      <div className="restaurant-page-head">
        <div>
          <p className="restaurant-page-kicker">Restaurant Module</p>
          <h1>Quan ly nha hang</h1>
          <p className="restaurant-page-subtitle">Danh sach duoc lay truc tiep tu API `GET /api/restaurants`.</p>
        </div>
        <button type="button" className="primary-button" onClick={onCreate}>
          Them nha hang
        </button>
      </div>

      {error ? <p className="restaurant-feedback error">{error}</p> : null}
      {isLoading ? <div className="restaurant-empty">Dang tai danh sach nha hang...</div> : null}

      {!isLoading && restaurants.length === 0 ? (
        <div className="restaurant-empty">
          <h2>Chua co nha hang nao</h2>
          <p>Hay tao nha hang dau tien de bat dau quan ly.</p>
        </div>
      ) : null}

      {!isLoading && restaurants.length > 0 ? (
        <div className="restaurant-grid">
          {restaurants.map((restaurant) => (
            <article key={restaurant.id} className="restaurant-admin-card">
              <div className="restaurant-card-image-wrap">
                {restaurant.imageUrl ? (
                  <img src={restaurant.imageUrl} alt={restaurant.name} className="restaurant-card-image" />
                ) : (
                  <div className="restaurant-card-image restaurant-card-image-fallback">No image</div>
                )}
                <span className={`status-tag ${restaurant.isOpen ? 'open' : 'closed'}`}>
                  {restaurant.isOpen ? 'Open' : 'Closed'}
                </span>
              </div>

              <div className="restaurant-card-body">
                <div className="restaurant-card-meta">
                  <strong>{restaurant.ratingAvg.toFixed(1)} sao</strong>
                  <span>ID #{restaurant.id}</span>
                </div>
                <h2>{restaurant.name}</h2>
                <p>{restaurant.address || 'Khong co dia chi'}</p>
                <p>
                  {formatTime(restaurant.openingTime)} - {formatTime(restaurant.closingTime)}
                </p>
              </div>

              <div className="restaurant-actions">
                <button type="button" className="secondary-button" onClick={() => onView(restaurant.id)}>
                  Xem chi tiet
                </button>
                <button type="button" className="secondary-button" onClick={() => onEdit(restaurant.id)}>
                  Sua
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => handleToggleStatus(restaurant)}
                  disabled={actionId === restaurant.id}
                >
                  {restaurant.isOpen ? 'Dong cua' : 'Mo cua'}
                </button>
                <button
                  type="button"
                  className="danger-button"
                  onClick={() => handleDelete(restaurant.id)}
                  disabled={actionId === restaurant.id}
                >
                  Xoa
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  )
}
