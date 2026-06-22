import { useState } from 'react'
import InternalLayout from '../layouts/InternalLayout'
import '../styles/partidos.css'

const eventosDisponibles = [
  { id: 1, nombre: 'Olimpiadas Interinstitucionales 2025' },
  { id: 2, nombre: 'Copa Institucional Junio' },
]

const gruposDisponibles = {
  1: ['Grupo A', 'Grupo B', 'Grupo C'],
  2: ['Grupo A', 'Grupo B'],
}

const equiposPorGrupo = {
  'Grupo A': ['Equipo Norte', 'Equipo Sur', 'Equipo Este'],
  'Grupo B': ['Equipo Oeste', 'Equipo Central', 'Equipo Andino'],
  'Grupo C': ['Equipo Azul', 'Equipo Rojo'],
}

const sedesDisponibles = ['Estadio Central', 'Coliseo Norte', 'Pista Olímpica', 'Piscina Municipal', 'Cancha Sur']

const partidosIniciales = [
  { id: 1, eventoId: 1, grupo: 'Grupo A', equipoLocal: 'Equipo Norte', equipoVisita: 'Equipo Sur', fecha: '2025-06-10', hora: '10:00', sede: 'Estadio Central', estado: 'Programado' },
  { id: 2, eventoId: 1, grupo: 'Grupo A', equipoLocal: 'Equipo Este', equipoVisita: 'Equipo Norte', fecha: '2025-06-12', hora: '15:00', sede: 'Estadio Central', estado: 'Programado' },
]

