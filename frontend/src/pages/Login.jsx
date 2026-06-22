import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Login.css'

function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Por favor completa todos los campos.')
      return
    }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Credenciales incorrectas.')
        return
      }

      // Guardar token y datos del usuario en sessionStorage
      sessionStorage.setItem('token', data.token)
      sessionStorage.setItem('usuario', JSON.stringify({
        idUsuario:  data.idUsuario,
        nombres:    data.nombres,
        apellidos:  data.apellidos,
        email:      data.email,
        rol:        data.rol,
        institucion: data.institucion,
      }))

      navigate('/dashboard')

    } catch {
      setError('No se pudo conectar con el servidor. Verifica que el backend esté activo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">

      {/* PANEL IZQUIERDO */}
      <div className="login-left">
        <div className="left-logo">
          <div className="left-logo-mark"></div>
          <span className="left-logo-text">Olimpiadas Deportivas Institucionales</span>
        </div>
        <div className="left-content">
          <p className="left-eyebrow">Área de gestión interna</p>
          <h1 className="left-title">Panel de<br />administración</h1>
          <p className="left-desc">
            Acceso exclusivo para encargados y personal autorizado
            de las instituciones participantes.
          </p>
          <div className="left-items">
            <div className="left-item">
              <div className="left-item-dot"></div>
              <span>Registro y edición de disciplinas</span>
            </div>
            <div className="left-item">
              <div className="left-item-dot"></div>
              <span>Creación y gestión de eventos</span>
            </div>
            <div className="left-item">
              <div className="left-item-dot"></div>
              <span>Inscripción de equipos y participantes</span>
            </div>
            <div className="left-item">
              <div className="left-item-dot"></div>
              <span>Carga y validación de resultados</span>
            </div>
          </div>
        </div>
      </div>

      {/* PANEL DERECHO */}
      <div className="login-right">
        <button className="btn-back" onClick={() => navigate('/')}>
          Volver al portal
        </button>

        <div className="login-card">
          <div className="login-card-header">
            <h1 className="login-title">Iniciar sesión</h1>
            <p className="login-subtitle">
              Ingresa tus credenciales institucionales para acceder al panel de gestión.
            </p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Correo institucional</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="usuario@institucion.edu"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <div className="input-password-wrap">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="btn-toggle-pw"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? 'Ocultar' : 'Ver'}
                </button>
              </div>
            </div>

            {error && (
              <div className="login-error">{error}</div>
            )}

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? <span className="spinner"></span> : 'Ingresar'}
            </button>
          </form>

          <p className="login-footer-text">
            Sistema de gestión · Edición 2025
          </p>
        </div>
      </div>

    </div>
  )
}

export default LoginPage