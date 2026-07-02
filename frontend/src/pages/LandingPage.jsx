import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { obtenerResumenLanding } from '../services/landingService'
import '../styles/Landing.css'

const ESTADO_BADGE = {
  BORRADOR:   'badge-borrador',
  ABIERTO:    'badge-abierto',
  EN_CURSO:   'badge-encurso',
  FINALIZADO: 'badge-finalizado',
  CANCELADO:  'badge-cancelado',
}

const ESTADO_LABEL = {
  BORRADOR:   'Borrador',
  ABIERTO:    'Inscripciones abiertas',
  EN_CURSO:   'En curso',
  FINALIZADO: 'Finalizado',
  CANCELADO:  'Cancelado',
}

const GANADOR_LABEL = {
  LOCAL:      'Ganó local',
  VISITANTE:  'Ganó visitante',
  EMPATE:     'Empate',
}

function formatFecha(valor) {
  if (!valor) return '—'
  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return '—'
  return fecha.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
}

function formatFechaHora(valor) {
  if (!valor) return '—'
  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return '—'
  return fecha.toLocaleString('es-PE', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

function LandingPage() {
  const navigate = useNavigate()

  const [datos, setDatos]     = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    let activo = true

    async function cargar() {
      try {
        const resumen = await obtenerResumenLanding()
        if (activo) setDatos(resumen)
      } catch (e) {
        console.error(e)
        if (activo) setError('No se pudo cargar la información en este momento. Verifica que el servidor esté disponible.')
      } finally {
        if (activo) setCargando(false)
      }
    }

    cargar()
    return () => { activo = false }
  }, [])

  const estadisticas      = datos?.estadisticas ?? {}
  const proximosEventos   = datos?.proximosEventos ?? []
  const ultimosResultados = datos?.ultimosResultados ?? []
  const tablaPosiciones   = datos?.tablaPosiciones ?? []
  const disciplinas       = datos?.disciplinas ?? []

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
          <p className="hero-eyebrow">Edición actual</p>
          <h1 className="hero-title">Olimpiadas<br />Deportivas<br />Institucionales</h1>
          <p className="hero-desc">
            Consulta resultados, próximos eventos, disciplinas participantes
            y la tabla general de posiciones en tiempo real.
          </p>
          <div className="hero-meta">
            <div className="meta-item">
              <span className="meta-num">{estadisticas.disciplinas ?? '—'}</span>
              <span className="meta-label">Disciplinas</span>
            </div>
            <div className="meta-sep"></div>
            <div className="meta-item">
              <span className="meta-num">{estadisticas.eventos ?? '—'}</span>
              <span className="meta-label">Eventos registrados</span>
            </div>
            <div className="meta-sep"></div>
            <div className="meta-item">
              <span className="meta-num">{estadisticas.instituciones ?? '—'}</span>
              <span className="meta-label">Instituciones</span>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="landing-alert">{error}</div>
      )}

      {/* PRÓXIMOS EVENTOS */}
      <section className="section">
        <div className="section-inner">
          <div className="section-header">
            <h2 className="section-title">Próximos eventos</h2>
            <span className="section-badge">Programación oficial</span>
          </div>

          {cargando ? (
            <p className="landing-estado">Cargando eventos…</p>
          ) : proximosEventos.length === 0 ? (
            <p className="landing-estado">No hay eventos próximos registrados por el momento.</p>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Evento</th>
                    <th>Disciplinas</th>
                    <th>Premio</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {proximosEventos.map((e) => (
                    <tr key={e.idEvento}>
                      <td className="td-fecha">{formatFecha(e.fechaInicio)}</td>
                      <td className="td-main">{e.nombre}</td>
                      <td>{e.disciplinas || '—'}</td>
                      <td>{e.premio || '—'}</td>
                      <td>
                        <span className={ESTADO_BADGE[e.estado] || 'badge-pendiente'}>
                          {ESTADO_LABEL[e.estado] || e.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* RESULTADOS */}
      <section className="section section-alt">
        <div className="section-inner">
          <div className="section-header">
            <h2 className="section-title">Últimos resultados</h2>
            <span className="section-badge">Últimos 3 publicados</span>
          </div>

          {cargando ? (
            <p className="landing-estado">Cargando resultados…</p>
          ) : ultimosResultados.length === 0 ? (
            <p className="landing-estado">Todavía no hay resultados publicados.</p>
          ) : (
            <div className="results-grid">
              {ultimosResultados.map((r) => (
                <div className="result-card" key={r.idResultado}>
                  <span className="result-disciplina">
                    {r.disciplina}{r.categoria ? ` · ${r.categoria}` : ''}
                  </span>
                  <div className="result-marcador">
                    <span className="result-equipo">{r.equipoLocal}</span>
                    <div className="result-score">
                      <span>{r.golesLocal}</span>
                      <span className="score-sep">—</span>
                      <span>{r.golesVisitante}</span>
                    </div>
                    <span className="result-equipo result-equipo-b">{r.equipoVisitante}</span>
                  </div>
                  <div className="result-footer">
                    <span className="badge-finalizado">{GANADOR_LABEL[r.ganador] || r.ganador}</span>
                    <span className="result-fecha">{formatFechaHora(r.fechaRegistro)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* TABLA DE POSICIONES */}
      <section className="section">
        <div className="section-inner">
          <div className="section-header">
            <h2 className="section-title">Tabla de posiciones</h2>
            <span className="section-badge">General · provisional</span>
          </div>

          {cargando ? (
            <p className="landing-estado">Cargando tabla de posiciones…</p>
          ) : tablaPosiciones.length === 0 ? (
            <p className="landing-estado">Aún no hay partidos finalizados para calcular posiciones.</p>
          ) : (
            <>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Pos.</th>
                      <th>Institución</th>
                      <th>PJ</th>
                      <th>Ganados</th>
                      <th>Empates</th>
                      <th>Perdidos</th>
                      <th>Diferencia de puntos</th>
                      <th>Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tablaPosiciones.map((t, i) => (
                      <tr key={t.idInstitucion} className={i === 0 ? 'tr-top' : ''}>
                        <td className="td-pos">{i + 1}</td>
                        <td className="td-main">{t.institucion}</td>
                        <td>{t.partidosJugados}</td>
                        <td>{t.victorias}</td>
                        <td>{t.empates}</td>
                        <td>{t.derrotas}</td>
                        <td>{t.diferenciaGoles}</td>
                        <td className="td-pts">{t.puntos}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="landing-nota">
                Tabla general acumulada de todas las disciplinas con partidos finalizados.
                Próximamente se mostrará el medallero oficial por disciplina.
              </p>
            </>
          )}
        </div>
      </section>

      {/* DISCIPLINAS */}
      <section className="section section-alt">
        <div className="section-inner">
          <div className="section-header">
            <h2 className="section-title">Disciplinas participantes</h2>
            <span className="section-badge">{disciplinas.length} disciplinas</span>
          </div>

          {cargando ? (
            <p className="landing-estado">Cargando disciplinas…</p>
          ) : disciplinas.length === 0 ? (
            <p className="landing-estado">No hay disciplinas registradas todavía.</p>
          ) : (
            <div className="disciplinas-grid">
              {disciplinas.map((d) => (
                <div className="disciplina-item" key={d.idDeporte}>
                  {d.nombre}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-left">
            <span className="logo-main">Olimpiadas Deportivas Institucionales</span>
            <span className="footer-sub">Portal público de consulta</span>
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
