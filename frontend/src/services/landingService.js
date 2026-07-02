const API_URL = 'http://localhost:8080/api/landing'


export async function obtenerResumenLanding() {

  const response = await fetch(`${API_URL}/resumen`)

  if (!response.ok) {
    throw new Error('Error al obtener la información del landing page')
  }

  return await response.json()
}
