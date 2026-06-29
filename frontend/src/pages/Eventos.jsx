import { useState, useEffect } from 'react'
import InternalLayout from '../layouts/InternalLayout'
import '../styles/eventos.css'

const API      = 'http://localhost:8080/api/eventos'
const API_INST = 'http://localhost:8080/api/instituciones'
const API_DEP  = 'http://localhost:8080/api/deportes'

const ESTADOS = ['BORRADOR','ABIERTO','EN_CURSO','FINALIZADO','CANCELADO']

const estadoColor = {
  BORRADOR:   'badge-borrador',
  ABIERTO:    'badge-abierto',
  EN_CURSO:   'badge-encurso',
  FINALIZADO: 'badge-finalizado',
  CANCELADO:  'badge-cancelado'
}

const formVacio = {
  nombre: '', descripcion: '', fechaInicio: '', fechaFin: '',
  fechaLimiteInsc: '', premio: '', minEquipos: '',
  estado: 'BORRADOR', idInstitucion: ''
}

export default function EventosPage() {
  const [eventos, setEventos]                     = useState([])
  const [instituciones, setInstituciones]         = useState([])
  const [deportes, setDeportes]                   = useState([])
  const [mostrarForm, setMostrarForm]             = useState(false)
  const [modoEdicion, setModoEdicion]             = useState(false)
  const [idEditando, setIdEditando]               = useState(null)
  const [busqueda, setBusqueda]                   = useState('')
  const [confirmarEliminar, setConfirmarEliminar] = useState(null)
  const [detalle, setDetalle]                     = useState(null)
  const [error, setError]                         = useState('')
  const [form, setForm]                           = useState(formVacio)

  // Deportes seleccionados: [{idDeporte, idCategoria}]
  const [deportesEvento, setDeportesEvento] = useState([])

  const usuario          = JSON.parse(sessionStorage.getItem('usuario') || '{}')
  const idUsuarioCreador = usuario?.idUsuario ?? null

  // ── CARGAR ──────────────────────────────────────
  const cargar = async () => {
    try {
      const [resE, resI, resD] = await Promise.all([
        fetch(API), fetch(API_INST), fetch(API_DEP)
      ])
      if (resE.ok) setEventos(await resE.json())
      if (resI.ok) setInstituciones(await resI.json())
      if (resD.ok) setDeportes(await resD.json())
    } catch (e) { console.error(e) }
  }

  useEffect(() => { cargar() }, [])

  // ── FORM ────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const abrirNuevo = () => {
    setForm(formVacio)
    setDeportesEvento([])
    setError('')
    setModoEdicion(false)
    setIdEditando(null)
    setMostrarForm(true)
  }

  const handleEditar = (ev) => {
    setForm({
      nombre:          ev.nombre          || '',
      descripcion:     ev.descripcion     || '',
      fechaInicio:     ev.fechaInicio     || '',
      fechaFin:        ev.fechaFin        || '',
      fechaLimiteInsc: ev.fechaLimiteInsc || '',
      premio:          ev.premio          || '',
      minEquipos:      ev.minEquipos      ?? '',
      estado:          ev.estado          || 'BORRADOR',
      idInstitucion:   ev.idInstitucion   || ''
    })
    // Cargar deportes actuales del evento
    setDeportesEvento((ev.deportes || []).map(d => ({
      idDeporte:   d.idDeporte,
      idCategoria: d.idCategoria
    })))
    setError('')
    setIdEditando(ev.idEvento)
    setModoEdicion(true)
    setMostrarForm(true)
  }

  // ── DEPORTES DEL EVENTO ─────────────────────────
  const agregarDeporte = () => {
    setDeportesEvento(prev => [...prev, { idDeporte: '', idCategoria: '' }])
  }

  const actualizarDeporte = (index, campo, valor) => {
    setDeportesEvento(prev => prev.map((d, i) => {
      if (i !== index) return d
      // Si cambia el deporte, la categoría anterior puede ya no ser válida
      if (campo === 'idDeporte') return { ...d, idDeporte: valor, idCategoria: '' }
      return { ...d, [campo]: valor }
    }))
  }

  const quitarDeporte = (index) => {
    setDeportesEvento(prev => prev.filter((_, i) => i !== index))
  }

  // ── GUARDAR ─────────────────────────────────────
  const handleGuardar = async () => {
    setError('')
    if (!form.nombre.trim())  { setError('El nombre es obligatorio'); return }
    if (!form.fechaInicio)    { setError('La fecha de inicio es obligatoria'); return }
    if (!form.fechaFin)       { setError('La fecha de fin es obligatoria'); return }
    if (!form.idInstitucion)  { setError('Selecciona una institución'); return }

    // Validar que cada deporte tenga deporte y categoría
    for (const d of deportesEvento) {
      if (!d.idDeporte || !d.idCategoria) {
        setError('Completa deporte y categoría en cada fila de disciplinas')
        return
      }
    }

    const payload = {
      nombre:          form.nombre.trim(),
      descripcion:     form.descripcion,
      fechaInicio:     form.fechaInicio,
      fechaFin:        form.fechaFin,
      fechaLimiteInsc: form.fechaLimiteInsc || null,
      premio:          form.premio,
      minEquipos:      form.minEquipos ? Number(form.minEquipos) : 2,
      estado:          form.estado,
      idInstitucion:   Number(form.idInstitucion),
      idUsuarioCreador,
      deportes: deportesEvento.map(d => ({
        idDeporte:   Number(d.idDeporte),
        idCategoria: Number(d.idCategoria)
      }))
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
      setDeportesEvento([])
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

  const nombreInst = (id) =>
    instituciones.find(i => i.idInstitucion === id)?.nombre || '—'

  const filtrados = eventos.filter(e =>
    e.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <InternalLayout titulo="Eventos" subtitulo="Gestión de eventos deportivos">
      <div className="ev-page">

        {/* TOP */}
        <div className="ev-topbar">
          <input className="ev-search" placeholder="Buscar..." value={busqueda}
            onChange={e => setBusqueda(e.target.value)} />
          <button className="btn-nueva" onClick={abrirNuevo}>+ Nuevo evento</button>
        </div>

        {/* FORMULARIO */}
        {mostrarForm && (
          <div className="ev-form-card">
            <div className="ev-form-body">

              <div className="ev-form-grid">
                <div className="ev-field">
                  <label className="ev-label">Nombre *</label>
                  <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre del evento" />
                </div>

                <div className="ev-field">
                  <label className="ev-label">Premio</label>
                  <input name="premio" value={form.premio} onChange={handleChange} placeholder="Premio" />
                </div>

                <div className="ev-field">
                  <label className="ev-label">Fecha de inicio</label>
                  <input name="fechaInicio" type="date" value={form.fechaInicio} onChange={handleChange} />
                </div>

                <div className="ev-field">
                  <label className="ev-label">Fecha de fin</label>
                  <input name="fechaFin" type="date" value={form.fechaFin} onChange={handleChange} />
                </div>

                <div className="ev-field">
                  <label className="ev-label">Fecha límite de inscripción</label>
                  <input name="fechaLimiteInsc" type="date" value={form.fechaLimiteInsc} onChange={handleChange} />
                </div>

                <div className="ev-field">
                  <label className="ev-label">Mín. equipos</label>
                  <input name="minEquipos" type="number" min="2" value={form.minEquipos} onChange={handleChange} placeholder="Mín. equipos" />
                </div>

                <div className="ev-field">
                  <label className="ev-label">Estado</label>
                  <select name="estado" value={form.estado} onChange={handleChange}>
                    {ESTADOS.map(s => (
                      <option key={s} value={s}>{s.replace('_',' ')}</option>
                    ))}
                  </select>
                </div>

                <div className="ev-field">
                  <label className="ev-label">Institución *</label>
                  <select name="idInstitucion" value={form.idInstitucion} onChange={handleChange}>
                    <option value="">Seleccionar...</option>
                    {instituciones.map(i => (
                      <option key={i.idInstitucion} value={i.idInstitucion}>{i.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="ev-field">
                <label className="ev-label">Descripción</label>
                <textarea name="descripcion" value={form.descripcion}
                  onChange={handleChange} placeholder="Descripción" />
              </div>

              {/* DISCIPLINAS DEL EVENTO */}
              <div className="ev-deportes-section">
                <div className="ev-deportes-header">
                  <span className="ev-label">Disciplinas del evento</span>
                  <button className="btn-add-deporte" type="button" onClick={agregarDeporte}>
                    + Agregar disciplina
                  </button>
                </div>

                {deportesEvento.length > 0 && (
                  <div className="ev-deporte-row ev-deporte-row-header">
                    <span className="ev-label">Deporte</span>
                    <span className="ev-label">Categoría</span>
                    <span></span>
                  </div>
                )}

                {deportesEvento.map((d, i) => {
                  const categoriasDelDeporte = deportes
                    .find(dep => dep.idDeporte === Number(d.idDeporte))?.categorias || []

                  return (
                    <div key={i} className="ev-deporte-row">
                      <select value={d.idDeporte}
                        onChange={e => actualizarDeporte(i, 'idDeporte', e.target.value)}>
                        <option value="">Deporte...</option>
                        {deportes.map(dep => (
                          <option key={dep.idDeporte} value={dep.idDeporte}>{dep.nombre}</option>
                        ))}
                      </select>

                      <select value={d.idCategoria} disabled={!d.idDeporte}
                        onChange={e => actualizarDeporte(i, 'idCategoria', e.target.value)}>
                        <option value="">
                          {d.idDeporte ? 'Categoría...' : 'Elige un deporte primero'}
                        </option>
                        {categoriasDelDeporte.map(c => (
                          <option key={c.idCategoria} value={c.idCategoria}>{c.nombre}</option>
                        ))}
                      </select>

                      <button className="btn-quitar-deporte" type="button" onClick={() => quitarDeporte(i)}>✕</button>
                    </div>
                  )
                })}
              </div>

              {error && <p className="ev-error">{error}</p>}

              <div className="ev-form-footer">
                <button className="btn-cancelar" onClick={() => setMostrarForm(false)}>Cancelar</button>
                <button className="btn-guardar"  onClick={handleGuardar}>
                  {modoEdicion ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TABLA */}
        <div className="ev-table-wrap">
          <table className="ev-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Institución</th>
                <th>Fechas</th>
                <th>Estado</th>
                <th>Detalles</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(ev => (
                <tr key={ev.idEvento}>
                  <td><strong>{ev.nombre}</strong></td>
                  <td>{nombreInst(ev.idInstitucion)}</td>
                  <td className="ev-fechas">{ev.fechaInicio} → {ev.fechaFin}</td>
                  <td>
                    <span className={`ev-badge ${estadoColor[ev.estado] || ''}`}>
                      {ev.estado?.replace('_',' ')}
                    </span>
                  </td>
                  <td>
                    <button className="btn-detalle" onClick={() => setDetalle(ev)}>Ver</button>
                  </td>
                  <td>
                    <div className="acciones">
                      <button className="btn-editar"   onClick={() => handleEditar(ev)}>Editar</button>
                      <button className="btn-eliminar" onClick={() => setConfirmarEliminar(ev.idEvento)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SPOTLIGHT */}
        {detalle && (
          <div className="modal-overlay" onClick={() => setDetalle(null)}>
            <div className="spotlight-box" onClick={e => e.stopPropagation()}>
              <button className="spotlight-close" onClick={() => setDetalle(null)}>✕</button>
              <div className="spotlight-header">
                <h2 className="spotlight-titulo">{detalle.nombre}</h2>
                <span className={`ev-badge ${estadoColor[detalle.estado] || ''}`}>
                  {detalle.estado?.replace('_',' ')}
                </span>
              </div>
              <p className="spotlight-desc">{detalle.descripcion || <em>Sin descripción.</em>}</p>
              <div className="spotlight-stats">
                <div className="spotlight-stat">
                  <span className="stat-label">Institución</span>
                  <span className="stat-valor stat-sm">{nombreInst(detalle.idInstitucion)}</span>
                </div>
                <div className="spotlight-stat">
                  <span className="stat-label">Mín. equipos</span>
                  <span className="stat-valor">{detalle.minEquipos ?? '—'}</span>
                </div>
                <div className="spotlight-stat">
                  <span className="stat-label">Premio</span>
                  <span className="stat-valor stat-sm">{detalle.premio || '—'}</span>
                </div>
              </div>
              <div className="spotlight-stats" style={{ marginTop: 12 }}>
                <div className="spotlight-stat">
                  <span className="stat-label">Inicio</span>
                  <span className="stat-valor stat-sm">{detalle.fechaInicio}</span>
                </div>
                <div className="spotlight-stat">
                  <span className="stat-label">Fin</span>
                  <span className="stat-valor stat-sm">{detalle.fechaFin}</span>
                </div>
                <div className="spotlight-stat">
                  <span className="stat-label">Límite inscripción</span>
                  <span className="stat-valor stat-sm">{detalle.fechaLimiteInsc || '—'}</span>
                </div>
              </div>

              {/* Disciplinas del evento */}
              {(detalle.deportes || []).length > 0 && (
                <div className="spotlight-cats" style={{ marginTop: 16 }}>
                  <span className="stat-label">Disciplinas</span>
                  <div className="ev-deportes-tags">
                    {detalle.deportes.map((d, i) => (
                      <span key={i} className="disc-cat-tag">
                        {d.nombreDeporte} — {d.nombreCategoria}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL ELIMINAR */}
        {confirmarEliminar && (
          <div className="modal-overlay">
            <div className="modal-box">
              <p>¿Eliminar este evento?</p>
              <button onClick={() => handleEliminar(confirmarEliminar)}>Sí, eliminar</button>
              <button onClick={() => setConfirmarEliminar(null)}>Cancelar</button>
            </div>
          </div>
        )}

      </div>
    </InternalLayout>
  )
}
