import { APP_NAME } from '../../constants/app'

export default function Navbar() {
  return (
    <header className="topbar-wrap">
      <nav className="topbar" aria-label="Global navigation">
        <div className="brand-block">
          <span className="brand-dot" aria-hidden="true" />
          <strong>{APP_NAME}</strong>
        </div>

        <ul className="topbar-links">
          <li>
            <a href="/">Trang chu</a>
          </li>
          <li>
            <a href="/restaurants">Quan ly nha hang</a>
          </li>
          <li>
            <a href="#deals">Khuyen mai</a>
          </li>
        </ul>

        <button type="button" className="topbar-cta">
          Dang nhap
        </button>
      </nav>
    </header>
  )
}