function PartidosPage() {
  const [partidos, setPartidos] = useState(partidosIniciales)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [filtroEvento, setFiltroEvento] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [confirmarEliminar, setConfirmarEliminar] = useState(null)

  const formVacio = { eventoId: '', grupo: '', equipoLocal: '', equipoVisita: '', fecha: '', hora: '', sede: '', estado: 'Programado' }
  const [form, setForm] = useState(formVacio)
  const [errores, setErrores] = useState({})

  const gruposDisp = form.eventoId ? (gruposDisponibles[form.eventoId] || []) : []
  const equiposDisp = form.grupo ? (equiposPorGrupo[form.grupo] || []) : []

  const validar = () => {
    const e = {}
    if (!form.eventoId)                 e.eventoId      = 'Selecciona un evento.'
    if (!form.grupo)                    e.grupo         = 'Selecciona un grupo.'
    if (!form.equipoLocal)              e.equipoLocal   = 'Selecciona el equipo local.'
    if (!form.equipoVisita)             e.equipoVisita  = 'Selecciona el equipo visitante.'
    if (form.equipoLocal && form.equipoVisita && form.equipoLocal === form.equipoVisita) e.equipoVisita = 'Los equipos no pueden ser el mismo.'
    if (!form.fecha)                    e.fecha         = 'La fecha es requerida.'
    if (!form.hora)                     e.hora          = 'La hora es requerida.'
    if (!form.sede)                     e.sede          = 'La sede es requerida.'
    const conflicto = partidos.find(p =>
      p.id !== editando && p.fecha === form.fecha && p.hora === form.hora && p.sede === form.sede
    )
    if (conflicto) e.hora = `Conflicto: ya existe un partido en esa sede, fecha y hora.`
    setErrores(e)
    return Object.keys(e).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    let update = { ...form, [name]: value }
    if (name === 'eventoId') update = { ...update, grupo: '', equipoLocal: '', equipoVisita: '' }
    if (name === 'grupo') update = { ...update, equipoLocal: '', equipoVisita: '' }
    setForm(update)
    setErrores({ ...errores, [name]: '' })
  }

  const handleGuardar = () => {
    if (!validar()) return
    if (editando !== null) {
      setPartidos(partidos.map(p => p.id === editando ? { ...form, id: editando } : p))
    } else {
      setPartidos([...partidos, { ...form, id: Date.now() }])
    }
    setForm(formVacio); setMostrarForm(false); setEditando(null); setErrores({})
  }

  const handleEditar = (p) => {
    setForm({ eventoId: p.eventoId, grupo: p.grupo, equipoLocal: p.equipoLocal, equipoVisita: p.equipoVisita, fecha: p.fecha, hora: p.hora, sede: p.sede, estado: p.estado })
    setEditando(p.id); setMostrarForm(true); setErrores({})
  }

  const handleEliminar = (id) => { setPartidos(partidos.filter(p => p.id !== id)); setConfirmarEliminar(null) }

  const getNombreEvento = (id) => eventosDisponibles.find(e => String(e.id) === String(id))?.nombre || '—'

  const filtrados = partidos.filter(p => {
    const matchEv = filtroEvento ? String(p.eventoId) === filtroEvento : true
    const matchEst = filtroEstado ? p.estado === filtroEstado : true
    return matchEv && matchEst
  })

  const formatFecha = (f) => f ? f.split('-').reverse().join('/') : '—'

  return (
    <InternalLayout titulo="Programación de partidos" subtitulo="Genera y gestiona el calendario de partidos validando conflictos de horario y sede">
      <div className="partidos-page">

        <div className="part-topbar">
          <div className="part-filtros">
            <select className="part-select-filtro" value={filtroEvento} onChange={e => setFiltroEvento(e.target.value)}>
              <option value="">Todos los eventos</option>
              {eventosDisponibles.map(ev => <option key={ev.id} value={ev.id}>{ev.nombre}</option>)}
            </select>
            <select className="part-select-filtro" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
              <option value="">Todos los estados</option>
              <option value="Programado">Programado</option>
              <option value="En curso">En curso</option>
              <option value="Finalizado">Finalizado</option>
              <option value="Suspendido">Suspendido</option>
            </select>
          </div>
          <button className="btn-nuevo-partido" onClick={() => { setMostrarForm(true); setEditando(null); setForm(formVacio) }}>+ Programar partido</button>
        </div>

        {mostrarForm && (
          <div className="partido-form-card">
            <div className="partido-form-header">
              <h2 className="partido-form-titulo">{editando !== null ? 'Editar partido' : 'Programar partido'}</h2>
              <p className="partido-form-subtitulo">Se verificará que no existan conflictos de sede, fecha y hora.</p>
            </div>
            <div className="partido-form-body">
              <div className="form-row-2">
                <div className="form-group">
                  <label>Evento</label>
                  <select name="eventoId" value={form.eventoId} onChange={handleChange} className={errores.eventoId ? 'input-error' : ''}>
                    <option value="">Selecciona un evento</option>
                    {eventosDisponibles.map(ev => <option key={ev.id} value={ev.id}>{ev.nombre}</option>)}
                  </select>
                  {errores.eventoId && <span className="error-msg">{errores.eventoId}</span>}
                </div>
                <div className="form-group">
                  <label>Grupo / Serie</label>
                  <select name="grupo" value={form.grupo} onChange={handleChange} className={errores.grupo ? 'input-error' : ''} disabled={!form.eventoId}>
                    <option value="">Selecciona un grupo</option>
                    {gruposDisp.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  {errores.grupo && <span className="error-msg">{errores.grupo}</span>}
                </div>
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Equipo local</label>
                  <select name="equipoLocal" value={form.equipoLocal} onChange={handleChange} className={errores.equipoLocal ? 'input-error' : ''} disabled={!form.grupo}>
                    <option value="">Selecciona equipo local</option>
                    {equiposDisp.map(eq => <option key={eq} value={eq}>{eq}</option>)}
                  </select>
                  {errores.equipoLocal && <span className="error-msg">{errores.equipoLocal}</span>}
                </div>
                <div className="form-group">
                  <label>Equipo visitante</label>
                  <select name="equipoVisita" value={form.equipoVisita} onChange={handleChange} className={errores.equipoVisita ? 'input-error' : ''} disabled={!form.grupo}>
                    <option value="">Selecciona equipo visitante</option>
                    {equiposDisp.filter(eq => eq !== form.equipoLocal).map(eq => <option key={eq} value={eq}>{eq}</option>)}
                  </select>
                  {errores.equipoVisita && <span className="error-msg">{errores.equipoVisita}</span>}
                </div>
              </div>
              <div className="form-row-3">
                <div className="form-group">
                  <label>Fecha</label>
                  <input type="date" name="fecha" value={form.fecha} onChange={handleChange} className={errores.fecha ? 'input-error' : ''} />
                  {errores.fecha && <span className="error-msg">{errores.fecha}</span>}
                </div>
                <div className="form-group">
                  <label>Hora</label>
                  <input type="time" name="hora" value={form.hora} onChange={handleChange} className={errores.hora ? 'input-error' : ''} />
                  {errores.hora && <span className="error-msg">{errores.hora}</span>}
                </div>
                <div className="form-group">
                  <label>Sede</label>
                  <select name="sede" value={form.sede} onChange={handleChange} className={errores.sede ? 'input-error' : ''}>
                    <option value="">Selecciona sede</option>
                    {sedesDisponibles.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errores.sede && <span className="error-msg">{errores.sede}</span>}
                </div>
              </div>
              <div className="form-group" style={{maxWidth:'200px'}}>
                <label>Estado</label>
                <select name="estado" value={form.estado} onChange={handleChange}>
                  <option value="Programado">Programado</option>
                  <option value="En curso">En curso</option>
                  <option value="Finalizado">Finalizado</option>
                  <option value="Suspendido">Suspendido</option>
                </select>
              </div>
            </div>
            <div className="partido-form-footer">
              <button className="btn-cancelar-partido" onClick={() => { setMostrarForm(false); setForm(formVacio); setEditando(null); setErrores({}) }}>Cancelar</button>
              <button className="btn-guardar-partido" onClick={handleGuardar}>{editando !== null ? 'Guardar cambios' : 'Programar partido'}</button>
            </div>
          </div>
        )}

        <div className="partidos-table-wrap">
          <table className="partidos-table">
            <thead>
              <tr><th>#</th><th>Enfrentamiento</th><th>Evento / Grupo</th><th>Fecha</th><th>Hora</th><th>Sede</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr><td colSpan={8} className="td-vacio">No hay partidos programados.</td></tr>
              ) : filtrados.map((p, i) => (
                <tr key={p.id}>
                  <td className="td-num">{i + 1}</td>
                  <td className="td-enfrentamiento">
                    <span className="eq-local">{p.equipoLocal}</span>
                    <span className="vs-sep">vs</span>
                    <span className="eq-visita">{p.equipoVisita}</span>
                  </td>
                  <td>
                    <span className="td-evento-nombre">{getNombreEvento(p.eventoId)}</span>
                    <span className="td-grupo">{p.grupo}</span>
                  </td>
                  <td className="td-fecha">{formatFecha(p.fecha)}</td>
                  <td>{p.hora}</td>
                  <td>{p.sede}</td>
                  <td>
                    <span className={`estado-partido ${p.estado === 'Programado' ? 'ep-programado' : p.estado === 'En curso' ? 'ep-encurso' : p.estado === 'Finalizado' ? 'ep-finalizado' : 'ep-suspendido'}`}>
                      {p.estado}
                    </span>
                  </td>
                  <td>
                    <div className="acciones">
                      <button className="btn-editar-partido" onClick={() => handleEditar(p)}>Editar</button>
                      <button className="btn-eliminar-partido" onClick={() => setConfirmarEliminar(p.id)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="partidos-contador">{filtrados.length} partido{filtrados.length !== 1 ? 's' : ''} programado{filtrados.length !== 1 ? 's' : ''}</p>

        {confirmarEliminar && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h3 className="modal-titulo">Confirmar eliminación</h3>
              <p className="modal-desc">Se eliminará el partido del calendario. Esta acción no se puede deshacer.</p>
              <div className="modal-acciones">
                <button className="btn-cancelar-partido" onClick={() => setConfirmarEliminar(null)}>Cancelar</button>
                <button className="btn-eliminar-confirm" onClick={() => handleEliminar(confirmarEliminar)}>Eliminar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </InternalLayout>
  )
}

export default PartidosPage