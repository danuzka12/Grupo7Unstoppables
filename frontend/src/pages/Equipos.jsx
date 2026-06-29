import { useState, useEffect } from 'react'
import InternalLayout from '../layouts/InternalLayout'
import '../styles/equipos.css'

const API      = 'http://localhost:8080/api/equipos'
const API_EVS  = 'http://localhost:8080/api/eventos'
const API_INST = 'http://localhost:8080/api/instituciones'

const ESTADOS = ['PENDIENTE','APROBADO','RECHAZADO','RETIRADO']

const estadoColor = {
  PENDIENTE:  'badge-pendiente',
  APROBADO:   'badge-aprobado',
  RECHAZADO:  'badge-rechazado',
  RETIRADO:   'badge-retirado'
}

const formVacio = {
  nombre:            '',
  colorUniforme:     '',
  estadoInscripcion: 'PENDIENTE',
  idEvento:          '',
  idEventoDeporte:   '',
  idInstitucion:     ''
}

export default function EquiposPage() {
  const [equipos, setEquipos]                     = useState([])
  const [eventos, setEventos]                     = useState([])
  const [instituciones, setInstituciones]         = useState([])
  const [mostrarForm, setMostrarForm]             = useState(false)
  const [modoEdicion, setModoEdicion]             = useState(false)
  const [idEditando, setIdEditando]               = useState(null)
  const [busqueda, setBusqueda]                   = useState('')
  const [filtroEvento, setFiltroEvento]           = useState('')
  const [confirmarEliminar, setConfirmarEliminar] = useState(null)
  const [detalle, setDetalle]                     = useState(null)
  const [error, setError]                         = useState('')
  const [form, setForm]                           = useState(formVacio)

  // Disciplinas del evento seleccionado
  const eventoSel = eventos.find(e => String(e.idEvento) === String(form.idEvento))
  const disciplinas = eventoSel?.deportes || []

  // ── CARGAR ──────────────────────────────────────
  const cargar = async () => {
    try {
      const [resE, resEv, resI] = await Promise.all([
        fetch(API), fetch(API_EVS), fetch(API_INST)
      ])
      if (resE.ok)  setEquipos(await resE.json())
      if (resEv.ok) setEventos(await resEv.json())
      if (resI.ok)  setInstituciones(await resI.json())
    } catch (e) { console.error(e) }
  }

  useEffect(() => { cargar() }, [])

  // ── FORM ────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'idEvento') {
      setForm(prev => ({ ...prev, idEvento: value, idEventoDeporte: '' }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
  }

  const abrirNuevo = () => {
    setForm(formVacio)
    setError('')
    setModoEdicion(false)
    setIdEditando(null)
    setMostrarForm(true)
  }

  const handleEditar = (eq) => {
    setForm({
      nombre:            eq.nombre            || '',
      colorUniforme:     eq.colorUniforme     || '',
      estadoInscripcion: eq.estadoInscripcion || 'PENDIENTE',
      idEvento:          eq.idEvento          || '',
      idEventoDeporte:   eq.idEventoDeporte   || '',
      idInstitucion:     eq.idInstitucion     || ''
    })
    setError('')
    setIdEditando(eq.idEquipo)
    setModoEdicion(true)
    setMostrarForm(true)
  }

  // ── GUARDAR ─────────────────────────────────────
  const handleGuardar = async () => {
    setError('')
    if (!form.nombre.trim())       { setError('El nombre es obligatorio'); return }
    if (!form.idEvento)            { setError('Selecciona un evento'); return }
    if (!form.idEventoDeporte)     { setError('Selecciona una disciplina'); return }
    if (!form.idInstitucion)       { setError('Selecciona una institución'); return }

    const payload = {
      nombre:            form.nombre.trim(),
      colorUniforme:     form.colorUniforme || null,
      estadoInscripcion: form.estadoInscripcion,
      idEventoDeporte:   Number(form.idEventoDeporte),
      idInstitucion:     Number(form.idInstitucion)
    }

    try {
      const url    = modoEdicion ? `${API}/${idEditando}` : API
      const method = modoEdicion ? 'PUT' : 'POST'
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error(await res.text())
      setForm(formVacio)
      setMostrarForm(false)
      setModoEdicion(false)
      setIdEditando(null)
      await cargar()
    } catch (e) { setError(e.message || 'Error al guardar') }
  }

  // ── ELIMINAR ────────────────────────────────────
  const handleEliminar = async (id) => {
    try {
      const res = await fetch(`${API}/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setConfirmarEliminar(null)
      await cargar()
    } catch (e) { console.error(e) }
  }

  const filtrados = equipos.filter(eq => {
    const matchBusq   = eq.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
                        eq.nombreInstitucion?.toLowerCase().includes(busqueda.toLowerCase())
    const matchEvento = filtroEvento ? String(eq.idEvento) === filtroEvento : true
    return matchBusq && matchEvento
  })

  return (
    <InternalLayout titulo="Inscripción de equipos" subtitulo="Registra y gestiona los equipos por evento y disciplina">
      <div className="equipos-page">

        {/* TOP */}
        <div className="eq-topbar">
          <div className="eq-filtros">
            <input className="eq-search" placeholder="Buscar equipo o institución..."
              value={busqueda} onChange={e => setBusqueda(e.target.value)} />
            <select className="eq-select-filtro" value={filtroEvento}
              onChange={e => setFiltroEvento(e.target.value)}>
              <option value="">Todos los eventos</option>
              {eventos.map(ev => (
                <option key={ev.idEvento} value={ev.idEvento}>{ev.nombre}</option>
              ))}
            </select>
          </div>
          <button className="btn-nuevo-eq" onClick={abrirNuevo}>+ Inscribir equipo</button>
        </div>

        {/* FORMULARIO */}
        {mostrarForm && (
          <div className="eq-form-card">
            <div className="eq-form-header">
              <h2 className="eq-form-titulo">{modoEdicion ? 'Editar equipo' : 'Inscribir equipo'}</h2>
              <p className="eq-form-subtitulo">Completa los datos del equipo, evento y disciplina.</p>
            </div>
            <div className="eq-form-body">

              <div className="form-row-2">
                <div className="form-group">
                  <label>Nombre del equipo *</label>
                  <input name="nombre" value={form.nombre} onChange={handleChange}
                    placeholder="Ej: Equipo Norte" />
                </div>
                <div className="form-group">
                  <label>Color de uniforme</label>
                  <input name="colorUniforme" value={form.colorUniforme} onChange={handleChange}
                    placeholder="Ej: Azul y blanco" />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Evento *</label>
                  <select name="idEvento" value={form.idEvento} onChange={handleChange}>
                    <option value="">Selecciona un evento...</option>
                    {eventos.map(ev => (
                      <option key={ev.idEvento} value={ev.idEvento}>{ev.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Disciplina *</label>
                  <select name="idEventoDeporte" value={form.idEventoDeporte}
                    onChange={handleChange} disabled={!form.idEvento}>
                    <option value="">Selecciona una disciplina...</option>
                    {disciplinas.map(d => (
                      <option key={d.idEventoDeporte} value={d.idEventoDeporte}>
                        {d.nombreDeporte} — {d.nombreCategoria}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Institución *</label>
                  <select name="idInstitucion" value={form.idInstitucion} onChange={handleChange}>
                    <option value="">Selecciona una institución...</option>
                    {instituciones.map(i => (
                      <option key={i.idInstitucion} value={i.idInstitucion}>{i.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Estado de inscripción</label>
                  <select name="estadoInscripcion" value={form.estadoInscripcion} onChange={handleChange}>
                    {ESTADOS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

            </div>

            {error && <p className="eq-error">{error}</p>}

            <div className="eq-form-footer">
              <button className="btn-cancelar-eq" onClick={() => setMostrarForm(false)}>Cancelar</button>
              <button className="btn-guardar-eq"  onClick={handleGuardar}>
                {modoEdicion ? 'Guardar cambios' : 'Inscribir equipo'}
              </button>
            </div>
          </div>
        )}

        {/* TABLA */}
        <div className="eq-table-wrap">
          <table className="eq-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Equipo</th>
                <th>Institución</th>
                <th>Evento</th>
                <th>Disciplina</th>
                <th>Estado</th>
                <th>Detalles</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr><td colSpan={8} className="td-vacio">No hay equipos inscritos aún.</td></tr>
              ) : filtrados.map((eq, i) => (
                <tr key={eq.idEquipo}>
                  <td className="td-num">{i + 1}</td>
                  <td className="td-main"><strong>{eq.nombre}</strong></td>
                  <td>{eq.nombreInstitucion || '—'}</td>
                  <td className="td-evento">{eq.nombreEvento || '—'}</td>
                  <td>
                    <span className="tag-disc">
                      {eq.nombreDeporte} {eq.nombreCategoria ? `— ${eq.nombreCategoria}` : ''}
                    </span>
                  </td>
                  <td>
                    <span className={`estado-badge ${estadoColor[eq.estadoInscripcion] || ''}`}>
                      {eq.estadoInscripcion}
                    </span>
                  </td>
                  <td>
                    <button className="btn-detalle" onClick={() => setDetalle(eq)}>Ver</button>
                  </td>
                  <td>
                    <div className="acciones">
                      <button className="btn-editar-eq"   onClick={() => handleEditar(eq)}>Editar</button>
                      <button className="btn-eliminar-eq" onClick={() => setConfirmarEliminar(eq.idEquipo)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="eq-contador">{filtrados.length} equipo{filtrados.length !== 1 ? 's' : ''} registrado{filtrados.length !== 1 ? 's' : ''}</p>

        {/* SPOTLIGHT */}
        {detalle && (
          <div className="modal-overlay" onClick={() => setDetalle(null)}>
            <div className="spotlight-box" onClick={e => e.stopPropagation()}>
              <button className="spotlight-close" onClick={() => setDetalle(null)}>✕</button>
              <div className="spotlight-header">
                <h2 className="spotlight-titulo">{detalle.nombre}</h2>
                <span className={`estado-badge ${estadoColor[detalle.estadoInscripcion] || ''}`}>
                  {detalle.estadoInscripcion}
                </span>
              </div>
              <div className="spotlight-stats">
                <div className="spotlight-stat">
                  <span className="stat-label">Institución</span>
                  <span className="stat-valor stat-sm">{detalle.nombreInstitucion || '—'}</span>
                </div>
                <div className="spotlight-stat">
                  <span className="stat-label">Evento</span>
                  <span className="stat-valor stat-sm">{detalle.nombreEvento || '—'}</span>
                </div>
                <div className="spotlight-stat">
                  <span className="stat-label">Disciplina</span>
                  <span className="stat-valor stat-sm">
                    {detalle.nombreDeporte} {detalle.nombreCategoria ? `— ${detalle.nombreCategoria}` : ''}
                  </span>
                </div>
                <div className="spotlight-stat">
                  <span className="stat-label">Color uniforme</span>
                  <span className="stat-valor stat-sm">{detalle.colorUniforme || '—'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL ELIMINAR */}
        {confirmarEliminar && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h3 className="modal-titulo">Confirmar eliminación</h3>
              <p className="modal-desc">Se eliminará el equipo. Esta acción no se puede deshacer.</p>
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
