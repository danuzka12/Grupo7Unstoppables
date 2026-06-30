import { useEffect, useMemo, useState } from 'react'
import InternalLayout from '../layouts/InternalLayout'
import '../styles/sorteo.css'

const API = 'http://localhost:8080/api'

const codigo = (prefijo, id) => `${prefijo}-${String(id ?? 0).padStart(3, '0')}`

function SorteoPage() {
  const [competencias, setCompetencias] = useState([])
  const [idEventoDeporte, setIdEventoDeporte] = useState('')
  const [numGrupos, setNumGrupos] = useState(2)
  const [equipos, setEquipos] = useState([])
  const [grupos, setGrupos] = useState([])
  const [realizado, setRealizado] = useState(false)
  const [animando, setAnimando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    cargarCompetencias()
  }, [])

  useEffect(() => {
    if (!idEventoDeporte) return
    cargarDatosCompetencia(idEventoDeporte)
  }, [idEventoDeporte])

  const competencia = useMemo(
    () => competencias.find(c => String(c.idEventoDeporte) === String(idEventoDeporte)),
    [competencias, idEventoDeporte],
  )

  const equiposAprobados = equipos.filter(e => e.estadoInscripcion === 'APROBADO')
  const maxGrupos = Math.max(1, Math.floor(equiposAprobados.length / 2))
  const opcionesGrupos = Array.from({ length: maxGrupos }, (_, i) => i + 1)
  const equiposPorGrupo = Number(numGrupos) > 0 ? Math.ceil(equiposAprobados.length / Number(numGrupos)) : 0

  async function cargarCompetencias(idPreferido = idEventoDeporte) {
    try {
      const res = await fetch(`${API}/competencias`)
      const data = await res.json()
      setCompetencias(data)
      if (data.length > 0) {
        setIdEventoDeporte(actual => {
          const candidato = idPreferido || actual
          const existeSeleccion = data.some(c => String(c.idEventoDeporte) === String(candidato))
          return existeSeleccion ? String(candidato) : String(data[0].idEventoDeporte)
        })
      }
    } catch {
      setError('No se pudo cargar las competencias desde el backend.')
    }
  }

  async function cargarDatosCompetencia(id) {
    setError('')
    setMensaje('')
    try {
      const [resEquipos, resGrupos] = await Promise.all([
        fetch(`${API}/sorteos/${id}/equipos`),
        fetch(`${API}/sorteos/${id}/grupos`),
      ])
      const equiposData = await resEquipos.json()
      const gruposData = await resGrupos.json()
      setEquipos(equiposData)
      setGrupos(gruposData)
      setRealizado(gruposData.length > 0)
      const maximo = Math.max(1, Math.floor(equiposData.filter(e => e.estadoInscripcion === 'APROBADO').length / 2))
      setNumGrupos(actual => {
        if (gruposData.length > 0) return Math.min(gruposData.length, maximo)

        const actualNumero = Number(actual)
        if (!actualNumero || actualNumero > maximo) return Math.min(2, maximo)

        return actualNumero
      })
    } catch {
      setError('No se pudo cargar los equipos o grupos.')
    }
  }

  async function handleSortear() {
    if (!idEventoDeporte || equiposAprobados.length < 2) return
    setAnimando(true)
    setError('')
    setMensaje('')

    try {
      const res = await fetch(`${API}/sorteos/${idEventoDeporte}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cantidadGrupos: Number(numGrupos) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'No se pudo realizar el sorteo.')
      setGrupos(data)
      setRealizado(true)
      setMensaje('Sorteo realizado y guardado correctamente en la base de datos.')
      await cargarCompetencias(idEventoDeporte)
    } catch (e) {
      setError(e.message)
    } finally {
      setAnimando(false)
    }
  }

  const handleReset = () => {
    setMensaje('')
    setError('')
    cargarDatosCompetencia(idEventoDeporte)
  }

  return (
    <InternalLayout titulo="Sorteo y asignación de equipos" subtitulo="Distribuye los equipos en grupos de forma aleatoria y equitativa">
      <div className="sorteo-page">

        {mensaje && <div className="sorteo-aviso" style={{ borderColor: '#b7ebc6', color: '#166534' }}>{mensaje}</div>}
        {error && <div className="sorteo-aviso">{error}</div>}

        {competencia && (
          <div className="flujo-card">
            <div className="flujo-item">
              <span className="flujo-label">Evento</span>
              <strong>{codigo('EV', competencia.idEvento)}</strong>
              <small>{competencia.evento}</small>
            </div>
            <div className="flujo-arrow">→</div>
            <div className="flujo-item">
              <span className="flujo-label">Competencia</span>
              <strong>{codigo('COMP', competencia.idEventoDeporte)}</strong>
              <small>{competencia.deporte} / {competencia.categoria}</small>
            </div>
            <div className="flujo-arrow">→</div>
            <div className="flujo-item">
              <span className="flujo-label">Equipos</span>
              <strong>{equiposAprobados.length}</strong>
              <small>{realizado ? `${grupos.length} grupos generados` : `aprox. ${equiposPorGrupo} por grupo`}</small>
            </div>
          </div>
        )}

        <div className="sorteo-config-card">
          <div className="sorteo-config-header">
            <h2 className="sorteo-titulo">Configuración del sorteo</h2>
            <p className="sorteo-subtitulo">Selecciona la competencia y el número de grupos. El resultado se guarda en MySQL.</p>
          </div>
          <div className="sorteo-config-body">
            <div className="form-row-3">
              <div className="form-group">
                <label>Competencia</label>
                <select value={idEventoDeporte} onChange={e => setIdEventoDeporte(e.target.value)}>
                  <option value="">Selecciona una competencia</option>
                  {competencias.map(c => (
                    <option key={c.idEventoDeporte} value={c.idEventoDeporte}>
                      {c.evento} · {c.deporte} · {c.categoria}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Disciplina</label>
                <input value={competencia ? `${competencia.deporte} / ${competencia.categoria}` : ''} disabled />
              </div>
              <div className="form-group">
                <label>Número de grupos</label>
                <select value={numGrupos} onChange={e => setNumGrupos(e.target.value)} disabled={!idEventoDeporte}>
                  {opcionesGrupos.map(n => (
                    <option key={n} value={n}>{n} grupo{n !== 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            {idEventoDeporte && equiposAprobados.length > 0 && (
              <div className="equipos-preview">
                <p className="preview-label">
                  Índice de equipos aprobados para el sorteo
                </p>
                <div className="equipos-index-grid">
                  {equiposAprobados.map((eq, i) => (
                    <div key={eq.idEquipo} className="equipo-index-card">
                      <span className="equipo-index-num">{i + 1}</span>
                      <div>
                        <strong>{codigo('EQ', eq.idEquipo)}</strong>
                        <span>{eq.nombre}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {idEventoDeporte && equiposAprobados.length < 2 && (
              <div className="sorteo-aviso">No hay suficientes equipos aprobados en esta competencia.</div>
            )}
          </div>
          <div className="sorteo-config-footer">
            {realizado && <button className="btn-reset-sorteo" onClick={handleReset}>Actualizar datos</button>}
            <button
              className={`btn-sortear ${animando ? 'btn-sortear-animando' : ''}`}
              onClick={handleSortear}
              disabled={!idEventoDeporte || equiposAprobados.length < 2 || animando}
            >
              {animando ? 'Sorteando...' : realizado ? 'Volver a sortear' : 'Ejecutar sorteo'}
            </button>
          </div>
        </div>

        {realizado && grupos.length > 0 && (
          <div className="sorteo-resultado">
            <div className="resultado-header">
              <h2 className="resultado-titulo">Resultado del sorteo</h2>
              <p className="resultado-subtitulo">
                {codigo('EV', competencia?.idEvento)} · {codigo('COMP', competencia?.idEventoDeporte)} · {competencia?.deporte} · {grupos.length} grupos · {equiposAprobados.length} equipos
              </p>
            </div>
            <div className="grupos-grid">
              {grupos.map((grupo) => (
                <div className="grupo-card" key={grupo.idGrupo}>
                  <div className="grupo-header">
                    <span className="grupo-nombre">Grupo {grupo.nombre}</span>
                    <span className="grupo-count">{grupo.equipos.length} equipos</span>
                  </div>
                  <div className="grupo-equipos">
                    {grupo.equipos.map((eq, ei) => (
                      <div className="grupo-equipo-row" key={eq.idEquipo}>
                        <span className="grupo-equipo-num">{ei + 1}</span>
                        <span className="grupo-equipo-nombre">
                          <strong>{codigo('EQ', eq.idEquipo)}</strong>
                          {eq.nombre}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="sorteo-acciones">
              <button className="btn-confirmar-sorteo" disabled>Asignación guardada en BD</button>
            </div>
          </div>
        )}
      </div>
    </InternalLayout>
  )
}

export default SorteoPage
