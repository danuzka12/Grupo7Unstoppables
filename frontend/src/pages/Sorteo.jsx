import { useState } from 'react'
import InternalLayout from '../layouts/InternalLayout'
import '../styles/sorteo.css'

const eventosDisponibles = [
  { id: 1, nombre: 'Olimpiadas Interinstitucionales 2025', disciplinas: ['Fútbol', 'Baloncesto'] },
  { id: 2, nombre: 'Copa Institucional Junio', disciplinas: ['Voleibol'] },
]

const equiposPorEvento = {
  1: [
    { id: 1, nombre: 'Equipo Norte', disciplina: 'Fútbol' },
    { id: 2, nombre: 'Equipo Sur', disciplina: 'Fútbol' },
    { id: 3, nombre: 'Equipo Este', disciplina: 'Fútbol' },
    { id: 4, nombre: 'Equipo Oeste', disciplina: 'Fútbol' },
    { id: 5, nombre: 'Equipo Central', disciplina: 'Fútbol' },
    { id: 6, nombre: 'Equipo Andino', disciplina: 'Fútbol' },
  ],
  2: [
    { id: 7, nombre: 'Equipo Azul', disciplina: 'Voleibol' },
    { id: 8, nombre: 'Equipo Rojo', disciplina: 'Voleibol' },
    { id: 9, nombre: 'Equipo Verde', disciplina: 'Voleibol' },
    { id: 10, nombre: 'Equipo Amarillo', disciplina: 'Voleibol' },
  ],
}

function mezclar(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function dividirEnGrupos(equipos, numGrupos) {
  const grupos = Array.from({ length: numGrupos }, (_, i) => ({ nombre: `Grupo ${String.fromCharCode(65 + i)}`, equipos: [] }))
  equipos.forEach((eq, idx) => grupos[idx % numGrupos].equipos.push(eq))
  return grupos
}

function SorteoPage() {
  const [eventoId, setEventoId] = useState('')
  const [disciplina, setDisciplina] = useState('')
  const [numGrupos, setNumGrupos] = useState(2)
  const [grupos, setGrupos] = useState([])
  const [realizado, setRealizado] = useState(false)
  const [animando, setAnimando] = useState(false)

  const eventoSelec = eventosDisponibles.find(e => String(e.id) === String(eventoId))
  const equiposDisp = eventoId ? (equiposPorEvento[eventoId] || []).filter(eq => !disciplina || eq.disciplina === disciplina) : []
  const maxGrupos = Math.max(2, Math.floor(equiposDisp.length / 2))

  const handleSortear = () => {
    if (!eventoId || !disciplina || equiposDisp.length < 2) return
    setAnimando(true)
    setTimeout(() => {
      const mezclados = mezclar(equiposDisp)
      setGrupos(dividirEnGrupos(mezclados, Number(numGrupos)))
      setRealizado(true)
      setAnimando(false)
    }, 1200)
  }

  const handleReset = () => { setGrupos([]); setRealizado(false) }

  return (
    <InternalLayout titulo="Sorteo y asignación de equipos" subtitulo="Distribuye los equipos en grupos de forma aleatoria y equitativa">
      <div className="sorteo-page">

        <div className="sorteo-config-card">
          <div className="sorteo-config-header">
            <h2 className="sorteo-titulo">Configuración del sorteo</h2>
            <p className="sorteo-subtitulo">Selecciona el evento, disciplina y número de grupos para ejecutar el sorteo.</p>
          </div>
          <div className="sorteo-config-body">
            <div className="form-row-3">
              <div className="form-group">
                <label>Evento</label>
                <select value={eventoId} onChange={e => { setEventoId(e.target.value); setDisciplina(''); setRealizado(false); setGrupos([]) }}>
                  <option value="">Selecciona un evento</option>
                  {eventosDisponibles.map(ev => <option key={ev.id} value={ev.id}>{ev.nombre}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Disciplina</label>
                <select value={disciplina} onChange={e => { setDisciplina(e.target.value); setRealizado(false); setGrupos([]) }} disabled={!eventoSelec}>
                  <option value="">Selecciona disciplina</option>
                  {eventoSelec?.disciplinas.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Número de grupos</label>
                <select value={numGrupos} onChange={e => setNumGrupos(e.target.value)} disabled={!disciplina}>
                  {Array.from({ length: Math.max(1, maxGrupos - 1) }, (_, i) => i + 2).map(n => (
                    <option key={n} value={n}>{n} grupos</option>
                  ))}
                </select>
              </div>
            </div>

            {disciplina && equiposDisp.length > 0 && (
              <div className="equipos-preview">
                <p className="preview-label">{equiposDisp.length} equipo{equiposDisp.length !== 1 ? 's' : ''} disponible{equiposDisp.length !== 1 ? 's' : ''} para el sorteo</p>
                <div className="preview-tags">
                  {equiposDisp.map(eq => <span key={eq.id} className="preview-tag">{eq.nombre}</span>)}
                </div>
              </div>
            )}

            {disciplina && equiposDisp.length < 2 && (
              <div className="sorteo-aviso">No hay suficientes equipos inscritos en esta disciplina para realizar el sorteo.</div>
            )}
          </div>
          <div className="sorteo-config-footer">
            {realizado && <button className="btn-reset-sorteo" onClick={handleReset}>Reiniciar sorteo</button>}
            <button
              className={`btn-sortear ${animando ? 'btn-sortear-animando' : ''}`}
              onClick={handleSortear}
              disabled={!disciplina || equiposDisp.length < 2 || animando}
            >
              {animando ? 'Sorteando...' : realizado ? 'Volver a sortear' : 'Ejecutar sorteo'}
            </button>
          </div>
        </div>

        {realizado && grupos.length > 0 && (
          <div className="sorteo-resultado">
            <div className="resultado-header">
              <h2 className="resultado-titulo">Resultado del sorteo</h2>
              <p className="resultado-subtitulo">{disciplina} · {grupos.length} grupos · {equiposDisp.length} equipos</p>
            </div>
            <div className="grupos-grid">
              {grupos.map((grupo, gi) => (
                <div className="grupo-card" key={gi}>
                  <div className="grupo-header">
                    <span className="grupo-nombre">{grupo.nombre}</span>
                    <span className="grupo-count">{grupo.equipos.length} equipos</span>
                  </div>
                  <div className="grupo-equipos">
                    {grupo.equipos.map((eq, ei) => (
                      <div className="grupo-equipo-row" key={eq.id}>
                        <span className="grupo-equipo-num">{ei + 1}</span>
                        <span className="grupo-equipo-nombre">{eq.nombre}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="sorteo-acciones">
              <button className="btn-confirmar-sorteo">Confirmar y guardar asignación</button>
            </div>
          </div>
        )}
      </div>
    </InternalLayout>
  )
}

export default SorteoPage