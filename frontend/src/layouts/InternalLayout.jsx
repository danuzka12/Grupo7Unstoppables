import { useNavigate, useLocation } from 'react-router-dom'
import '../styles/internal.css'

const menuItems = [
  { label: 'Dashboard',                    path: '/dashboard' },
  { label: 'Registro de disciplinas',      path: '/disciplinas' },
  { label: 'Creación de eventos',          path: '/eventos' },
  { label: 'Inscripción de equipos',       path: '/equipos' },
  { label: 'Inscripción de participantes', path: '/participantes' },
  { label: 'Sorteo y asignación',          path: '/sorteo' },
  { label: 'Programación de partidos',     path: '/partidos' },
  { label: 'Resultados',                   path: '/resultados' },
  { label: 'Gestión de usuarios',          path: '/usuarios' },
]

function InternalLayout({ children, titulo, subtitulo }) {
  const navigate  = useNavigate()
  const location  = useLocation()

  // Leer datos del usuario desde sessionStorage
  const usuarioRaw = sessionStorage.getItem('usuario')
  const usuario = usuarioRaw ? JSON.parse(usuarioRaw) : null

  const nombreCompleto = usuario
    ? `${usuario.nombres} ${usuario.apellidos}`
    : 'Usuario'

  const iniciales = usuario
    ? `${usuario.nombres?.[0] ?? ''}${usuario.apellidos?.[0] ?? ''}`.toUpperCase()
    : 'U'

  const rolLabel = usuario?.rol ?? ''

  const handleCerrarSesion = () => {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('usuario')
    navigate('/login')
  }

  return (
    <div className="internal-wrap">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo" onClick={() => navigate('/dashboard')}>
          <div className="sidebar-logo-mark"></div>
          <div className="sidebar-logo-texts">
            <span className="sidebar-logo-main">OlimpiadasSOA</span>
            <span className="sidebar-logo-sub">Panel de gestión</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <p className="sidebar-nav-label">Servicios</p>
          {menuItems.map((item) => (
            <button
              key={item.path}
              className={`sidebar-item ${location.pathname === item.path ? 'sidebar-item-active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="sidebar-item-dot"></span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{iniciales}</div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{nombreCompleto}</span>
              <span className="sidebar-user-role">{rolLabel}</span>
            </div>
          </div>
          <button className="btn-salir" onClick={handleCerrarSesion}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO */}
      <main className="internal-main">
        <div className="internal-topbar">
          <div>
            <h1 className="internal-titulo">{titulo}</h1>
            {subtitulo && <p className="internal-subtitulo">{subtitulo}</p>}
          </div>
        </div>
        <div className="internal-content">
          {children}
        </div>
      </main>

    </div>
  )
}

export default InternalLayout