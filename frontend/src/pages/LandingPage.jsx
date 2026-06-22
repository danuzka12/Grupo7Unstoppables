import { useNavigate } from 'react-router-dom'
import '../styles/landing.css'

const proximosEventos = [
  { fecha: '02 Jun', disciplina: 'Fútbol masculino', categoria: 'Sub-18', sede: 'Estadio Central' },
  { fecha: '05 Jun', disciplina: 'Atletismo', categoria: 'Abierto', sede: 'Pista Olímpica' },
  { fecha: '08 Jun', disciplina: 'Baloncesto femenino', categoria: 'Sub-20', sede: 'Coliseo Norte' },
  { fecha: '10 Jun', disciplina: 'Natación', categoria: 'Abierto', sede: 'Piscina Municipal' },
]

const disciplinas = [
  'Fútbol', 'Baloncesto', 'Atletismo', 'Natación',
  'Voleibol', 'Tenis de mesa', 'Ajedrez', 'Ciclismo',
]

const tablaPosiciones = [
  { pos: 1, institucion: 'Institución A', pts: 38, oro: 5, plata: 3, bronce: 2 },
  { pos: 2, institucion: 'Institución B', pts: 31, oro: 4, plata: 2, bronce: 4 },
  { pos: 3, institucion: 'Institución C', pts: 27, oro: 3, plata: 4, bronce: 1 },
  { pos: 4, institucion: 'Institución D', pts: 19, oro: 2, plata: 1, bronce: 3 },
]

const resultados = [
  { disciplina: 'Fútbol masculino', equipoA: 'Equipo Norte', marcA: 3, marcB: 1, equipoB: 'Equipo Sur', estado: 'Finalizado' },
  { disciplina: 'Baloncesto', equipoA: 'Equipo Este', marcA: 74, marcB: 68, equipoB: 'Equipo Oeste', estado: 'Finalizado' },
  { disciplina: 'Voleibol femenino', equipoA: 'Equipo A', marcA: 2, marcB: 1, equipoB: 'Equipo B', estado: 'Finalizado' },
]

function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="landing">

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="navbar-logo">
          <span className="logo-mark"></span>
          <div className="logo-texts">
            <span className="logo-main">Olimpiadas Deportivas</span>
            <span className="logo-sub">Portal público de resultados</span>
          </div>
        </div>
        <button className="btn-acceso" onClick={() => navigate('/login')}>
          Acceso institucional
        </button>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <p className="hero-eyebrow">Edición 2025</p>
          <h1 className="hero-title">Olimpiadas<br />Deportivas<br />Institucionales</h1>
          <p className="hero-desc">
            Consulta resultados, próximos eventos, disciplinas participantes
            y la tabla general de posiciones en tiempo real.
          </p>
          <div className="hero-meta">
            <div className="meta-item">
              <span className="meta-num">8</span>
              <span className="meta-label">Disciplinas</span>
            </div>
            <div className="meta-sep"></div>
            <div className="meta-item">
              <span className="meta-num">24</span>
              <span className="meta-label">Eventos programados</span>
            </div>
            <div className="meta-sep"></div>
            <div className="meta-item">
              <span className="meta-num">16</span>
              <span className="meta-label">Instituciones</span>
            </div>
          </div>
        </div>
      </section>

      {/* PRÓXIMOS EVENTOS */}
      <section className="section">
        <div className="section-inner">
          <div className="section-header">
            <h2 className="section-title">Próximos eventos</h2>
            <span className="section-badge">Programación oficial</span>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Disciplina</th>
                  <th>Categoría</th>
                  <th>Sede</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {proximosEventos.map((e, i) => (
                  <tr key={i}>
                    <td className="td-fecha">{e.fecha}</td>
                    <td className="td-main">{e.disciplina}</td>
                    <td>{e.categoria}</td>
                    <td>{e.sede}</td>
                    <td><span className="badge-pendiente">Pendiente</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* RESULTADOS */}
      <section className="section section-alt">
        <div className="section-inner">
          <div className="section-header">
            <h2 className="section-title">Últimos resultados</h2>
            <span className="section-badge">Actualizado hoy</span>
          </div>
          <div className="results-grid">
            {resultados.map((r, i) => (
              <div className="result-card" key={i}>
                <span className="result-disciplina">{r.disciplina}</span>
                <div className="result-marcador">
                  <span className="result-equipo">{r.equipoA}</span>
                  <div className="result-score">
                    <span>{r.marcA}</span>
                    <span className="score-sep">—</span>
                    <span>{r.marcB}</span>
                  </div>
                  <span className="result-equipo result-equipo-b">{r.equipoB}</span>
                </div>
                <span className="badge-finalizado">{r.estado}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TABLA DE POSICIONES */}
      <section className="section">
        <div className="section-inner">
          <div className="section-header">
            <h2 className="section-title">Tabla de posiciones</h2>
            <span className="section-badge">General · Edición 2025</span>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Pos.</th>
                  <th>Institución</th>
                  <th>Oro</th>
                  <th>Plata</th>
                  <th>Bronce</th>
                  <th>Puntos</th>
                </tr>
              </thead>
              <tbody>
                {tablaPosiciones.map((t) => (
                  <tr key={t.pos} className={t.pos === 1 ? 'tr-top' : ''}>
                    <td className="td-pos">{t.pos}</td>
                    <td className="td-main">{t.institucion}</td>
                    <td>{t.oro}</td>
                    <td>{t.plata}</td>
                    <td>{t.bronce}</td>
                    <td className="td-pts">{t.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* DISCIPLINAS */}
      <section className="section section-alt">
        <div className="section-inner">
          <div className="section-header">
            <h2 className="section-title">Disciplinas participantes</h2>
            <span className="section-badge">{disciplinas.length} disciplinas</span>
          </div>
          <div className="disciplinas-grid">
            {disciplinas.map((d, i) => (
              <div className="disciplina-item" key={i}>
                {d}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-left">
            <span className="logo-main">Olimpiadas Deportivas Institucionales</span>
            <span className="footer-sub">Portal público de consulta · Edición 2025</span>
          </div>
          <div className="footer-right">
            <button className="btn-acceso-footer" onClick={() => navigate('/login')}>
              Acceso para encargados
            </button>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default LandingPage