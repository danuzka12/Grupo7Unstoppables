import { useState } from 'react'
import InternalLayout from '../layouts/InternalLayout'
import '../styles/resultados.css'

const partidosPendientes = [
  { id: 1, eventoId: 1, eventoNombre: 'Olimpiadas 2025', grupo: 'Grupo A', equipoLocal: 'Equipo Norte', equipoVisita: 'Equipo Sur', fecha: '2025-06-10', hora: '10:00', sede: 'Estadio Central' },
  { id: 2, eventoId: 1, eventoNombre: 'Olimpiadas 2025', grupo: 'Grupo A', equipoLocal: 'Equipo Este', equipoVisita: 'Equipo Oeste', fecha: '2025-06-10', hora: '15:00', sede: 'Estadio Central' },
  { id: 3, eventoId: 1, eventoNombre: 'Olimpiadas 2025', grupo: 'Grupo B', equipoLocal: 'Equipo Central', equipoVisita: 'Equipo Andino', fecha: '2025-06-12', hora: '11:00', sede: 'Coliseo Norte' },
]

const resultadosIniciales = [
  { id: 101, partidoId: 0, eventoNombre: 'Olimpiadas 2025', grupo: 'Grupo A', equipoLocal: 'Equipo Azul', golesLocal: 3, equipoVisita: 'Equipo Rojo', golesVisita: 1, fecha: '2025-06-08', observaciones: 'Partido sin incidencias.', publicado: true },
]

