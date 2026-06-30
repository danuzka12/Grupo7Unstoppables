import { useEffect, useMemo, useState } from 'react'
import InternalLayout from '../layouts/InternalLayout'
import '../styles/sorteo.css'
import '../styles/partidos.css'

const API = 'http://localhost:8080/api'

const codigo = (prefijo, id) => `${prefijo}-${String(id ?? 0).padStart(3, '0')}`

function fechaLocalManana() {
  const d = new Date(Date.now() + 86400000)
  d.setHours(9, 0, 0, 0)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function PartidosPage() {
  const [competencias, setCompetencias] = useState([])
  const [sedes, setSedes] = useState([])
  const [partidos, setPartidos] = useState([])
  const [idEventoDeporte, setIdEventoDeporte] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [generando, setGenerando] = useState(false)
  const [config, setConfig] = useState({
    fechaInicio: fechaLocalManana(),
    intervaloMinutos: 120,
    sedeIds: [],
  })

  const competencia = useMemo(
    () => competencias.find(c => String(c.idEventoDeporte) === String(idEventoDeporte)),
    [competencias, idEventoDeporte],
  )

  async function cargarInicial() {
    try {
      const [resCompetencias, resSedes] = await Promise.all([
        fetch(`${API}/competencias`),
        fetch(`${API}/partidos/sedes`),
      ])
      const comp = await resCompetencias.json()
      const sed = await resSedes.json()
      setCompetencias(comp)
      setSedes(sed)
      setConfig(c => ({ ...c, sedeIds: sed.map(s => s.idSede) }))
      if (comp.length > 0) setIdEventoDeporte(String(comp[0].idEventoDeporte))
    } catch {
      setError('No se pudo cargar competencias o sedes.')
    }
  }

  async function cargarPartidos(id) {
    setError('')
    try {
      const res = await fetch(`${API}/partidos?idEventoDeporte=${id}`)
      const data = await res.json()
      setPartidos(data)
    } catch {
      setError('No se pudo cargar la programación de partidos.')
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarInicial()
  }, [])

  useEffect(() => {
    if (!idEventoDeporte) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarPartidos(idEventoDeporte)
  }, [idEventoDeporte])

  function toggleSede(idSede) {
    setConfig(c => ({
      ...c,
      sedeIds: c.sedeIds.includes(idSede)
        ? c.sedeIds.filter(id => id !== idSede)
        : [...c.sedeIds, idSede],
    }))
  }

  async function generarFixture() {
    if (!idEventoDeporte) return
    setGenerando(true)
    setMensaje('')
    setError('')
    try {
      const res = await fetch(`${API}/partidos/generar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idEventoDeporte: Number(idEventoDeporte),
          fechaInicio: config.fechaInicio,
          intervaloMinutos: Number(config.intervaloMinutos),
          sedeIds: config.sedeIds,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'No se pudo generar la programación.')
      setPartidos(data)
      setMensaje(`${data.length} partidos generados y guardados en la base de datos.`)
    } catch (e) {
      setError(e.message)
    } finally {
      setGenerando(false)
    }
  }

  const filtrados = partidos.filter(p => filtroEstado ? p.estado === filtroEstado : true)
  const gruposProgramados = new Set(partidos.map(p => p.grupo).filter(Boolean)).size

  const formatFecha = value => {
    if (!value) return '—'
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(value))
  }

  const formatHora = value => {
    if (!value) return '—'
    return new Intl.DateTimeFormat('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value))
  }

  return (
    <InternalLayout titulo="Programación de partidos" subtitulo="Genera el calendario desde los grupos sorteados y valida sedes disponibles">
      <div className="partidos-page">

        {mensaje && <div className="sorteo-aviso" style={{ borderColor: '#b7ebc6', color: '#166534' }}>{mensaje}</div>}
        {error && <div className="sorteo-aviso">{error}</div>}

        {competencia && (
          <div className="flujo-card">
            <div className="flujo-item">
              <span className="flujo-label">Evento</span>
              <strong>{codigo('EV', competencia.idEvento)}</strong>
              <small>{competencia.evento}</small>
            </div>
            <div className="flujo-arrow">→</div>
            <div className="flujo-item">
              <span className="flujo-label">Competencia</span>
              <strong>{codigo('COMP', competencia.idEventoDeporte)}</strong>
              <small>{competencia.deporte} / {competencia.categoria}</small>
            </div>
            <div className="flujo-arrow">→</div>
            <div className="flujo-item">
              <span className="flujo-label">Programación</span>
              <strong>{partidos.length} partidos</strong>
              <small>{gruposProgramados} grupos con fixture</small>
            </div>
          </div>
        )}

        <div className="part-topbar">
          <div className="part-filtros">
            <select className="part-select-filtro" value={idEventoDeporte} onChange={e => setIdEventoDeporte(e.target.value)}>
              <option value="">Selecciona una competencia</option>
              {competencias.map(c => (
                <option key={c.idEventoDeporte} value={c.idEventoDeporte}>
                  {c.evento} · {c.deporte} · {c.categoria}
                </option>
              ))}
            </select>
            <select className="part-select-filtro" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
              <option value="">Todos los estados</option>
              <option value="PROGRAMADO">PROGRAMADO</option>
              <option value="EN_CURSO">EN_CURSO</option>
              <option value="FINALIZADO">FINALIZADO</option>
              <option value="POSTERGADO">POSTERGADO</option>
              <option value="CANCELADO">CANCELADO</option>
            </select>
          </div>
          <button className="btn-nuevo-partido" onClick={generarFixture} disabled={generando || !idEventoDeporte || config.sedeIds.length === 0}>
            {generando ? 'Generando...' : '+ Generar fixture'}
          </button>
        </div>

        <div className="partido-form-card">
          <div className="partido-form-header">
            <h2 className="partido-form-titulo">Configuración automática</h2>
            <p className="partido-form-subtitulo">
              {competencia
                ? `${competencia.evento} · ${competencia.deporte} · ${competencia.categoria}`
                : 'Selecciona una competencia para programar.'}
            </p>
          </div>
          <div className="partido-form-body">
            <div className="form-row-3">
              <div className="form-group">
                <label>Inicio</label>
                <input type="datetime-local" value={config.fechaInicio} onChange={e => setConfig({ ...config, fechaInicio: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Intervalo</label>
                <select value={config.intervaloMinutos} onChange={e => setConfig({ ...config, intervaloMinutos: e.target.value })}>
                  <option value="60">1 hora</option>
                  <option value="90">1 hora 30 min</option>
                  <option value="120">2 horas</option>
                  <option value="180">3 horas</option>
                </select>
              </div>
              <div className="form-group">
                <label>Sedes activas</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {sedes.map(sede => (
                    <label key={sede.idSede} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        checked={config.sedeIds.includes(sede.idSede)}
                        onChange={() => toggleSede(sede.idSede)}
                      />
                      {sede.nombre}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="partidos-table-wrap">
          <table className="partidos-table">
            <thead>
              <tr>
                <th>Índice</th>
                <th>Enfrentamiento</th>
                <th>Evento / Grupo</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Sede</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr><td colSpan={7} className="td-vacio">No hay partidos programados. Primero realiza el sorteo y luego genera el fixture.</td></tr>
              ) : filtrados.map((p, i) => (
                <tr key={p.idPartido}>
                  <td className="td-num">
                    <span className="td-code">{codigo('P', p.idPartido)}</span>
                    <small>Orden {i + 1}</small>
                  </td>
                  <td className="td-enfrentamiento">
                    <span className="eq-local">
                      <small>{codigo('EQ', p.idEquipoLocal)}</small>
                      {p.equipoLocal}
                    </span>
                    <span className="vs-sep">vs</span>
                    <span className="eq-visita">
                      <small>{codigo('EQ', p.idEquipoVisitante)}</small>
                      {p.equipoVisitante}
                    </span>
                  </td>
                  <td>
                    <span className="td-evento-nombre">{codigo('EV', competencia?.idEvento)} · {competencia?.evento || '—'}</span>
                    <span className="td-grupo">{codigo('COMP', p.idEventoDeporte)} · Grupo {p.grupo || '—'}</span>
                  </td>
                  <td className="td-fecha">{formatFecha(p.fechaHora)}</td>
                  <td>{formatHora(p.fechaHora)}</td>
                  <td>{p.sede || '—'}</td>
                  <td>
                    <span className="estado-partido ep-programado">{p.estado}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="partidos-contador">{filtrados.length} partido{filtrados.length !== 1 ? 's' : ''} programado{filtrados.length !== 1 ? 's' : ''}</p>
      </div>
    </InternalLayout>
  )
}

export default PartidosPage
