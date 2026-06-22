import { useState, useEffect, useCallback } from 'react'
import InternalLayout from '../layouts/InternalLayout'
import '../styles/usuarios.css'

const API = 'http://localhost:8080/api'

const ROLES = [
  { id: 1, nombre: 'ADMIN_SISTEMA', label: 'Administrador del sistema' },
  { id: 2, nombre: 'ADMIN_INSTITUCION', label: 'Admin. institución' },
  { id: 3, nombre: 'ARBITRO', label: 'Árbitro' },
  { id: 4, nombre: 'CAPITAN', label: 'Capitán' },
  { id: 5, nombre: 'PARTICIPANTE', label: 'Participante' },
]

const ROL_BADGE = {
  ADMIN_SISTEMA: 'badge-admin',
  ADMIN_INSTITUCION: 'badge-admin-inst',
  ARBITRO: 'badge-arbitro',
  CAPITAN: 'badge-capitan',
  PARTICIPANTE: 'badge-participante',
}

const EMPTY_FORM = {
  nombres: '',
  apellidos: '',
  email: '',
  password: '',
  idRol: '',
  idInstitucion: '',
  activo: true,
}

export default function Usuarios() {

  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [editId, setEditId] = useState(null)

  const [form, setForm] = useState(EMPTY_FORM)

  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  const [showPw, setShowPw] = useState(false)

  // Confirmar eliminar
  const [confirmarId, setConfirmarId] = useState(null)

  // Toast
  const [toast, setToast] = useState(null)

  // Búsqueda
  const [busqueda, setBusqueda] = useState('')

  // ===============================
  // TOAST
  // ===============================

  const showToast = (msg, tipo = 'ok') => {

    setToast({ msg, tipo })

    setTimeout(() => {
      setToast(null)
    }, 3500)
  }

  // ===============================
  // CARGAR USUARIOS
  // ===============================

  const cargarUsuarios = useCallback(async () => {

    setLoading(true)
    setError('')

    try {

      const res = await fetch(`${API}/usuarios`)

      if (!res.ok) {
        throw new Error('Error al cargar usuarios')
      }

      const data = await res.json()

      setUsuarios(data)

    } catch (e) {

      setError(e.message)

    } finally {

      setLoading(false)
    }

  }, [])

  useEffect(() => {

    cargarUsuarios()

  }, [cargarUsuarios])

  // ===============================
  // FILTRADO
  // ===============================

  const usuariosFiltrados = usuarios.filter(u => {

    const q = busqueda.toLowerCase()

    return (
      u.nombres?.toLowerCase().includes(q) ||
      u.apellidos?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.rol?.nombre?.toLowerCase().includes(q)
    )
  })

  // ===============================
  // ABRIR CREAR
  // ===============================

  const abrirCrear = () => {

    setForm(EMPTY_FORM)

    setFormError('')

    setShowPw(false)

    setModoEdicion(false)

    setEditId(null)

    setModalOpen(true)
  }

  // ===============================
  // ABRIR EDITAR
  // ===============================

  const abrirEditar = (u) => {

    setForm({
      nombres: u.nombres,
      apellidos: u.apellidos,
      email: u.email,
      password: '',
      idRol: u.rol?.idRol ?? '',
      idInstitucion: u.institucion?.idInstitucion ?? '',
      activo: u.activo,
    })

    setFormError('')
    setShowPw(false)

    setModoEdicion(true)

    setEditId(u.idUsuario)

    setModalOpen(true)
  }

  // ===============================
  // CERRAR MODAL
  // ===============================

  const cerrarModal = () => {

    setModalOpen(false)

    setFormError('')
  }

  // ===============================
  // CAMBIAR INPUTS
  // ===============================

  const handleFormChange = (e) => {

    const { name, value, type, checked } = e.target

    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox'
        ? checked
        : value,
    }))

    setFormError('')
  }

  // ===============================
  // GUARDAR
  // ===============================

  const handleGuardar = async (e) => {

    e.preventDefault()

    if (
      !form.nombres ||
      !form.apellidos ||
      !form.email ||
      !form.idRol
    ) {
      setFormError('Nombres, apellidos, email y rol son obligatorios.')
      return
    }

    if (!modoEdicion && !form.password) {
      setFormError('La contraseña es obligatoria.')
      return
    }

    setFormLoading(true)

    setFormError('')

    const body = {
      nombres: form.nombres,
      apellidos: form.apellidos,
      email: form.email,
      idRol: Number(form.idRol),
      idInstitucion: form.idInstitucion
        ? Number(form.idInstitucion)
        : null,
    }

    if (!modoEdicion || form.password) {
      body.password = form.password
    }

    try {

      const url = modoEdicion
        ? `${API}/usuarios/${editId}`
        : `${API}/usuarios`

      const method = modoEdicion
        ? 'PUT'
        : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {

        setFormError(data.error || 'Error al guardar')

        return
      }

      cerrarModal()

      await cargarUsuarios()

      showToast(
        modoEdicion
          ? 'Usuario actualizado correctamente'
          : 'Usuario creado correctamente'
      )

    } catch {

      setFormError('No se pudo conectar con el servidor.')

    } finally {

      setFormLoading(false)
    }
  }

  // ===============================
  // ELIMINAR
  // ===============================

  const handleEliminar = async (id) => {

    try {

      const res = await fetch(`${API}/usuarios/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error()
      }

      setConfirmarId(null)

      await cargarUsuarios()

      showToast('Usuario eliminado correctamente')

    } catch {

      showToast('Error al eliminar usuario', 'error')
    }
  }

  return (

    <InternalLayout
      titulo="Gestión de usuarios"
      subtitulo="Administra usuarios y accesos del sistema"
    >

      {/* TOAST */}
      {toast && (
        <div className={`u-toast u-toast-${toast.tipo}`}>
          {toast.msg}
        </div>
      )}

      {/* CABECERA */}
      <div className="u-header">

        <div className="u-search-wrap">

          <input
            className="u-search"
            type="text"
            placeholder="Buscar por nombre, email o rol…"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />

        </div>

        <button
          className="u-btn-primary"
          onClick={abrirCrear}
        >
          + Nuevo usuario
        </button>

      </div>

      {/* TABLA */}
      {loading && (
        <div className="u-loading">
          Cargando usuarios…
        </div>
      )}

      {error && (
        <div className="u-error">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>

          <div className="u-count">
            {usuariosFiltrados.length} usuario
            {usuariosFiltrados.length !== 1 ? 's' : ''}
            {' '}encontrado
            {usuariosFiltrados.length !== 1 ? 's' : ''}
          </div>

          <div className="u-table-wrap">

            <table className="u-table">

              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Institución</th>
                  <th>Estado</th>
                  <th>Creado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>

                {usuariosFiltrados.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="u-empty"
                    >
                      No hay usuarios.
                    </td>
                  </tr>
                )}

                {usuariosFiltrados.map(u => (

                  <tr key={u.idUsuario}>

                    <td>

                      <div className="u-name-cell">

                        <div className="u-avatar">
                          {u.nombres?.[0]}
                          {u.apellidos?.[0]}
                        </div>

                        <div>

                          <div className="u-fullname">
                            {u.nombres} {u.apellidos}
                          </div>

                          <div className="u-id">
                            ID #{u.idUsuario}
                          </div>

                        </div>

                      </div>

                    </td>

                    <td className="u-email">
                      {u.email}
                    </td>

                    <td>

                      <span
                        className={`u-badge ${ROL_BADGE[u.rol?.nombre] ?? ''}`}
                      >
                        {u.rol?.nombre}
                      </span>

                    </td>

                    <td className="u-inst">

                      {u.institucion?.nombre ?? (
                        <span className="u-na">—</span>
                      )}

                    </td>

                    <td>

                      <span
                        className={`u-estado ${u.activo ? 'u-activo' : 'u-inactivo'}`}
                      >
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>

                    </td>

                    <td className="u-fecha">

                      {u.createdAt
                        ? new Date(u.createdAt)
                            .toLocaleDateString('es-PE')
                        : '—'}

                    </td>

                    <td>

                      <div className="u-actions">

                        <button
                          className="u-btn-edit"
                          onClick={() => abrirEditar(u)}
                        >
                          Editar
                        </button>

                        <button
                          className="u-btn-del"
                          onClick={() => setConfirmarId(u.idUsuario)}
                        >
                          Eliminar
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </>
      )}

      {/* MODAL */}
      {modalOpen && (

        <div
          className="u-overlay"
          onClick={cerrarModal}
        >

          <div
            className="u-modal"
            onClick={e => e.stopPropagation()}
          >

            <div className="u-modal-header">

              <h2>
                {modoEdicion
                  ? 'Editar usuario'
                  : 'Nuevo usuario'}
              </h2>

              <button
                className="u-modal-close"
                onClick={cerrarModal}
              >
                ✕
              </button>

            </div>

            <form
              className="u-modal-body"
              onSubmit={handleGuardar}
            >

              <div className="u-grid-2">

                <div className="u-field">

                  <label>Nombres *</label>

                  <input
                    name="nombres"
                    value={form.nombres}
                    onChange={handleFormChange}
                  />

                </div>

                <div className="u-field">

                  <label>Apellidos *</label>

                  <input
                    name="apellidos"
                    value={form.apellidos}
                    onChange={handleFormChange}
                  />

                </div>

              </div>

              <div className="u-field">

                <label>Email *</label>

                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleFormChange}
                />

              </div>

              <div className="u-field">

                <label>
                  {modoEdicion
                    ? 'Nueva contraseña'
                    : 'Contraseña *'}
                </label>

                <div className="u-pw-wrap">

                  <input
                    name="password"
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleFormChange}
                  />

                  <button
                    type="button"
                    className="u-pw-toggle"
                    onClick={() => setShowPw(!showPw)}
                  >
                    {showPw ? 'Ocultar' : 'Ver'}
                  </button>

                </div>

              </div>

              <div className="u-grid-2">

                <div className="u-field">

                  <label>Rol *</label>

                  <select
                    name="idRol"
                    value={form.idRol}
                    onChange={handleFormChange}
                  >

                    <option value="">
                      Seleccionar rol
                    </option>

                    {ROLES.map(r => (

                      <option
                        key={r.id}
                        value={r.id}
                      >
                        {r.label}
                      </option>

                    ))}

                  </select>

                </div>

                <div className="u-field">

                  <label>ID Institución</label>

                  <input
                    name="idInstitucion"
                    type="number"
                    value={form.idInstitucion}
                    onChange={handleFormChange}
                    min={1}
                  />

                </div>

              </div>

              {formError && (
                <div className="u-form-error">
                  {formError}
                </div>
              )}

              <div className="u-modal-footer">

                <button
                  type="button"
                  className="u-btn-cancel"
                  onClick={cerrarModal}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="u-btn-save"
                  disabled={formLoading}
                >

                  {formLoading
                    ? 'Guardando...'
                    : modoEdicion
                      ? 'Guardar cambios'
                      : 'Crear usuario'}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* MODAL ELIMINAR */}
      {confirmarId && (

        <div
          className="u-overlay"
          onClick={() => setConfirmarId(null)}
        >

          <div
            className="u-confirm"
            onClick={e => e.stopPropagation()}
          >

            <h3>¿Eliminar usuario?</h3>

            <p>
              Esta acción no se puede deshacer.
            </p>

            <div className="u-confirm-actions">

              <button
                className="u-btn-cancel"
                onClick={() => setConfirmarId(null)}
              >
                Cancelar
              </button>

              <button
                className="u-btn-danger"
                onClick={() => handleEliminar(confirmarId)}
              >
                Sí, eliminar
              </button>

            </div>

          </div>

        </div>
      )}

    </InternalLayout>
  )
}