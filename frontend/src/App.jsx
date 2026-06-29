import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Disciplinas from './pages/Disciplinas'
import Eventos from './pages/Eventos'
import Equipos from './pages/Equipos'
import Participantes from './pages/Participantes'
import Sorteo from './pages/Sorteo'
import Partidos from './pages/Partidos'
import Resultados from './pages/Resultados'
import Usuarios from './pages/Usuarios'
import ProtectedRoute from './routes/ProtectedRoute'
import Instituciones from './pages/Instituciones'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/disciplinas" element={<ProtectedRoute><Disciplinas /></ProtectedRoute>} />
        <Route path="/eventos" element={<ProtectedRoute><Eventos /></ProtectedRoute>} />
        <Route path="/equipos" element={<ProtectedRoute><Equipos /></ProtectedRoute>} />
        <Route path="/participantes" element={<ProtectedRoute><Participantes /></ProtectedRoute>} />
        <Route path="/sorteo" element={<ProtectedRoute><Sorteo /></ProtectedRoute>} />
        <Route path="/partidos" element={<ProtectedRoute><Partidos /></ProtectedRoute>} />
        <Route path="/resultados" element={<ProtectedRoute><Resultados /></ProtectedRoute>} />
        <Route path="/Usuarios" element={<ProtectedRoute><Usuarios /></ProtectedRoute>} />
        <Route path="/instituciones" element={<ProtectedRoute><Instituciones /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App