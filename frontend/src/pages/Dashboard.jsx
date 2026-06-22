import { useNavigate } from 'react-router-dom'
import InternalLayout from '../layouts/InternalLayout'
import '../styles/dashboard.css'

const servicios = [
  {
    numero: '01',
    titulo: 'Registro de disciplinas',
    descripcion: 'Registra y configura las disciplinas deportivas, definiendo categorías y reglas básicas.',
    path: '/disciplinas',
    estado: 'Disponible',
  },
  {
    numero: '02',
    titulo: 'Creación de eventos',
    descripcion: 'Crea y configura un evento deportivo con los deportes, condiciones y parámetros necesarios.',
    path: '/eventos',
    estado: 'Disponible',
  },
  {
    numero: '03',
    titulo: 'Inscripción de equipos',
    descripcion: 'Registra equipos en los eventos disponibles, validando condiciones de inscripción.',
    path: '/equipos',
    estado: 'Disponible',
  },
  {
    numero: '04',
    titulo: 'Inscripción de participantes',
    descripcion: 'Registra los jugadores de cada equipo verificando cupos y datos obligatorios.',
    path: '/participantes',
    estado: 'Disponible',
  },
  {
    numero: '05',
    titulo: 'Sorteo y asignación',
    descripcion: 'Distribuye automáticamente los equipos inscritos en grupos o series de forma equitativa.',
    path: '/sorteo',
    estado: 'Disponible',
  },
  {
    numero: '06',
    titulo: 'Programación de partidos',
    descripcion: 'Genera y gestiona el calendario de partidos con fechas, horarios y validación de conflictos.',
    path: '/partidos',
    estado: 'Disponible',
  },
  {
    numero: '07',
    titulo: 'Registro de resultados',
    descripcion: 'Registra resultados, actualiza tablas de posiciones y publica estadísticas en tiempo real.',
    path: '/resultados',
    estado: 'Disponible',
  },
  {
    numero: '08',
    titulo: 'Registro de usuarioss',
    descripcion: 'Registro de usuarios y sus datos de acceso',
    path: '/usuarios',
    estado: 'Disponible',
  },
]

function DashboardPage() {
  const navigate = useNavigate()

  return (
    <InternalLayout
      titulo="Dashboard"
      subtitulo="Selecciona un servicio para comenzar"
    >
      <div className="dashboard">

        <div className="dashboard-resumen">
          <div className="resumen-item">
            <span className="resumen-num">0</span>
            <span className="resumen-label">Disciplinas registradas</span>
          </div>
          <div className="resumen-sep"></div>
          <div className="resumen-item">
            <span className="resumen-num">0</span>
            <span className="resumen-label">Eventos creados</span>
          </div>
          <div className="resumen-sep"></div>
          <div className="resumen-item">
            <span className="resumen-num">0</span>
            <span className="resumen-label">Equipos inscritos</span>
          </div>
          <div className="resumen-sep"></div>
          <div className="resumen-item">
            <span className="resumen-num">0</span>
            <span className="resumen-label">Partidos programados</span>
          </div>
        </div>

        <p className="dashboard-section-label">Servicios disponibles</p>

        <div className="servicios-grid">
          {servicios.map((s) => (
            <div
              key={s.path}
              className={`servicio-card ${s.estado === 'Disponible' ? 'servicio-card-activo' : 'servicio-card-inactivo'}`}
              onClick={() => s.estado === 'Disponible' && navigate(s.path)}
            >
              <div className="servicio-top">
                <span className="servicio-num">{s.numero}</span>
                <span className={`servicio-badge ${s.estado === 'Disponible' ? 'badge-disponible' : 'badge-pronto'}`}>
                  {s.estado}
                </span>
              </div>
              <h3 className="servicio-titulo">{s.titulo}</h3>
              <p className="servicio-desc">{s.descripcion}</p>
              {s.estado === 'Disponible' && (
                <span className="servicio-link">Ir al servicio →</span>
              )}
            </div>
          ))}
        </div>

      </div>
    </InternalLayout>
  )
}

export default DashboardPage