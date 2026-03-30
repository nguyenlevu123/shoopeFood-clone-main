import { useEffect, useMemo, useState } from 'react'
import MainLayout from '../layouts/MainLayout'
import HomePage from '../pages/HomePage'
import RestaurantDetailPage from '../pages/RestaurantDetailPage'
import RestaurantFormPage from '../pages/RestaurantFormPage'
import RestaurantListPage from '../pages/RestaurantListPage'

type RouteMatch =
  | { view: 'home' }
  | { view: 'restaurants' }
  | { view: 'restaurant-create' }
  | { view: 'restaurant-detail'; restaurantId: number }
  | { view: 'restaurant-edit'; restaurantId: number }
  | { view: 'not-found' }

function normalizePath(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1)
  }

  return pathname
}

function matchRoute(pathname: string): RouteMatch {
  const path = normalizePath(pathname)

  if (path === '/') {
    return { view: 'home' }
  }

  if (path === '/restaurants') {
    return { view: 'restaurants' }
  }

  if (path === '/restaurants/create') {
    return { view: 'restaurant-create' }
  }

  const editMatch = path.match(/^\/restaurants\/edit\/(\d+)$/)
  if (editMatch) {
    return { view: 'restaurant-edit', restaurantId: Number(editMatch[1]) }
  }

  const detailMatch = path.match(/^\/restaurants\/(\d+)$/)
  if (detailMatch) {
    return { view: 'restaurant-detail', restaurantId: Number(detailMatch[1]) }
  }

  return { view: 'not-found' }
}

export default function AppRouter() {
  const [pathname, setPathname] = useState(() => window.location.pathname)

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname)

    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element)) {
        return
      }

      const anchor = target.closest('a')
      if (!(anchor instanceof HTMLAnchorElement)) {
        return
      }

      const href = anchor.getAttribute('href')
      if (!href || href.startsWith('http') || href.startsWith('#') || anchor.target === '_blank') {
        return
      }

      const url = new URL(href, window.location.origin)
      if (url.origin !== window.location.origin) {
        return
      }

      event.preventDefault()
      window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`)
      setPathname(url.pathname)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    window.addEventListener('popstate', onPopState)
    document.addEventListener('click', onDocumentClick)

    return () => {
      window.removeEventListener('popstate', onPopState)
      document.removeEventListener('click', onDocumentClick)
    }
  }, [])

  const navigate = (to: string) => {
    const nextPath = normalizePath(to)
    if (nextPath === normalizePath(window.location.pathname)) {
      return
    }

    window.history.pushState({}, '', nextPath)
    setPathname(nextPath)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const route = useMemo(() => matchRoute(pathname), [pathname])

  return (
    <MainLayout>
      {route.view === 'home' && <HomePage />}

      {route.view === 'restaurants' && (
        <RestaurantListPage
          onCreate={() => navigate('/restaurants/create')}
          onView={(id) => navigate(`/restaurants/${id}`)}
          onEdit={(id) => navigate(`/restaurants/edit/${id}`)}
        />
      )}

      {route.view === 'restaurant-detail' && (
        <RestaurantDetailPage
          restaurantId={route.restaurantId}
          onBack={() => navigate('/restaurants')}
          onEdit={(id) => navigate(`/restaurants/edit/${id}`)}
        />
      )}

      {(route.view === 'restaurant-create' || route.view === 'restaurant-edit') && (
        <RestaurantFormPage
          restaurantId={route.view === 'restaurant-edit' ? route.restaurantId : undefined}
          onSaved={(id) => navigate(`/restaurants/${id}`)}
          onCancel={() => navigate('/restaurants')}
        />
      )}

      {route.view === 'not-found' && (
        <section className="restaurant-page-shell">
          <div className="restaurant-empty">
            <h2>Khong tim thay trang</h2>
            <p>Duong dan hien tai khong hop le.</p>
            <div className="restaurant-actions">
              <button type="button" className="primary-button" onClick={() => navigate('/')}>
                Trang chu
              </button>
              <button type="button" className="secondary-button" onClick={() => navigate('/restaurants')}>
                Quan ly nha hang
              </button>
            </div>
          </div>
        </section>
      )}
    </MainLayout>
  )
}
