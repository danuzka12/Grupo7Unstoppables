import { useState } from 'react'
import InternalLayout from '../layouts/InternalLayout'
import '../styles/equipos.css'

const eventosDisponibles = [
  { id: 1, nombre: 'Olimpiadas Interinstitucionales 2025', disciplinas: ['Fútbol', 'Atletismo', 'Natación'] },
  { id: 2, nombre: 'Copa Institucional Junio', disciplinas: ['Baloncesto', 'Voleibol'] },
]

const equiposIniciales = [
  { id: 1, nombre: 'Equipo Norte', institucion: 'Institución A', eventoId: 1, disciplina: 'Fútbol', representante: 'Carlos López', contacto: '987654321', estado: 'Inscrito' },
  { id: 2, nombre: 'Equipo Sur', institucion: 'Institución B', eventoId: 1, disciplina: 'Fútbol', representante: 'Ana Ríos', contacto: '912345678', estado: 'Inscrito' },
]

function EquiposPage() {
  const [equipos, setEquipos] = useState(equiposIniciales)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEvento, setFiltroEvento] = useState('')
  const [confirmarEliminar, setConfirmarEliminar] = useState(null)

  const formVacio = { nombre: '', institucion: '', eventoId: '', disciplina: '', representante: '', contacto: '', estado: 'Inscrito' }
  const [form, setForm] = useState(formVacio)
  const [errores, setErrores] = useState({})

  const eventoSeleccionado = eventosDisponibles.find(e => String(e.id) === String(form.eventoId))

  const validar = () => {
    const e = {}
    if (!form.nombre.trim())        e.nombre        = 'El nombre del equipo es requerido.'
    if (!form.institucion.trim())   e.institucion    = 'La institución es requerida.'
    if (!form.eventoId)             e.eventoId       = 'Selecciona un evento.'
    if (!form.disciplina)           e.disciplina     = 'Selecciona una disciplina.'
    if (!form.representante.trim()) e.representante  = 'El representante es requerido.'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  const handleChange = (e) => {
    const val = e.target.value
    const name = e.target.name
    if (name === 'eventoId') setForm({ ...form, eventoId: val, disciplina: '' })
    else setForm({ ...form, [name]: val })
    setErrores({ ...errores, [name]: '' })
  }

  const handleGuardar = () => {
    if (!validar()) return
    if (editando !== null) {
      setEquipos(equipos.map(eq => eq.id === editando ? { ...form, id: editando } : eq))
    } else {
      setEquipos([...equipos, { ...form, id: Date.now() }])
    }
    setForm(formVacio); setMostrarForm(false); setEditando(null); setErrores({})
  }

  const handleEditar = (eq) => {
    setForm({ nombre: eq.nombre, institucion: eq.institucion, eventoId: eq.eventoId, disciplina: eq.disciplina, representante: eq.representante, contacto: eq.contacto, estado: eq.estado })
    setEditando(eq.id); setMostrarForm(true); setErrores({})
  }

  const handleEliminar = (id) => { setEquipos(equipos.filter(eq => eq.id !== id)); setConfirmarEliminar(null) }

  const getNombreEvento = (id) => eventosDisponibles.find(e => String(e.id) === String(id))?.nombre || '—'

  const equiposFiltrados = equipos.filter(eq => {
    const matchBusq = eq.nombre.toLowerCase().includes(busqueda.toLowerCase()) || eq.institucion.toLowerCase().includes(busqueda.toLowerCase())
    const matchEvento = filtroEvento ? String(eq.eventoId) === filtroEvento : true
    return matchBusq && matchEvento
  })

  return (
    <InternalLayout titulo="Inscripción de equipos" subtitulo="Registra y gestiona los equipos por evento y disciplina">
      <div className="equipos-page">
        <div className="eq-topbar">
          <div className="eq-filtros">
            <input className="eq-search" type="text" placeholder="Buscar equipo o institución..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
            <select className="eq-select-filtro" value={filtroEvento} onChange={e => setFiltroEvento(e.target.value)}>
              <option value="">Todos los eventos</option>
              {eventosDisponibles.map(ev => <option key={ev.id} value={ev.id}>{ev.nombre}</option>)}
            </select>
          </div>
          <button className="btn-nuevo-eq" onClick={() => { setMostrarForm(true); setEditando(null); setForm(formVacio) }}>+ Inscribir equipo</button>
        </div>

        {mostrarForm && (
          <div className="eq-form-card">
            <div className="eq-form-header">
              <h2 className="eq-form-titulo">{editando !== null ? 'Editar equipo' : 'Inscribir equipo'}</h2>
              <p className="eq-form-subtitulo">Completa los datos del equipo y asocia el evento y disciplina correspondiente.</p>
            </div>
            <div className="eq-form-body">
              <div className="form-row-2">
                <div className="form-group">
                  <label>Nombre del equipo</label>
                  <input type="text" name="nombre" placeholder="Ej: Equipo Norte" value={form.nombre} onChange={handleChange} className={errores.nombre ? 'input-error' : ''} />
                  {errores.nombre && <span className="error-msg">{errores.nombre}</span>}
                </div>
                <div className="form-group">
                  <label>Institución</label>
                  <input type="text" name="institucion" placeholder="Nombre de la institución" value={form.institucion} onChange={handleChange} className={errores.institucion ? 'input-error' : ''} />
                  {errores.institucion && <span className="error-msg">{errores.institucion}</span>}
                </div>
              </div>
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
                  <label>Disciplina</label>
                  <select name="disciplina" value={form.disciplina} onChange={handleChange} className={errores.disciplina ? 'input-error' : ''} disabled={!eventoSeleccionado}>
                    <option value="">Selecciona una disciplina</option>
                    {eventoSeleccionado?.disciplinas.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {errores.disciplina && <span className="error-msg">{errores.disciplina}</span>}
                </div>
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Representante</label>
                  <input type="text" name="representante" placeholder="Nombre del representante" value={form.representante} onChange={handleChange} className={errores.representante ? 'input-error' : ''} />
                  {errores.representante && <span className="error-msg">{errores.representante}</span>}
                </div>
                <div className="form-group">
                  <label>Contacto</label>
                  <input type="text" name="contacto" placeholder="Teléfono o correo" value={form.contacto} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group" style={{maxWidth: '200px'}}>
                <label>Estado</label>
                <select name="estado" value={form.estado} onChange={handleChange}>
                  <option value="Inscrito">Inscrito</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Rechazado">Rechazado</option>
                </select>
              </div>
            </div>
            <div className="eq-form-footer">
              <button className="btn-cancelar-eq" onClick={() => { setMostrarForm(false); setForm(formVacio); setEditando(null); setErrores({}) }}>Cancelar</button>
              <button className="btn-guardar-eq" onClick={handleGuardar}>{editando !== null ? 'Guardar cambios' : 'Inscribir equipo'}</button>
            </div>
          </div>
        )}

        <div className="eq-table-wrap">
          <table className="eq-table">
            <thead>
              <tr><th>#</th><th>Equipo</th><th>Institución</th><th>Evento</th><th>Disciplina</th><th>Representante</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {equiposFiltrados.length === 0 ? (
                <tr><td colSpan={8} className="td-vacio">{busqueda || filtroEvento ? 'No se encontraron resultados.' : 'No hay equipos inscritos aún.'}</td></tr>
              ) : equiposFiltrados.map((eq, i) => (
                <tr key={eq.id}>
                  <td className="td-num">{i + 1}</td>
                  <td className="td-main">{eq.nombre}</td>
                  <td>{eq.institucion}</td>
                  <td className="td-evento">{getNombreEvento(eq.eventoId)}</td>
                  <td><span className="tag-disc">{eq.disciplina}</span></td>
                  <td>{eq.representante}</td>
                  <td><span className={`estado-badge ${eq.estado === 'Inscrito' ? 'estado-inscrito' : eq.estado === 'Pendiente' ? 'estado-pendiente' : 'estado-rechazado'}`}>{eq.estado}</span></td>
                  <td>
                    <div className="acciones">
                      <button className="btn-editar-eq" onClick={() => handleEditar(eq)}>Editar</button>
                      <button className="btn-eliminar-eq" onClick={() => setConfirmarEliminar(eq.id)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="eq-contador">{equiposFiltrados.length} equipo{equiposFiltrados.length !== 1 ? 's' : ''} registrado{equiposFiltrados.length !== 1 ? 's' : ''}</p>

        {confirmarEliminar && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h3 className="modal-titulo">Confirmar eliminación</h3>
              <p className="modal-desc">Se eliminará el equipo del sistema. Esta acción no se puede deshacer.</p>
              <div className="modal-acciones">
                <button className="btn-cancelar-eq" onClick={() => setConfirmarEliminar(null)}>Cancelar</button>
                <button className="btn-eliminar-confirm" onClick={() => handleEliminar(confirmarEliminar)}>Eliminar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </InternalLayout>
  )
}

export default EquiposPage