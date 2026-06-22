import { useState, useEffect, useCallback } from 'react'
import InternalLayout from '../layouts/InternalLayout'
import '../styles/eventos.css'

const API = 'http://localhost:8080/api/eventos'

const EMPTY_FORM = {
  nombre: '',
  descripcion: '',
  fechaInicio: '',
  fechaFin: '',
  fechaLimiteInsc: '',
  premio: '',
  minEquipos: '',
  estado: 'BORRADOR',
  idInstitucion: '',
  idUsuarioCreador: ''
}

export default function EventosPage() {

  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [editId, setEditId] = useState(null)

  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  const [confirmarId, setConfirmarId] = useState(null)

  const [busqueda, setBusqueda] = useState('')

  const showError = (msg) => setError(msg)

  // =========================
  // CARGAR EVENTOS
  // =========================
  const cargarEventos = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch(API)

      if (!res.ok) throw new Error('Error al cargar eventos')

      const data = await res.json()
      setEventos(data)

    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargarEventos()
  }, [cargarEventos])

  // =========================
  // FILTRO
  // =========================
  const eventosFiltrados = eventos.filter(e =>
    e.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  )

  // =========================
  // FORM
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target

    setForm(prev => ({
      ...prev,
      [name]: value
    }))

    setFormError('')
  }

  const abrirCrear = () => {
    setForm(EMPTY_FORM)
    setModoEdicion(false)
    setEditId(null)
    setModalOpen(true)
  }

  const abrirEditar = (ev) => {
    setForm({
      nombre: ev.nombre || '',
      descripcion: ev.descripcion || '',
      fechaInicio: ev.fechaInicio || '',
      fechaFin: ev.fechaFin || '',
      fechaLimiteInsc: ev.fechaLimiteInsc || '',
      premio: ev.premio || '',
      minEquipos: ev.minEquipos || '',
      estado: ev.estado || 'BORRADOR',
      idInstitucion: ev.idInstitucion || '',
      idUsuarioCreador: ev.idUsuarioCreador || ''
    })

    setModoEdicion(true)
    setEditId(ev.idEvento)
    setModalOpen(true)
  }

  const cerrarModal = () => {
    setModalOpen(false)
    setFormError('')
  }

  // =========================
  // GUARDAR (POST / PUT)
  // =========================
  const handleGuardar = async (e) => {
    e.preventDefault()

    if (!form.nombre || !form.fechaInicio || !form.fechaFin) {
      setFormError('Nombre y fechas son obligatorios')
      return
    }

    setFormLoading(true)
    setFormError('')

    const body = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      fechaInicio: form.fechaInicio,
      fechaFin: form.fechaFin,
      fechaLimiteInsc: form.fechaLimiteInsc,
      premio: form.premio,
      minEquipos: Number(form.minEquipos),
      estado: form.estado,
      idInstitucion: Number(form.idInstitucion),
      idUsuarioCreador: Number(form.idUsuarioCreador)
    }

    try {

      const url = modoEdicion
        ? `${API}/${editId}`
        : API

      const method = modoEdicion ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()

      if (!res.ok) {
        setFormError(data?.message || 'Error al guardar')
        return
      }

      cerrarModal()
      await cargarEventos()

    } catch {
      setFormError('Error de conexión con el servidor')
    } finally {
      setFormLoading(false)
    }
  }

  // =========================
  // ELIMINAR
  // =========================
  const handleEliminar = async (id) => {

    try {
      const res = await fetch(`${API}/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error()

      setConfirmarId(null)
      await cargarEventos()

    } catch {
      alert('Error al eliminar evento')
    }
  }

  return (
    <InternalLayout
      titulo="Gestión de eventos"
      subtitulo="Administración de eventos deportivos"
    >

      {/* HEADER */}
      <div className="ev-topbar">

        <input
          className="ev-search"
          placeholder="Buscar evento..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <button
          className="btn-nuevo-ev"
          onClick={abrirCrear}
        >
          + Nuevo evento
        </button>

      </div>

      {/* ERROR */}
      {error && <div className="u-error">{error}</div>}

      {/* LISTA */}
      {loading ? (
        <p>Cargando eventos...</p>
      ) : (
        <div className="ev-grid">

          {eventosFiltrados.map(ev => (
            <div key={ev.idEvento} className="ev-card">

              <h3>{ev.nombre}</h3>
              <p>{ev.descripcion}</p>

              <small>
                {ev.fechaInicio} - {ev.fechaFin}
              </small>

              <div className="ev-acciones">

                <button onClick={() => abrirEditar(ev)} class="btn-editar-ev">
                  Editar
                </button>

                <button onClick={() => setConfirmarId(ev.idEvento)} class="btn-eliminar-ev">
                  Eliminar
                </button>

              </div>

            </div>
          ))}

        </div>
      )}

      {/* MODAL FORM */}
      {modalOpen && (
  <div className="modal-overlay">

    <div className="modal-box modal-form-ev">

      <div className="ev-form-header">
        <h2 className="ev-form-titulo">
          {modoEdicion ? 'Editar evento' : 'Nuevo evento deportivo'}
        </h2>
        <p className="ev-form-subtitulo">
          Completa la información del evento correctamente
        </p>
      </div>

      <form className="ev-form-body" onSubmit={handleGuardar}>

        {/* Nombre */}
        <div className="form-group">
          <label>Nombre del evento</label>
          <input
            name="nombre"
            placeholder="Ej: Olimpiadas Interinstitucionales"
            value={form.nombre}
            onChange={handleChange}
          />
        </div>

        {/* Descripción */}
        <div className="form-group">
          <label>Descripción</label>
          <textarea
            name="descripcion"
            rows={3}
            placeholder="Descripción del evento..."
            value={form.descripcion}
            onChange={handleChange}
          />
        </div>

        {/* Fechas */}
        <div className="form-row-2">
          <div className="form-group">
            <label>Fecha inicio</label>
            <input
              type="date"
              name="fechaInicio"
              value={form.fechaInicio}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Fecha fin</label>
            <input
              type="date"
              name="fechaFin"
              value={form.fechaFin}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Extra info */}
        <div className="form-row-2">

          <div className="form-group">
            <label>Fecha límite inscripción</label>
            <input
              type="date"
              name="fechaLimiteInsc"
              value={form.fechaLimiteInsc}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Premio</label>
            <input
              name="premio"
              placeholder="Ej: Trofeo + medallas"
              value={form.premio}
              onChange={handleChange}
            />
          </div>

        </div>

        {/* Equipos + estado */}
        <div className="form-row-2">

          <div className="form-group">
            <label>Mínimo equipos</label>
            <input
              type="number"
              name="minEquipos"
              placeholder="Ej: 4"
              value={form.minEquipos}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Estado</label>
            <select
              name="estado"
              value={form.estado}
              onChange={handleChange}
            >
              <option value="BORRADOR">Borrador</option>
              <option value="ABIERTO">Abierto</option>
              <option value="EN_CURSO">En curso</option>
              <option value="FINALIZADO">Finalizado</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>

        </div>

        {/* IDs (ocultos visualmente pero necesarios) */}
        <div className="form-row-2">

          <div className="form-group">
            <label>ID Institución</label>
            <input
              type="number"
              name="idInstitucion"
              value={form.idInstitucion}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>ID Usuario creador</label>
            <input
              type="number"
              name="idUsuarioCreador"
              value={form.idUsuarioCreador}
              onChange={handleChange}
            />
          </div>

        </div>

        {/* ERROR */}
        {formError && (
          <div className="error-msg">
            {formError}
          </div>
        )}

        {/* BOTONES */}
        <div className="ev-form-footer">

          <button
            type="button"
            className="btn-cancelar-ev"
            onClick={cerrarModal}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="btn-guardar-ev"
            disabled={formLoading}
          >
            {formLoading ? 'Guardando...' : 'Guardar evento'}
          </button>

        </div>

      </form>

    </div>

  </div>
)}

      {/* DELETE MODAL */}
      {confirmarId && (
        <div className="modal-overlay">
          <div className="modal-box">

            <p>¿Eliminar evento?</p>

            <button onClick={() => handleEliminar(confirmarId)}>
              Sí
            </button>

            <button onClick={() => setConfirmarId(null)}>
              No
            </button>

          </div>
        </div>
      )}

    </InternalLayout>
  )
}