function ResultadosPage() {
  const [resultados, setResultados] = useState(resultadosIniciales)
  const [partidoSelec, setPartidoSelec] = useState(null)
  const [filtroEvento, setFiltroEvento] = useState('')
  const [verDetalle, setVerDetalle] = useState(null)

  const formVacio = { golesLocal: '', golesVisita: '', observaciones: '', publicado: false }
  const [form, setForm] = useState(formVacio)
  const [errores, setErrores] = useState({})

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

  const handleRegistrar = () => {
    if (!validar()) return
    const gL = Number(form.golesLocal), gV = Number(form.golesVisita)
    const ganador = gL > gV ? partidoSelec.equipoLocal : gV > gL ? partidoSelec.equipoVisita : 'Empate'
    setResultados([...resultados, {
      id: Date.now(), partidoId: partidoSelec.id,
      eventoNombre: partidoSelec.eventoNombre, grupo: partidoSelec.grupo,
      equipoLocal: partidoSelec.equipoLocal, golesLocal: gL,
      equipoVisita: partidoSelec.equipoVisita, golesVisita: gV,
      fecha: partidoSelec.fecha, observaciones: form.observaciones,
      publicado: form.publicado, ganador,
    }])
    setPartidoSelec(null)
    setForm(formVacio)
    setErrores({})
  }

  const togglePublicado = (id) => {
    setResultados(resultados.map(r => r.id === id ? { ...r, publicado: !r.publicado } : r))
  }

  const formatFecha = (f) => f ? f.split('-').reverse().join('/') : '—'

  const resultadosFiltrados = resultados.filter(r =>
    filtroEvento ? r.eventoNombre.toLowerCase().includes(filtroEvento.toLowerCase()) : true
  )

  return (
    <InternalLayout titulo="Registro y publicación de resultados" subtitulo="Registra marcadores, valida resultados y actualiza tablas de posiciones">
      <div className="resultados-page">

        <div className="res-layout">

          {/* PANEL IZQUIERDO: partidos pendientes */}
          <div className="res-panel-izq">
            <div className="res-panel-header">
              <h3 className="res-panel-titulo">Partidos pendientes</h3>
              <p className="res-panel-sub">Selecciona un partido para registrar su resultado</p>
            </div>
            <div className="partidos-pendientes-list">
              {partidosPendientes.filter(p => !resultados.find(r => r.partidoId === p.id)).map(p => (
                <div
                  key={p.id}
                  className={`partido-pendiente-item ${partidoSelec?.id === p.id ? 'partido-seleccionado' : ''}`}
                  onClick={() => { setPartidoSelec(p); setForm(formVacio); setErrores({}) }}
                >
                  <div className="pp-enfrentamiento">
                    <span className="pp-equipo">{p.equipoLocal}</span>
                    <span className="pp-vs">vs</span>
                    <span className="pp-equipo">{p.equipoVisita}</span>
                  </div>
                  <div className="pp-meta">
                    <span>{formatFecha(p.fecha)} · {p.hora}</span>
                    <span>{p.grupo}</span>
                  </div>
                </div>
              ))}
              {partidosPendientes.filter(p => !resultados.find(r => r.partidoId === p.id)).length === 0 && (
                <p className="pp-vacio">Todos los partidos tienen resultado registrado.</p>
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
                  <p className="res-form-sub">{partidoSelec.grupo} · {formatFecha(partidoSelec.fecha)}</p>
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
                    <span className="res-equipo-nombre">{partidoSelec.equipoVisita}</span>
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
                  <button className="btn-cancelar-res" onClick={() => { setPartidoSelec(null); setForm(formVacio) }}>Cancelar</button>
                  <button className="btn-registrar-res" onClick={handleRegistrar}>Registrar resultado</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* TABLA DE RESULTADOS */}
        <div className="res-historial">
          <div className="res-historial-header">
            <h3 className="res-historial-titulo">Historial de resultados</h3>
            <input className="res-filtro-ev" type="text" placeholder="Filtrar por evento..." value={filtroEvento} onChange={e => setFiltroEvento(e.target.value)} />
          </div>
          <div className="res-table-wrap">
            <table className="res-table">
              <thead>
                <tr><th>Partido</th><th>Evento / Grupo</th><th>Marcador</th><th>Ganador</th><th>Fecha</th><th>Publicado</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {resultadosFiltrados.length === 0 ? (
                  <tr><td colSpan={7} className="td-vacio">No hay resultados registrados aún.</td></tr>
                ) : resultadosFiltrados.map(r => (
                  <tr key={r.id}>
                    <td className="td-enfrentamiento-res">
                      <span>{r.equipoLocal}</span>
                      <span className="vs-sep-res">vs</span>
                      <span>{r.equipoVisita}</span>
                    </td>
                    <td>
                      <span className="td-evento-nombre">{r.eventoNombre}</span>
                      <span className="td-grupo">{r.grupo}</span>
                    </td>
                    <td>
                      <span className="marcador-res">{r.golesLocal} — {r.golesVisita}</span>
                    </td>
                    <td>
                      <span className={`ganador-badge ${r.ganador === 'Empate' ? 'ganador-empate' : 'ganador-equipo'}`}>
                        {r.ganador}
                      </span>
                    </td>
                    <td className="td-fecha">{formatFecha(r.fecha)}</td>
                    <td>
                      <span className={`pub-badge ${r.publicado ? 'pub-si' : 'pub-no'}`}>
                        {r.publicado ? 'Publicado' : 'No publicado'}
                      </span>
                    </td>
                    <td>
                      <div className="acciones">
                        <button className="btn-ver-res" onClick={() => setVerDetalle(r)}>Ver</button>
                        <button className={`btn-toggle-pub ${r.publicado ? 'btn-despub' : 'btn-pub'}`} onClick={() => togglePublicado(r.id)}>
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
              <h3 className="modal-titulo">{verDetalle.equipoLocal} vs {verDetalle.equipoVisita}</h3>
              <div className="modal-marcador-grande">
                <span>{verDetalle.golesLocal}</span>
                <span className="modal-guion">—</span>
                <span>{verDetalle.golesVisita}</span>
              </div>
              <div className="modal-res-meta">
                <div className="detalle-row"><span className="detalle-label">Evento</span><span className="detalle-val">{verDetalle.eventoNombre}</span></div>
                <div className="detalle-row"><span className="detalle-label">Grupo</span><span className="detalle-val">{verDetalle.grupo}</span></div>
                <div className="detalle-row"><span className="detalle-label">Fecha</span><span className="detalle-val">{formatFecha(verDetalle.fecha)}</span></div>
                <div className="detalle-row"><span className="detalle-label">Ganador</span><span className="detalle-val">{verDetalle.ganador}</span></div>
                {verDetalle.observaciones && <div className="detalle-row"><span className="detalle-label">Observaciones</span><span className="detalle-val">{verDetalle.observaciones}</span></div>}
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