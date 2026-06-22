import { useState, useEffect } from 'react'
import InternalLayout from '../layouts/InternalLayout'
import '../styles/disciplinas.css'

const API = 'http://localhost:8080/api/deportes'

const formVacio = {
  nombre: '',
  descripcion: '',
  tipo: 'GRUPAL',
  maxJugadores: '',
  minJugadores: ''
} 

function DisciplinasPage() {
  const [disciplinas, setDisciplinas] = useState([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [idEditando, setIdEditando] = useState(null)

  const [busqueda, setBusqueda] = useState('')
  const [confirmarEliminar, setConfirmarEliminar] = useState(null)

  const [form, setForm] = useState(formVacio)

  // ───────── CARGAR ─────────
  const cargar = async () => {
    try {
      const res = await fetch(API)
      const data = await res.json()
      setDisciplinas(data)
    } catch (e) {
      console.error('Error cargando deportes', e)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  // ───────── FORM ─────────
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  // ───────── NUEVO ─────────
  const abrirNuevo = () => {
    setForm(formVacio)
    setModoEdicion(false)
    setIdEditando(null)
    setMostrarForm(true)
  }

  // ───────── EDITAR ─────────
  const handleEditar = (d) => {
    setForm({
      nombre: d.nombre || '',
      descripcion: d.descripcion || '',
      tipo: d.tipo || 'GRUPAL',
      maxJugadores: d.maxJugadores ?? d.max_jugadores ?? '',
      minJugadores: d.minJugadores ?? d.min_jugadores ?? ''
    })

    setIdEditando(d.idDeporte)
    setModoEdicion(true)
    setMostrarForm(true)
  }

  // ───────── GUARDAR (CREATE / UPDATE) ─────────
  const handleGuardar = async () => {
    const payload = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      tipo: form.tipo,
      maxJugadores: form.maxJugadores ? Number(form.maxJugadores) : null,
      minJugadores: form.minJugadores ? Number(form.minJugadores) : null
    }

    try {
      let url = API
      let method = 'POST'

      if (modoEdicion && idEditando) {
        url = `${API}/${idEditando}`
        method = 'PUT'
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg)
      }

      setForm(formVacio)
      setMostrarForm(false)
      setModoEdicion(false)
      setIdEditando(null)

      await cargar()

    } catch (e) {
      console.error('Error guardando deporte:', e.message)
    }
  }

  // ───────── ELIMINAR ─────────
  const handleEliminar = async (id) => {
    try {
      const res = await fetch(`${API}/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Error eliminando')

      setConfirmarEliminar(null)
      await cargar()

    } catch (e) {
      console.error('Error eliminando:', e.message)
    }
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

          <button className="btn-nueva" onClick={abrirNuevo}>
            + Nuevo deporte
          </button>
        </div>

        {/* FORM */}
        {mostrarForm && (
          <div className="disc-form-card">

            <div className="disc-form-body">

              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Nombre"
              />

              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                placeholder="Descripción"
              />

              <select name="tipo" value={form.tipo} onChange={handleChange}>
                <option value="INDIVIDUAL">Individual</option>
                <option value="GRUPAL">Grupal</option>
              </select>

              <input
                name="minJugadores"
                value={form.minJugadores}
                onChange={handleChange}
                placeholder="Min jugadores"
              />

              <input
                name="maxJugadores"
                value={form.maxJugadores}
                onChange={handleChange}
                placeholder="Max jugadores"
              />

              <div className="disc-form-footer">
                <button onClick={() => setMostrarForm(false)} class="btn-cancelar">
                  Cancelar
                </button>

                <button onClick={handleGuardar} class="btn-guardar">
                  {modoEdicion ? 'Actualizar' : 'Guardar'}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* TABLE */}
        <div className="disc-table-wrap">
          <table className="disc-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filtrados.map(d => (
                <tr key={d.idDeporte}>
                  <td>{d.nombre}</td>
                  <td>{d.tipo}</td>
                  <td>
                    <button onClick={() => handleEditar(d)} class="btn-editar">
                      Editar
                    </button>

                    <button onClick={() => setConfirmarEliminar(d.idDeporte)} class="btn-eliminar">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MODAL DELETE */}
        {confirmarEliminar && (
          <div className="modal-overlay">
            <div className="modal-box">
              <p>¿Eliminar este deporte?</p>

              <button onClick={() => handleEliminar(confirmarEliminar)}>
                Sí
              </button>

              <button onClick={() => setConfirmarEliminar(null)}>
                No
              </button>
            </div>
          </div>
        )}

      </div>
    </InternalLayout>
  )
}

export default DisciplinasPage