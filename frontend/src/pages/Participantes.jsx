import { useState, useEffect } from 'react'
import InternalLayout from '../layouts/InternalLayout'
import '../styles/participantes.css'

const API        = 'http://localhost:8080/api/participantes'
const API_EQ     = 'http://localhost:8080/api/equipos'
const API_INST   = 'http://localhost:8080/api/instituciones'

const formVacio = {
  nombres:        '',
  apellidos:      '',
  dni:            '',
  email:          '',
  telefono:       '',
  idInstitucion:  '',
  idEquipo:       '',
  esCapitan:      false
}

export default function ParticipantesPage() {
  const [participantes, setParticipantes]         = useState([])
  const [equipos, setEquipos]                       = useState([])
  const [instituciones, setInstituciones]           = useState([])
  const [mostrarForm, setMostrarForm]               = useState(false)
  const [editando, setEditando]                     = useState(null)
  const [busqueda, setBusqueda]                     = useState('')
  const [filtroEquipo, setFiltroEquipo]             = useState('')
  const [confirmarEliminar, setConfirmarEliminar]   = useState(null)
  const [error, setError]                           = useState('')
  const [cargando, setCargando]                     = useState(false)
  const [form, setForm]                             = useState(formVacio)
  const [errores, setErrores]                       = useState({})

  // ── CARGAR ──────────────────────────────────────
  const cargar = async () => {
    try {
      const [resP, resE, resI] = await Promise.all([
        fetch(API), fetch(API_EQ), fetch(API_INST)
      ])
      if (resP.ok) setParticipantes(await resP.json())
      if (resE.ok) setEquipos(await resE.json())
      if (resI.ok) setInstituciones(await resI.json())
    } catch (e) { console.error(e) }
  }

  useEffect(() => { cargar() }, [])

  // Cupo del equipo seleccionado en el formulario (según max_jugadores del deporte)
  const equipoSel = equipos.find(eq => String(eq.idEquipo) === String(form.idEquipo))
  const cupoMax = equipoSel?.maxJugadores ?? null
  const cupoUsado = form.idEquipo
    ? participantes.filter(p =>
        p.equipos?.some(e => String(e.idEquipo) === String(form.idEquipo)) &&
        p.idParticipante !== editando
      ).length
    : 0

  // ── VALIDACIÓN ──────────────────────────────────
  const validar = () => {
    const e = {}
    if (!form.nombres.trim())   e.nombres = 'Los nombres son requeridos.'
    if (!form.apellidos.trim()) e.apellidos = 'Los apellidos son requeridos.'
    if (!form.dni.trim())       e.dni = 'El DNI es requerido.'
    if (!form.idInstitucion)    e.idInstitucion = 'Selecciona una institución.'
    if (form.idEquipo && cupoMax != null && cupoUsado >= cupoMax) {
      e.idEquipo = `El equipo ya alcanzó el cupo máximo (${cupoMax}).`
    }
    setErrores(e)
    return Object.keys(e).length === 0
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    setErrores(prev => ({ ...prev, [name]: '' }))
  }

  const abrirNuevo = () => {
    setForm(formVacio)
    setError('')
    setErrores({})
    setEditando(null)
    setMostrarForm(true)
  }

  const handleEditar = (p) => {
    const primeraInscripcion = p.equipos?.[0]
    setForm({
      nombres:       p.nombres || '',
      apellidos:     p.apellidos || '',
      dni:           p.dni || '',
      email:         p.email || '',
      telefono:      p.telefono || '',
      idInstitucion: p.idInstitucion || '',
      idEquipo:      primeraInscripcion?.idEquipo || '',
      esCapitan:     primeraInscripcion?.esCapitan || false
    })
    setError('')
    setErrores({})
    setEditando(p.idParticipante)
    setMostrarForm(true)
  }

  // ── GUARDAR ─────────────────────────────────────
  const handleGuardar = async () => {
    setError('')
    if (!validar()) return

    const payload = {
      nombres:       form.nombres.trim(),
      apellidos:     form.apellidos.trim(),
      dni:           form.dni.trim(),
      email:         form.email || null,
      telefono:      form.telefono || null,
      idInstitucion: Number(form.idInstitucion),
      idEquipo:      form.idEquipo ? Number(form.idEquipo) : null,
      esCapitan:     form.esCapitan
    }

    try {
      setCargando(true)
      const url    = editando !== null ? `${API}/${editando}` : API
      const method = editando !== null ? 'PUT' : 'POST'
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const texto = await res.text()
        throw new Error(texto || 'Error al guardar')
      }
      setForm(formVacio)
      setMostrarForm(false)
      setEditando(null)
      setErrores({})
      await cargar()
    } catch (e) {
      setError(e.message || 'Error al guardar')
    } finally {
      setCargando(false)
    }
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

  // ── HELPERS DE VISTA ────────────────────────────
  const getEquipoInfo = (p) => p.equipos?.[0] || null

  const filtrados = participantes.filter(p => {
    const matchBusq = `${p.nombres} ${p.apellidos} ${p.dni}`.toLowerCase().includes(busqueda.toLowerCase())
    const matchEq = filtroEquipo
      ? p.equipos?.some(e => String(e.idEquipo) === filtroEquipo)
      : true
    return matchBusq && matchEq
  })

  return (
    <InternalLayout titulo="Inscripción de participantes" subtitulo="Registra los jugadores de cada equipo verificando cupos y datos obligatorios">
      <div className="participantes-page">
        <div className="part-topbar">
          <div className="part-filtros">
            <input className="part-search" type="text" placeholder="Buscar por nombre o DNI..."
              value={busqueda} onChange={e => setBusqueda(e.target.value)} />
            <select className="part-select-filtro" value={filtroEquipo} onChange={e => setFiltroEquipo(e.target.value)}>
              <option value="">Todos los equipos</option>
              {equipos.map(eq => <option key={eq.idEquipo} value={eq.idEquipo}>{eq.nombre}</option>)}
            </select>
          </div>
          <button className="btn-nuevo-part" onClick={abrirNuevo}>+ Registrar participante</button>
        </div>

        {/* CUPOS POR EQUIPO */}
        <div className="cupos-resumen">
          {equipos.map(eq => {
            const usado = participantes.filter(p =>
              p.equipos?.some(e => String(e.idEquipo) === String(eq.idEquipo))
            ).length
            const max = eq.maxJugadores ?? null
            const pct = max ? Math.round((usado / max) * 100) : 0
            return (
              <div className="cupo-item" key={eq.idEquipo}>
                <div className="cupo-info">
                  <span className="cupo-nombre">{eq.nombre}</span>
                  <span className="cupo-disc">{eq.nombreDeporte}{eq.nombreCategoria ? ` — ${eq.nombreCategoria}` : ''}</span>
                </div>
                <div className="cupo-barra-wrap">
                  <div className="cupo-barra">
                    <div className="cupo-barra-fill" style={{
                      width: `${max ? pct : 100}%`,
                      background: pct >= 100 ? '#e53e3e' : pct >= 80 ? '#d97706' : '#003087'
                    }}></div>
                  </div>
                  <span className="cupo-texto">{usado}{max ? `/${max}` : ''}</span>
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
              {equipoSel && cupoMax != null && (
                <span className={`cupo-badge ${cupoUsado >= cupoMax ? 'cupo-lleno' : 'cupo-ok'}`}>
                  Cupo: {cupoUsado}/{cupoMax}
                </span>
              )}
            </div>
            <div className="part-form-body">
              <div className="form-row-2">
                <div className="form-group">
                  <label>Nombres</label>
                  <input type="text" name="nombres" placeholder="Nombres del participante"
                    value={form.nombres} onChange={handleChange} className={errores.nombres ? 'input-error' : ''} />
                  {errores.nombres && <span className="error-msg">{errores.nombres}</span>}
                </div>
                <div className="form-group">
                  <label>Apellidos</label>
                  <input type="text" name="apellidos" placeholder="Apellidos del participante"
                    value={form.apellidos} onChange={handleChange} className={errores.apellidos ? 'input-error' : ''} />
                  {errores.apellidos && <span className="error-msg">{errores.apellidos}</span>}
                </div>
              </div>
              <div className="form-row-3">
                <div className="form-group">
                  <label>DNI / Documento</label>
                  <input type="text" name="dni" placeholder="Número de documento"
                    value={form.dni} onChange={handleChange} className={errores.dni ? 'input-error' : ''} />
                  {errores.dni && <span className="error-msg">{errores.dni}</span>}
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" name="email" placeholder="correo@ejemplo.com"
                    value={form.email} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input type="text" name="telefono" placeholder="Número de contacto"
                    value={form.telefono} onChange={handleChange} />
                </div>
              </div>
              <div className="form-row-3">
                <div className="form-group">
                  <label>Institución</label>
                  <select name="idInstitucion" value={form.idInstitucion} onChange={handleChange}
                    className={errores.idInstitucion ? 'input-error' : ''}>
                    <option value="">Selecciona una institución</option>
                    {instituciones.map(i => <option key={i.idInstitucion} value={i.idInstitucion}>{i.nombre}</option>)}
                  </select>
                  {errores.idInstitucion && <span className="error-msg">{errores.idInstitucion}</span>}
                </div>
                <div className="form-group">
                  <label>Equipo</label>
                  <select name="idEquipo" value={form.idEquipo} onChange={handleChange}
                    className={errores.idEquipo ? 'input-error' : ''}>
                    <option value="">Sin asignar a un equipo</option>
                    {equipos.map(eq => (
                      <option key={eq.idEquipo} value={eq.idEquipo}>
                        {eq.nombre} — {eq.nombreDeporte}{eq.nombreCategoria ? ` (${eq.nombreCategoria})` : ''}
                      </option>
                    ))}
                  </select>
                  {errores.idEquipo && <span className="error-msg">{errores.idEquipo}</span>}
                </div>
                <div className="form-group">
                  <label>¿Es capitán?</label>
                  <select name="esCapitan" value={form.esCapitan ? 'si' : 'no'}
                    onChange={e => setForm(prev => ({ ...prev, esCapitan: e.target.value === 'si' }))}
                    disabled={!form.idEquipo}>
                    <option value="no">No</option>
                    <option value="si">Sí</option>
                  </select>
                </div>
              </div>
            </div>

            {error && <p className="eq-error">{error}</p>}

            <div className="part-form-footer">
              <button className="btn-cancelar-part" onClick={() => { setMostrarForm(false); setForm(formVacio); setEditando(null); setErrores({}) }}>Cancelar</button>
              <button className="btn-guardar-part" onClick={handleGuardar} disabled={cargando}>
                {cargando ? 'Guardando...' : (editando !== null ? 'Guardar cambios' : 'Registrar participante')}
              </button>
            </div>
          </div>
        )}

        <div className="part-table-wrap">
          <table className="part-table">
            <thead>
              <tr><th>#</th><th>Nombres y apellidos</th><th>DNI</th><th>Institución</th><th>Equipo</th><th>Disciplina</th><th>Capitán</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr><td colSpan={8} className="td-vacio">{busqueda || filtroEquipo ? 'No se encontraron resultados.' : 'No hay participantes registrados aún.'}</td></tr>
              ) : filtrados.map((p, i) => {
                const eqInfo = getEquipoInfo(p)
                return (
                  <tr key={p.idParticipante}>
                    <td className="td-num">{i + 1}</td>
                    <td className="td-main">{p.nombres} {p.apellidos}</td>
                    <td>{p.dni}</td>
                    <td>{p.nombreInstitucion || '—'}</td>
                    <td>{eqInfo?.nombreEquipo || '—'}</td>
                    <td>{eqInfo ? <span className="tag-disc">{eqInfo.nombreDeporte}{eqInfo.nombreCategoria ? ` — ${eqInfo.nombreCategoria}` : ''}</span> : '—'}</td>
                    <td><span className={`estado-badge ${eqInfo?.esCapitan ? 'estado-activo' : 'estado-inactivo'}`}>{eqInfo?.esCapitan ? 'Sí' : 'No'}</span></td>
                    <td>
                      <div className="acciones">
                        <button className="btn-editar-part" onClick={() => handleEditar(p)}>Editar</button>
                        <button className="btn-eliminar-part" onClick={() => setConfirmarEliminar(p.idParticipante)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
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