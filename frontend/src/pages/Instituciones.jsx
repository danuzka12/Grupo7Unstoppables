import { useState, useEffect } from 'react'
import InternalLayout from '../layouts/InternalLayout'
import '../styles/instituciones.css'

const API = 'http://localhost:8080/api/instituciones'

const formVacio = { nombre: '', direccion: '', telefono: '', email: '', logo: null }

export default function InstitucionesPage() {
  const [instituciones, setInstituciones]         = useState([])
  const [mostrarForm, setMostrarForm]             = useState(false)
  const [modoEdicion, setModoEdicion]             = useState(false)
  const [idEditando, setIdEditando]               = useState(null)
  const [busqueda, setBusqueda]                   = useState('')
  const [confirmarEliminar, setConfirmarEliminar] = useState(null)
  const [detalle, setDetalle]                     = useState(null)
  const [error, setError]                         = useState('')
  const [form, setForm]                           = useState(formVacio)
  const [previewLogo, setPreviewLogo]             = useState(null)

  const cargar = async () => {
    try {
      const res = await fetch(API)
      if (res.ok) setInstituciones(await res.json())
    } catch (e) { console.error(e) }
  }

  useEffect(() => { cargar() }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleLogo = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setForm(prev => ({ ...prev, logo: file }))
    setPreviewLogo(URL.createObjectURL(file))
  }

  const abrirNuevo = () => {
    setForm(formVacio)
    setPreviewLogo(null)
    setError('')
    setModoEdicion(false)
    setIdEditando(null)
    setMostrarForm(true)
  }

  const handleEditar = (inst) => {
    setForm({ nombre: inst.nombre || '', direccion: inst.direccion || '',
              telefono: inst.telefono || '', email: inst.email || '', logo: null })
    setPreviewLogo(inst.logoBase64 || null)
    setError('')
    setIdEditando(inst.idInstitucion)
    setModoEdicion(true)
    setMostrarForm(true)
  }

  const handleGuardar = async () => {
    setError('')
    if (!form.nombre.trim()) { setError('El nombre es obligatorio'); return }

    const data = new FormData()
    data.append('nombre',    form.nombre.trim())
    data.append('direccion', form.direccion || '')
    data.append('telefono',  form.telefono  || '')
    data.append('email',     form.email     || '')
    if (form.logo) data.append('logo', form.logo)

    try {
      const url    = modoEdicion ? `${API}/${idEditando}` : API
      const method = modoEdicion ? 'PUT' : 'POST'
      const res    = await fetch(url, { method, body: data })
      if (!res.ok) throw new Error(await res.text())
      setForm(formVacio)
      setPreviewLogo(null)
      setMostrarForm(false)
      setModoEdicion(false)
      setIdEditando(null)
      await cargar()
    } catch (e) { setError(e.message || 'Error al guardar') }
  }

  const handleEliminar = async (id) => {
    try {
      const res = await fetch(`${API}/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setConfirmarEliminar(null)
      await cargar()
    } catch (e) { console.error(e) }
  }

  const filtradas = instituciones.filter(i =>
    i.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <InternalLayout titulo="Instituciones" subtitulo="Gestión de instituciones">
      <div className="inst-page">

        <div className="inst-topbar">
          <input className="inst-search" placeholder="Buscar..." value={busqueda}
            onChange={e => setBusqueda(e.target.value)} />
          <button className="btn-nueva" onClick={abrirNuevo}>+ Nueva institución</button>
        </div>

        {mostrarForm && (
          <div className="inst-form-card">
            <div className="inst-form-body">
              <div className="inst-form-grid">
                <input name="nombre"    value={form.nombre}    onChange={handleChange} placeholder="Nombre *" />
                <input name="telefono"  value={form.telefono}  onChange={handleChange} placeholder="Teléfono" />
                <input name="email"     value={form.email}     onChange={handleChange} placeholder="Email" type="email" />
                <input name="direccion" value={form.direccion} onChange={handleChange} placeholder="Dirección" />

                <div className="inst-field inst-full">
                  <label className="inst-label">Logo</label>
                  <input type="file" accept="image/*" onChange={handleLogo} className="inst-file-input" />
                  {previewLogo && (
                    <div className="inst-logo-preview">
                      <img src={previewLogo} alt="Preview" />
                    </div>
                  )}
                </div>
              </div>

              {error && <p className="inst-error">{error}</p>}

              <div className="inst-form-footer">
                <button className="btn-cancelar" onClick={() => setMostrarForm(false)}>Cancelar</button>
                <button className="btn-guardar"  onClick={handleGuardar}>
                  {modoEdicion ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="inst-table-wrap">
          <table className="inst-table">
            <thead>
              <tr>
                <th>Logo</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Detalles</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map(i => (
                <tr key={i.idInstitucion}>
                  <td>
                    {i.logoBase64
                      ? <img src={i.logoBase64} alt={i.nombre} className="inst-logo-thumb" />
                      : <div className="inst-logo-placeholder">{i.nombre?.[0]?.toUpperCase()}</div>
                    }
                  </td>
                  <td><strong>{i.nombre}</strong></td>
                  <td>{i.email || '—'}</td>
                  <td>{i.telefono || '—'}</td>
                  <td><button className="btn-detalle" onClick={() => setDetalle(i)}>Ver</button></td>
                  <td>
                    <div className="acciones">
                      <button className="btn-editar"   onClick={() => handleEditar(i)}>Editar</button>
                      <button className="btn-eliminar" onClick={() => setConfirmarEliminar(i.idInstitucion)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {detalle && (
          <div className="modal-overlay" onClick={() => setDetalle(null)}>
            <div className="spotlight-box" onClick={e => e.stopPropagation()}>
              <button className="spotlight-close" onClick={() => setDetalle(null)}>✕</button>
              <div className="inst-spotlight-header">
                {detalle.logoBase64
                  ? <img src={detalle.logoBase64} alt={detalle.nombre} className="inst-spotlight-logo" />
                  : <div className="inst-logo-placeholder inst-placeholder-lg">{detalle.nombre?.[0]?.toUpperCase()}</div>
                }
                <h2 className="spotlight-titulo">{detalle.nombre}</h2>
              </div>
              <div className="spotlight-stats">
                <div className="spotlight-stat">
                  <span className="stat-label">Email</span>
                  <span className="stat-valor stat-sm">{detalle.email || '—'}</span>
                </div>
                <div className="spotlight-stat">
                  <span className="stat-label">Teléfono</span>
                  <span className="stat-valor stat-sm">{detalle.telefono || '—'}</span>
                </div>
                <div className="spotlight-stat">
                  <span className="stat-label">Estado</span>
                  <span className={`stat-valor estado-${detalle.activo ? 'activo' : 'inactivo'}`}>
                    {detalle.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
              {detalle.direccion && (
                <div className="inst-direccion">
                  <span className="stat-label">Dirección</span>
                  <p>{detalle.direccion}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {confirmarEliminar && (
          <div className="modal-overlay">
            <div className="modal-box">
              <p>¿Eliminar esta institución?</p>
              <button onClick={() => handleEliminar(confirmarEliminar)}>Sí, eliminar</button>
              <button onClick={() => setConfirmarEliminar(null)}>Cancelar</button>
            </div>
          </div>
        )}

      </div>
    </InternalLayout>
  )
}
