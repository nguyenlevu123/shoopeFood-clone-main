import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { getRestaurantById } from '../services/api/restaurants'
import type { Restaurant } from '../types'

type Props = {
  restaurantId: number
  onBack: () => void
  onEdit: (id: number) => void
}

const MapContainerAny: any = MapContainer
const MarkerAny: any = Marker
const TileLayerAny: any = TileLayer

function formatTime(value: string) {
  return value?.slice(0, 5) || '--:--'
}

export default function RestaurantDetailPage({ restaurantId, onBack, onEdit }: Props) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    const loadRestaurant = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const data = await getRestaurantById(restaurantId)
        if (!ignore) {
          setRestaurant(data)
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Khong the tai chi tiet nha hang')
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
  }, [restaurantId])

  const position = useMemo<[number, number]>(() => {
    if (!restaurant) {
      return [10.77689, 106.70081]
    }

    return [restaurant.latitude, restaurant.longitude]
  }, [restaurant])

  if (isLoading) {
    return (
      <section className="restaurant-page-shell">
        <div className="restaurant-empty">Dang tai chi tiet nha hang...</div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="restaurant-page-shell">
        <div className="restaurant-empty">
          <p className="restaurant-feedback error">{error}</p>
          <button type="button" className="secondary-button" onClick={onBack}>
            Quay lai danh sach
          </button>
        </div>
      </section>
    )
  }

  if (!restaurant) {
    return (
      <section className="restaurant-page-shell">
        <div className="restaurant-empty">
          <h2>Khong tim thay nha hang</h2>
          <button type="button" className="secondary-button" onClick={onBack}>
            Quay lai danh sach
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="restaurant-page-shell">
      <div className="restaurant-page-head">
        <div>
          <p className="restaurant-page-kicker">Restaurant Detail</p>
          <h1>{restaurant.name}</h1>
          <p className="restaurant-page-subtitle">{restaurant.address || 'Khong co dia chi'}</p>
        </div>
        <div className="restaurant-actions">
          <button type="button" className="secondary-button" onClick={onBack}>
            Quay lai
          </button>
          <button type="button" className="primary-button" onClick={() => onEdit(restaurant.id)}>
            Sua nha hang
          </button>
        </div>
      </div>

      <div className="restaurant-detail-grid">
        <article className="restaurant-detail-card">
          {restaurant.imageUrl ? (
            <img src={restaurant.imageUrl} alt={restaurant.name} className="restaurant-detail-image" />
          ) : (
            <div className="restaurant-card-image restaurant-card-image-fallback restaurant-detail-image">No image</div>
          )}

          <div className="restaurant-detail-info">
            <div className="restaurant-card-meta">
              <strong>{restaurant.ratingAvg.toFixed(1)} sao</strong>
              <span className={`status-tag ${restaurant.isOpen ? 'open' : 'closed'}`}>
                {restaurant.isOpen ? 'Open' : 'Closed'}
              </span>
            </div>
            <dl className="restaurant-detail-list">
              <div>
                <dt>Dia chi</dt>
                <dd>{restaurant.address || 'Khong co dia chi'}</dd>
              </div>
              <div>
                <dt>Gio mo cua</dt>
                <dd>{formatTime(restaurant.openingTime)}</dd>
              </div>
              <div>
                <dt>Gio dong cua</dt>
                <dd>{formatTime(restaurant.closingTime)}</dd>
              </div>
              <div>
                <dt>Trang thai</dt>
                <dd>{restaurant.isOpen ? 'Dang mo cua' : 'Tam dong cua'}</dd>
              </div>
              <div>
                <dt>Latitude</dt>
                <dd>{restaurant.latitude}</dd>
              </div>
              <div>
                <dt>Longitude</dt>
                <dd>{restaurant.longitude}</dd>
              </div>
            </dl>
          </div>
        </article>

        <aside className="restaurant-map-card">
          <div className="map-head">
            <h2>Vi tri nha hang</h2>
            <p>Leaflet render tu latitude/longitude cua backend.</p>
          </div>
          <div className="map-wrap" role="img" aria-label={`Ban do cua ${restaurant.name}`}>
            <MapContainerAny center={position} zoom={15} scrollWheelZoom>
              <TileLayerAny
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MarkerAny position={position}>
                <Popup>
                  <strong>{restaurant.name}</strong>
                  <br />
                  {restaurant.address || 'Khong co dia chi'}
                </Popup>
              </MarkerAny>
            </MapContainerAny>
          </div>
        </aside>
      </div>
    </section>
  )
}
