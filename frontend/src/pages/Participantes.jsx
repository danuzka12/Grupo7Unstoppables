import { useState } from 'react'
import InternalLayout from '../layouts/InternalLayout'
import '../styles/participantes.css'

const equiposDisponibles = [
  { id: 1, nombre: 'Equipo Norte', disciplina: 'Fútbol', cupoMax: 18 },
  { id: 2, nombre: 'Equipo Sur', disciplina: 'Fútbol', cupoMax: 18 },
  { id: 3, nombre: 'Equipo Este', disciplina: 'Baloncesto', cupoMax: 12 },
]

const participantesIniciales = [
  { id: 1, nombres: 'Jorge', apellidos: 'Ramírez', dni: '12345678', fechaNac: '2007-03-14', equipoId: 1, posicion: 'Delantero', estado: 'Activo' },
  { id: 2, nombres: 'Luis', apellidos: 'Flores', dni: '87654321', fechaNac: '2006-08-22', equipoId: 1, posicion: 'Portero', estado: 'Activo' },
]

function ParticipantesPage() {
  const [participantes, setParticipantes] = useState(participantesIniciales)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEquipo, setFiltroEquipo] = useState('')
  const [confirmarEliminar, setConfirmarEliminar] = useState(null)

  const formVacio = { nombres: '', apellidos: '', dni: '', fechaNac: '', equipoId: '', posicion: '', estado: 'Activo' }
  const [form, setForm] = useState(formVacio)
  const [errores, setErrores] = useState({})

  const equipoSeleccionado = equiposDisponibles.find(e => String(e.id) === String(form.equipoId))
  const cupoUsado = participantes.filter(p => String(p.equipoId) === String(form.equipoId) && p.id !== editando).length

  const validar = () => {
    const e = {}
    if (!form.nombres.trim())   e.nombres   = 'Los nombres son requeridos.'
    if (!form.apellidos.trim()) e.apellidos  = 'Los apellidos son requeridos.'
    if (!form.dni.trim())       e.dni        = 'El DNI es requerido.'
    if (participantes.some(p => p.dni === form.dni && p.id !== editando)) e.dni = 'Ya existe un participante con ese DNI.'
    if (!form.fechaNac)         e.fechaNac   = 'La fecha de nacimiento es requerida.'
    if (!form.equipoId)         e.equipoId   = 'Selecciona un equipo.'
    if (equipoSeleccionado && cupoUsado >= equipoSeleccionado.cupoMax) e.equipoId = `El equipo ya alcanzó el cupo máximo (${equipoSeleccionado.cupoMax}).`
    setErrores(e)
    return Object.keys(e).length === 0
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrores({ ...errores, [e.target.name]: '' })
  }

  const handleGuardar = () => {
    if (!validar()) return
    if (editando !== null) {
      setParticipantes(participantes.map(p => p.id === editando ? { ...form, id: editando } : p))
    } else {
      setParticipantes([...participantes, { ...form, id: Date.now() }])
    }
    setForm(formVacio); setMostrarForm(false); setEditando(null); setErrores({})
  }

  const handleEditar = (p) => {
    setForm({ nombres: p.nombres, apellidos: p.apellidos, dni: p.dni, fechaNac: p.fechaNac, equipoId: p.equipoId, posicion: p.posicion, estado: p.estado })
    setEditando(p.id); setMostrarForm(true); setErrores({})
  }

  const handleEliminar = (id) => { setParticipantes(participantes.filter(p => p.id !== id)); setConfirmarEliminar(null) }

  const getNombreEquipo = (id) => equiposDisponibles.find(e => String(e.id) === String(id))?.nombre || '—'
  const getDisciplina = (id) => equiposDisponibles.find(e => String(e.id) === String(id))?.disciplina || '—'

  const filtrados = participantes.filter(p => {
    const matchBusq = `${p.nombres} ${p.apellidos} ${p.dni}`.toLowerCase().includes(busqueda.toLowerCase())
    const matchEq = filtroEquipo ? String(p.equipoId) === filtroEquipo : true
    return matchBusq && matchEq
  })

  return (
    <InternalLayout titulo="Inscripción de participantes" subtitulo="Registra los jugadores de cada equipo verificando cupos y datos obligatorios">
      <div className="participantes-page">
        <div className="part-topbar">
          <div className="part-filtros">
            <input className="part-search" type="text" placeholder="Buscar por nombre o DNI..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
            <select className="part-select-filtro" value={filtroEquipo} onChange={e => setFiltroEquipo(e.target.value)}>
              <option value="">Todos los equipos</option>
              {equiposDisponibles.map(eq => <option key={eq.id} value={eq.id}>{eq.nombre}</option>)}
            </select>
          </div>
          <button className="btn-nuevo-part" onClick={() => { setMostrarForm(true); setEditando(null); setForm(formVacio) }}>+ Registrar participante</button>
        </div>

        {/* CUPOS POR EQUIPO */}
        <div className="cupos-resumen">
          {equiposDisponibles.map(eq => {
            const usado = participantes.filter(p => String(p.equipoId) === String(eq.id)).length
            const pct = Math.round((usado / eq.cupoMax) * 100)
            return (
              <div className="cupo-item" key={eq.id}>
                <div className="cupo-info">
                  <span className="cupo-nombre">{eq.nombre}</span>
                  <span className="cupo-disc">{eq.disciplina}</span>
                </div>
                <div className="cupo-barra-wrap">
                  <div className="cupo-barra">
                    <div className="cupo-barra-fill" style={{ width: `${pct}%`, background: pct >= 100 ? '#e53e3e' : pct >= 80 ? '#d97706' : '#003087' }}></div>
                  </div>
                  <span className="cupo-texto">{usado}/{eq.cupoMax}</span>
                </div>
              </div>
            )
          })}
        </div>

        {mostrarForm && (
          <div className="part-form-card">
            <div className="part-form-header">
              <h2 className="part-form-titulo">{editando !== null ? 'Editar participante' : 'Registrar participante'}</h2>
              <p className="part-form-subtitulo">Completa los datos del jugador. Se verificará el cupo disponible del equipo.</p>
              {equipoSeleccionado && (
                <span className={`cupo-badge ${cupoUsado >= equipoSeleccionado.cupoMax ? 'cupo-lleno' : 'cupo-ok'}`}>
                  Cupo: {cupoUsado}/{equipoSeleccionado.cupoMax}
                </span>
              )}
            </div>
            <div className="part-form-body">
              <div className="form-row-2">
                <div className="form-group">
                  <label>Nombres</label>
                  <input type="text" name="nombres" placeholder="Nombres del participante" value={form.nombres} onChange={handleChange} className={errores.nombres ? 'input-error' : ''} />
                  {errores.nombres && <span className="error-msg">{errores.nombres}</span>}
                </div>
                <div className="form-group">
                  <label>Apellidos</label>
                  <input type="text" name="apellidos" placeholder="Apellidos del participante" value={form.apellidos} onChange={handleChange} className={errores.apellidos ? 'input-error' : ''} />
                  {errores.apellidos && <span className="error-msg">{errores.apellidos}</span>}
                </div>
              </div>
              <div className="form-row-3">
                <div className="form-group">
                  <label>DNI / Documento</label>
                  <input type="text" name="dni" placeholder="Número de documento" value={form.dni} onChange={handleChange} className={errores.dni ? 'input-error' : ''} />
                  {errores.dni && <span className="error-msg">{errores.dni}</span>}
                </div>
                <div className="form-group">
                  <label>Fecha de nacimiento</label>
                  <input type="date" name="fechaNac" value={form.fechaNac} onChange={handleChange} className={errores.fechaNac ? 'input-error' : ''} />
                  {errores.fechaNac && <span className="error-msg">{errores.fechaNac}</span>}
                </div>
                <div className="form-group">
                  <label>Posición / Rol</label>
                  <input type="text" name="posicion" placeholder="Ej: Delantero, Base..." value={form.posicion} onChange={handleChange} />
                </div>
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Equipo</label>
                  <select name="equipoId" value={form.equipoId} onChange={handleChange} className={errores.equipoId ? 'input-error' : ''}>
                    <option value="">Selecciona un equipo</option>
                    {equiposDisponibles.map(eq => <option key={eq.id} value={eq.id}>{eq.nombre} — {eq.disciplina}</option>)}
                  </select>
                  {errores.equipoId && <span className="error-msg">{errores.equipoId}</span>}
                </div>
                <div className="form-group">
                  <label>Estado</label>
                  <select name="estado" value={form.estado} onChange={handleChange}>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="part-form-footer">
              <button className="btn-cancelar-part" onClick={() => { setMostrarForm(false); setForm(formVacio); setEditando(null); setErrores({}) }}>Cancelar</button>
              <button className="btn-guardar-part" onClick={handleGuardar}>{editando !== null ? 'Guardar cambios' : 'Registrar participante'}</button>
            </div>
          </div>
        )}

        <div className="part-table-wrap">
          <table className="part-table">
            <thead>
              <tr><th>#</th><th>Nombres y apellidos</th><th>DNI</th><th>F. Nacimiento</th><th>Equipo</th><th>Disciplina</th><th>Posición</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr><td colSpan={9} className="td-vacio">{busqueda || filtroEquipo ? 'No se encontraron resultados.' : 'No hay participantes registrados aún.'}</td></tr>
              ) : filtrados.map((p, i) => (
                <tr key={p.id}>
                  <td className="td-num">{i + 1}</td>
                  <td className="td-main">{p.nombres} {p.apellidos}</td>
                  <td>{p.dni}</td>
                  <td>{p.fechaNac ? p.fechaNac.split('-').reverse().join('/') : '—'}</td>
                  <td>{getNombreEquipo(p.equipoId)}</td>
                  <td><span className="tag-disc">{getDisciplina(p.equipoId)}</span></td>
                  <td>{p.posicion || '—'}</td>
                  <td><span className={`estado-badge ${p.estado === 'Activo' ? 'estado-activo' : 'estado-inactivo'}`}>{p.estado}</span></td>
                  <td>
                    <div className="acciones">
                      <button className="btn-editar-part" onClick={() => handleEditar(p)}>Editar</button>
                      <button className="btn-eliminar-part" onClick={() => setConfirmarEliminar(p.id)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="part-contador">{filtrados.length} participante{filtrados.length !== 1 ? 's' : ''} registrado{filtrados.length !== 1 ? 's' : ''}</p>

        {confirmarEliminar && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h3 className="modal-titulo">Confirmar eliminación</h3>
              <p className="modal-desc">Se eliminará el participante del sistema. Esta acción no se puede deshacer.</p>
              <div className="modal-acciones">
                <button className="btn-cancelar-part" onClick={() => setConfirmarEliminar(null)}>Cancelar</button>
                <button className="btn-eliminar-confirm" onClick={() => handleEliminar(confirmarEliminar)}>Eliminar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </InternalLayout>
  )
}

export default ParticipantesPage