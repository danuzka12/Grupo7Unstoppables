import { useState, useEffect } from 'react'
import InternalLayout from '../layouts/InternalLayout'
import '../styles/disciplinas.css'

const API      = 'http://localhost:8080/api/deportes'
const API_CATS = 'http://localhost:8080/api/categorias'

const formVacio = {
  nombre:       '',
  descripcion:  '',
  tipo:         'GRUPAL',
  minJugadores: '',
  maxJugadores: '',
  categoriaIds: []
}

function DisciplinasPage() {
  const [disciplinas, setDisciplinas]             = useState([])
  const [categorias, setCategorias]               = useState([])
  const [mostrarForm, setMostrarForm]             = useState(false)
  const [modoEdicion, setModoEdicion]             = useState(false)
  const [idEditando, setIdEditando]               = useState(null)
  const [busqueda, setBusqueda]                   = useState('')
  const [confirmarEliminar, setConfirmarEliminar] = useState(null)
  const [detalle, setDetalle]                     = useState(null)
  const [error, setError]                         = useState('')
  const [form, setForm]                           = useState(formVacio)

  // ── CARGAR ──────────────────────────────────────
  const cargar = async () => {
    try {
      const [resD, resC] = await Promise.all([fetch(API), fetch(API_CATS)])
      if (resD.ok) setDisciplinas(await resD.json())
      if (resC.ok) setCategorias(await resC.json())
    } catch (e) { console.error('Error cargando datos', e) }
  }

  useEffect(() => { cargar() }, [])

  // ── FORM ────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  // Maneja el select multiple de categorías
  const handleCategorias = (e) => {
    const seleccionados = Array.from(e.target.selectedOptions).map(o => Number(o.value))
    setForm(prev => ({ ...prev, categoriaIds: seleccionados }))
  }

  const abrirNuevo = () => {
    setForm(formVacio)
    setError('')
    setModoEdicion(false)
    setIdEditando(null)
    setMostrarForm(true)
  }

  const handleEditar = (d) => {
    setForm({
      nombre:       d.nombre || '',
      descripcion:  d.descripcion || '',
      tipo:         d.tipo || 'GRUPAL',
      minJugadores: d.minJugadores ?? '',
      maxJugadores: d.maxJugadores ?? '',
      categoriaIds: (d.categorias || []).map(c => c.idCategoria)
    })
    setError('')
    setIdEditando(d.idDeporte)
    setModoEdicion(true)
    setMostrarForm(true)
  }

  // ── GUARDAR ─────────────────────────────────────
  const handleGuardar = async () => {
    setError('')
    if (!form.nombre.trim()) { setError('El nombre es obligatorio'); return }

    const payload = {
      nombre:       form.nombre.trim(),
      descripcion:  form.descripcion,
      tipo:         form.tipo,
      minJugadores: form.minJugadores ? Number(form.minJugadores) : null,
      maxJugadores: form.maxJugadores ? Number(form.maxJugadores) : null,
      categoriaIds: form.categoriaIds || []
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
      if (!res.ok) throw new Error('Error eliminando')
      setConfirmarEliminar(null)
      await cargar()
    } catch (e) { console.error(e.message) }
  }

  const filtrados = disciplinas.filter(d =>
    d.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <InternalLayout titulo="Disciplinas" subtitulo="Gestión de deportes">
      <div className="disciplinas-page">

        {/* TOP */}
        <div className="disc-topbar">
          <input
            className="disc-search"
            placeholder="Buscar..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          <button className="btn-nueva" onClick={abrirNuevo}>+ Nuevo deporte</button>
        </div>

        {/* FORMULARIO */}
        {mostrarForm && (
          <div className="disc-form-card">
            <div className="disc-form-body">

              <div className="disc-form-grid">
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Nombre *"
                />
                <input
                  name="minJugadores"
                  type="number"
                  min="1"
                  value={form.minJugadores}
                  onChange={handleChange}
                  placeholder="Mín. jugadores"
                />
                <input
                  name="maxJugadores"
                  type="number"
                  min="1"
                  value={form.maxJugadores}
                  onChange={handleChange}
                  placeholder="Máx. jugadores"
                />

                {/* TIPO como select */}
                <div className="disc-field">
                  <label className="disc-label">Modalidad</label>
                  <select name="tipo" value={form.tipo} onChange={handleChange}>
                    <option value="GRUPAL">Grupal</option>
                    <option value="INDIVIDUAL">Individual</option>
                  </select>
                </div>


                {/* CATEGORÍAS */}
                <div className="disc-field">
                    <label className="disc-label">Categorías</label>
                    {categorias.map(c => (
                      <label key={c.idCategoria} className="disc-check-option">
                        <input
                          type="checkbox"
                          checked={(form.categoriaIds || []).includes(c.idCategoria)}
                          onChange={() => {
                            const ids = (form.categoriaIds || []).includes(c.idCategoria)
                              ? form.categoriaIds.filter(id => id !== c.idCategoria)
                              : [...(form.categoriaIds || []), c.idCategoria]
                            setForm(prev => ({ ...prev, categoriaIds: ids }))
                          }}
                        />
                        {c.nombre}
                      </label>
                    ))}
                </div>
              </div>

              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                placeholder="Descripción"
              />

              {error && <p className="disc-error">{error}</p>}

              <div className="disc-form-footer">
                <button className="btn-cancelar" onClick={() => setMostrarForm(false)}>Cancelar</button>
                <button className="btn-guardar" onClick={handleGuardar}>
                  {modoEdicion ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TABLA */}
        <div className="disc-table-wrap">
          <table className="disc-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Detalles</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(d => (
                <tr key={d.idDeporte}>
                  <td><strong>{d.nombre}</strong></td>
                  <td>
                    <span className={`disc-badge ${d.tipo === 'INDIVIDUAL' ? 'badge-ind' : 'badge-grp'}`}>
                      {d.tipo}
                    </span>
                  </td>
                  <td>
                    <button className="btn-detalle" onClick={() => setDetalle(d)}>Ver</button>
                  </td>
                  <td>
                    <div className="acciones">
                      <button className="btn-editar"   onClick={() => handleEditar(d)}>Editar</button>
                      <button className="btn-eliminar" onClick={() => setConfirmarEliminar(d.idDeporte)}>Eliminar</button>
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
                <span className={`disc-badge ${detalle.tipo === 'INDIVIDUAL' ? 'badge-ind' : 'badge-grp'}`}>
                  {detalle.tipo}
                </span>
              </div>
              <p className="spotlight-desc">
                {detalle.descripcion || <em>Sin descripción.</em>}
              </p>
              <div className="spotlight-stats">
                <div className="spotlight-stat">
                  <span className="stat-label">Mín. jugadores</span>
                  <span className="stat-valor">{detalle.minJugadores ?? '—'}</span>
                </div>
                <div className="spotlight-stat">
                  <span className="stat-label">Máx. jugadores</span>
                  <span className="stat-valor">{detalle.maxJugadores ?? '—'}</span>
                </div>
                <div className="spotlight-stat">
                  <span className="stat-label">Estado</span>
                  <span className={`stat-valor estado-${detalle.estado?.toLowerCase()}`}>
                    {detalle.estado}
                  </span>
                </div>
              </div>
              <div className="spotlight-cats">
                <span className="stat-label">Categorías</span>
                <div className="disc-cats-inline" style={{ marginTop: 8 }}>
                  {(detalle.categorias || []).length > 0
                    ? detalle.categorias.map(c => (
                        <span key={c.idCategoria} className="disc-cat-tag">{c.nombre}</span>
                      ))
                    : <span className="disc-sin-cat">Sin categorías asignadas</span>
                  }
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL ELIMINAR */}
        {confirmarEliminar && (
          <div className="modal-overlay">
            <div className="modal-box">
              <p>¿Eliminar este deporte?</p>
              <button onClick={() => handleEliminar(confirmarEliminar)}>Sí, eliminar</button>
              <button onClick={() => setConfirmarEliminar(null)}>Cancelar</button>
            </div>
          </div>
        )}

      </div>
    </InternalLayout>
  )
}

export default DisciplinasPage
