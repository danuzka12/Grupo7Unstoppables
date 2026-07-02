import { useEffect, useState } from 'react'
import InternalLayout from '../layouts/InternalLayout'
import '../styles/sorteo.css'
import '../styles/partidos.css'
import '../styles/resultados.css'

const API = 'http://localhost:8080/api'

function ResultadosPage() {
  const usuario = JSON.parse(sessionStorage.getItem('usuario') || '{}')
  const idUsuarioRegistro = usuario?.idUsuario ?? null

  const [competencias, setCompetencias] = useState([])
  const [idEventoDeporte, setIdEventoDeporte] = useState('')

  const [pendientes, setPendientes] = useState([])
  const [resultados, setResultados] = useState([])
  const [partidoSelec, setPartidoSelec] = useState(null)
  const [jugadores, setJugadores] = useState([])
  const [cargandoJugadores, setCargandoJugadores] = useState(false)

  const [filtroEvento, setFiltroEvento] = useState('')
  const [verDetalle, setVerDetalle] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  const formVacio = { golesLocal: '', golesVisita: '', observaciones: '', publicado: false }
  const [form, setForm] = useState(formVacio)
  const [goleadores, setGoleadores] = useState({}) // { idParticipante: goles }
  const [errores, setErrores] = useState({})

  // ---- Carga inicial ----
  async function cargarCompetencias() {
    try {
      const res = await fetch(`${API}/competencias`)
      const data = await res.json()
      setCompetencias(data)
      if (data.length > 0) setIdEventoDeporte(String(data[0].idEventoDeporte))
    } catch {
      setError('No se pudo cargar la lista de competencias.')
    }
  }

  async function cargarPendientes(id) {
    try {
      const res = await fetch(`${API}/resultados/pendientes?idEventoDeporte=${id}`)
      const data = await res.json()
      setPendientes(data)
    } catch {
      setError('No se pudo cargar los partidos pendientes.')
    }
  }

  async function cargarResultados(id) {
    try {
      const res = await fetch(`${API}/resultados?idEventoDeporte=${id}`)
      const data = await res.json()
      setResultados(data)
    } catch {
      setError('No se pudo cargar el historial de resultados.')
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarCompetencias()
  }, [])

  useEffect(() => {
    if (!idEventoDeporte) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError('')
    cargarPendientes(idEventoDeporte)
    cargarResultados(idEventoDeporte)
    setPartidoSelec(null)
    setForm(formVacio)
    setGoleadores({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idEventoDeporte])

  // ---- Selección de partido ----
  async function seleccionarPartido(p) {
    setPartidoSelec(p)
    setForm(formVacio)
    setGoleadores({})
    setErrores({})
    setCargandoJugadores(true)
    try {
      const res = await fetch(`${API}/resultados/partido/${p.idPartido}/jugadores`)
      const data = await res.json()
      setJugadores(Array.isArray(data) ? data : [])
    } catch {
      setJugadores([])
      setError('No se pudo cargar la lista de jugadores inscritos en el partido.')
    } finally {
      setCargandoJugadores(false)
    }
  }

  const jugadoresLocal = jugadores.filter(j => j.rol === 'LOCAL')
  const jugadoresVisita = jugadores.filter(j => j.rol === 'VISITANTE')

  const sumaGoles = (lista) => lista.reduce((acc, j) => acc + (Number(goleadores[j.idParticipante]) || 0), 0)

  // ---- Formulario ----
  const validar = () => {
    const e = {}
    if (form.golesLocal === '' || isNaN(form.golesLocal) || Number(form.golesLocal) < 0) e.golesLocal = 'Ingresa un marcador válido.'
    if (form.golesVisita === '' || isNaN(form.golesVisita) || Number(form.golesVisita) < 0) e.golesVisita = 'Ingresa un marcador válido.'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
    setErrores({ ...errores, [name]: '' })
  }

  const handleGolJugador = (idParticipante, value) => {
    const n = value === '' ? '' : Math.max(0, Number(value))
    setGoleadores({ ...goleadores, [idParticipante]: n })
  }

  const handleRegistrar = async () => {
    if (!validar() || !idUsuarioRegistro) {
      if (!idUsuarioRegistro) setError('No se encontró el usuario en sesión. Vuelve a iniciar sesión.')
      return
    }
    setGuardando(true)
    setMensaje('')
    setError('')

    const estadisticas = Object.entries(goleadores)
      .filter(([, goles]) => Number(goles) > 0)
      .map(([idParticipante, goles]) => ({ idParticipante: Number(idParticipante), goles: Number(goles) }))

    try {
      const res = await fetch(`${API}/resultados`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idPartido: partidoSelec.idPartido,
          golesLocal: Number(form.golesLocal),
          golesVisitante: Number(form.golesVisita),
          observaciones: form.observaciones,
          publicado: form.publicado,
          idUsuarioRegistro,
          estadisticas,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'No se pudo registrar el resultado.')

      setMensaje('Resultado registrado correctamente.')
      setPartidoSelec(null)
      setForm(formVacio)
      setGoleadores({})
      cargarPendientes(idEventoDeporte)
      cargarResultados(idEventoDeporte)
    } catch (e) {
      setError(e.message)
    } finally {
      setGuardando(false)
    }
  }

  const togglePublicado = async (idResultado) => {
    try {
      await fetch(`${API}/resultados/${idResultado}/publicar`, { method: 'PATCH' })
      cargarResultados(idEventoDeporte)
    } catch {
      setError('No se pudo actualizar el estado de publicación.')
    }
  }

  const abrirDetalle = async (r) => {
    setVerDetalle({ ...r, goleadores: null })
    try {
      const res = await fetch(`${API}/resultados/partido/${r.idPartido}`)
      const data = await res.json()
      if (res.ok) setVerDetalle(data)
    } catch {
      // si falla, se queda con los datos básicos ya mostrados
    }
  }

  const formatFecha = (value) => {
    if (!value) return '—'
    return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value))
  }
  const formatHora = (value) => {
    if (!value) return '—'
    return new Intl.DateTimeFormat('es-PE', { hour: '2-digit', minute: '2-digit' }).format(new Date(value))
  }

  const ganadorLabel = (g) => g === 'LOCAL' ? 'Local' : g === 'VISITANTE' ? 'Visitante' : 'Empate'

  const resultadosFiltrados = resultados.filter(r =>
    filtroEvento
      ? (`${r.equipoLocal} ${r.equipoVisitante} ${r.grupo || ''}`).toLowerCase().includes(filtroEvento.toLowerCase())
      : true
  )

  return (
    <InternalLayout titulo="Registro y publicación de resultados" subtitulo="Registra marcadores, anota goleadores y publica los resultados">
      <div className="resultados-page">

        {mensaje && <div className="sorteo-aviso" style={{ borderColor: '#b7ebc6', color: '#166534' }}>{mensaje}</div>}
        {error && <div className="sorteo-aviso">{error}</div>}

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
          </div>
        </div>

        <div className="res-layout">

          {/* PANEL IZQUIERDO: partidos pendientes */}
          <div className="res-panel-izq">
            <div className="res-panel-header">
              <h3 className="res-panel-titulo">Partidos pendientes</h3>
              <p className="res-panel-sub">Selecciona un partido para registrar su resultado</p>
            </div>
            <div className="partidos-pendientes-list">
              {pendientes.map(p => (
                <div
                  key={p.idPartido}
                  className={`partido-pendiente-item ${partidoSelec?.idPartido === p.idPartido ? 'partido-seleccionado' : ''}`}
                  onClick={() => seleccionarPartido(p)}
                >
                  <div className="pp-enfrentamiento">
                    <span className="pp-equipo">{p.equipoLocal}</span>
                    <span className="pp-vs">vs</span>
                    <span className="pp-equipo">{p.equipoVisitante}</span>
                  </div>
                  <div className="pp-meta">
                    <span>{formatFecha(p.fechaHora)} · {formatHora(p.fechaHora)}</span>
                    <span>{p.grupo || '—'}</span>
                  </div>
                </div>
              ))}
              {pendientes.length === 0 && (
                <p className="pp-vacio">
                  {idEventoDeporte ? 'Todos los partidos tienen resultado registrado.' : 'Selecciona una competencia.'}
                </p>
              )}
            </div>
          </div>

          {/* PANEL DERECHO: formulario de resultado */}
          <div className="res-panel-der">
            {!partidoSelec ? (
              <div className="res-form-placeholder">
                <p>Selecciona un partido de la lista para registrar su resultado.</p>
              </div>
            ) : (
              <div className="res-form-card">
                <div className="res-form-header">
                  <h3 className="res-form-titulo">Registrar resultado</h3>
                  <p className="res-form-sub">{partidoSelec.grupo || 'Sin grupo'} · {formatFecha(partidoSelec.fechaHora)}</p>
                </div>
                <div className="res-enfrentamiento-display">
                  <div className="res-equipo-block">
                    <span className="res-equipo-nombre">{partidoSelec.equipoLocal}</span>
                    <span className="res-equipo-rol">Local</span>
                    <input
                      type="number" name="golesLocal" min="0"
                      className={`res-marcador-input ${errores.golesLocal ? 'input-error' : ''}`}
                      value={form.golesLocal} onChange={handleChange}
                      placeholder="0"
                    />
                    {errores.golesLocal && <span className="error-msg">{errores.golesLocal}</span>}
                  </div>
                  <div className="res-vs-block">
                    <span className="res-vs-text">—</span>
                  </div>
                  <div className="res-equipo-block">
                    <span className="res-equipo-nombre">{partidoSelec.equipoVisitante}</span>
                    <span className="res-equipo-rol">Visitante</span>
                    <input
                      type="number" name="golesVisita" min="0"
                      className={`res-marcador-input ${errores.golesVisita ? 'input-error' : ''}`}
                      value={form.golesVisita} onChange={handleChange}
                      placeholder="0"
                    />
                    {errores.golesVisita && <span className="error-msg">{errores.golesVisita}</span>}
                  </div>
                </div>

                {/* GOLEADORES */}
                <div className="res-goleadores-wrap">
                  <div className="res-goleadores-header">
                    <h4>Goleadores del partido</h4>
                    <p>Marca cuántos goles anotó cada jugador inscrito. (Registro provisional: solo goles, por ahora aplicable a fútbol)</p>
                  </div>
                  {cargandoJugadores ? (
                    <p className="pp-vacio">Cargando jugadores inscritos...</p>
                  ) : (
                    <div className="res-goleadores-cols">
                      <div className="res-goleadores-col">
                        <div className="res-goleadores-col-titulo">
                          {partidoSelec.equipoLocal}
                          {form.golesLocal !== '' && (
                            <span className={`res-goles-check ${sumaGoles(jugadoresLocal) === Number(form.golesLocal) ? 'ok' : 'warn'}`}>
                              {sumaGoles(jugadoresLocal)} / {form.golesLocal}
                            </span>
                          )}
                        </div>
                        {jugadoresLocal.length === 0 && <p className="pp-vacio">Sin jugadores inscritos.</p>}
                        {jugadoresLocal.map(j => (
                          <div key={j.idParticipante} className="res-goleador-fila">
                            <span>{j.nombres} {j.apellidos}{j.esCapitan ? ' (C)' : ''}</span>
                            <input
                              type="number" min="0"
                              value={goleadores[j.idParticipante] ?? ''}
                              onChange={e => handleGolJugador(j.idParticipante, e.target.value)}
                              placeholder="0"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="res-goleadores-col">
                        <div className="res-goleadores-col-titulo">
                          {partidoSelec.equipoVisitante}
                          {form.golesVisita !== '' && (
                            <span className={`res-goles-check ${sumaGoles(jugadoresVisita) === Number(form.golesVisita) ? 'ok' : 'warn'}`}>
                              {sumaGoles(jugadoresVisita)} / {form.golesVisita}
                            </span>
                          )}
                        </div>
                        {jugadoresVisita.length === 0 && <p className="pp-vacio">Sin jugadores inscritos.</p>}
                        {jugadoresVisita.map(j => (
                          <div key={j.idParticipante} className="res-goleador-fila">
                            <span>{j.nombres} {j.apellidos}{j.esCapitan ? ' (C)' : ''}</span>
                            <input
                              type="number" min="0"
                              value={goleadores[j.idParticipante] ?? ''}
                              onChange={e => handleGolJugador(j.idParticipante, e.target.value)}
                              placeholder="0"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="res-form-body">
                  <div className="form-group">
                    <label>Observaciones</label>
                    <textarea name="observaciones" rows={2} placeholder="Incidencias, amonestaciones, notas del partido..." value={form.observaciones} onChange={handleChange} />
                  </div>
                  <label className="res-publicar-label">
                    <input type="checkbox" name="publicado" checked={form.publicado} onChange={handleChange} />
                    <span>Publicar resultado en el portal público</span>
                  </label>
                </div>
                <div className="res-form-footer">
                  <button className="btn-cancelar-res" onClick={() => { setPartidoSelec(null); setForm(formVacio); setGoleadores({}) }}>Cancelar</button>
                  <button className="btn-registrar-res" onClick={handleRegistrar} disabled={guardando}>
                    {guardando ? 'Guardando...' : 'Registrar resultado'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* TABLA DE RESULTADOS */}
        <div className="res-historial">
          <div className="res-historial-header">
            <h3 className="res-historial-titulo">Historial de resultados</h3>
            <input className="res-filtro-ev" type="text" placeholder="Filtrar por equipo o grupo..." value={filtroEvento} onChange={e => setFiltroEvento(e.target.value)} />
          </div>
          <div className="res-table-wrap">
            <table className="res-table">
              <thead>
                <tr><th>Partido</th><th>Grupo</th><th>Marcador</th><th>Ganador</th><th>Fecha</th><th>Publicado</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {resultadosFiltrados.length === 0 ? (
                  <tr><td colSpan={7} className="td-vacio">No hay resultados registrados aún.</td></tr>
                ) : resultadosFiltrados.map(r => (
                  <tr key={r.idResultado}>
                    <td className="td-enfrentamiento-res">
                      <span>{r.equipoLocal}</span>
                      <span className="vs-sep-res">vs</span>
                      <span>{r.equipoVisitante}</span>
                    </td>
                    <td><span className="td-grupo">{r.grupo || '—'}</span></td>
                    <td><span className="marcador-res">{r.golesLocal} — {r.golesVisitante}</span></td>
                    <td>
                      <span className={`ganador-badge ${r.ganador === 'EMPATE' ? 'ganador-empate' : 'ganador-equipo'}`}>
                        {ganadorLabel(r.ganador)}
                      </span>
                    </td>
                    <td className="td-fecha">{formatFecha(r.fechaHora)}</td>
                    <td>
                      <span className={`pub-badge ${r.publicado ? 'pub-si' : 'pub-no'}`}>
                        {r.publicado ? 'Publicado' : 'No publicado'}
                      </span>
                    </td>
                    <td>
                      <div className="acciones">
                        <button className="btn-ver-res" onClick={() => abrirDetalle(r)}>Ver</button>
                        <button className={`btn-toggle-pub ${r.publicado ? 'btn-despub' : 'btn-pub'}`} onClick={() => togglePublicado(r.idResultado)}>
                          {r.publicado ? 'Despublicar' : 'Publicar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL DETALLE RESULTADO */}
        {verDetalle && (
          <div className="modal-overlay">
            <div className="modal-box modal-res-detalle">
              <h3 className="modal-titulo">{verDetalle.equipoLocal} vs {verDetalle.equipoVisitante}</h3>
              <div className="modal-marcador-grande">
                <span>{verDetalle.golesLocal}</span>
                <span className="modal-guion">—</span>
                <span>{verDetalle.golesVisitante}</span>
              </div>
              <div className="modal-res-meta">
                <div className="detalle-row"><span className="detalle-label">Grupo</span><span className="detalle-val">{verDetalle.grupo || '—'}</span></div>
                <div className="detalle-row"><span className="detalle-label">Fecha</span><span className="detalle-val">{formatFecha(verDetalle.fechaHora)}</span></div>
                <div className="detalle-row"><span className="detalle-label">Ganador</span><span className="detalle-val">{ganadorLabel(verDetalle.ganador)}</span></div>
                {verDetalle.observaciones && <div className="detalle-row"><span className="detalle-label">Observaciones</span><span className="detalle-val">{verDetalle.observaciones}</span></div>}
                <div className="detalle-row">
                  <span className="detalle-label">Goleadores</span>
                  <span className="detalle-val">
                    {verDetalle.goleadores === null && 'Cargando...'}
                    {Array.isArray(verDetalle.goleadores) && verDetalle.goleadores.length === 0 && 'Sin goles registrados.'}
                    {Array.isArray(verDetalle.goleadores) && verDetalle.goleadores.length > 0 && (
                      <ul className="res-goleadores-lista">
                        {verDetalle.goleadores.map(g => (
                          <li key={g.idParticipante}>{g.nombres} {g.apellidos} ({g.equipoNombre}) — {g.goles} gol{g.goles !== 1 ? 'es' : ''}</li>
                        ))}
                      </ul>
                    )}
                  </span>
                </div>
              </div>
              <div className="modal-acciones">
                <button className="btn-cancelar-res" onClick={() => setVerDetalle(null)}>Cerrar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </InternalLayout>
  )
}

export default ResultadosPage
