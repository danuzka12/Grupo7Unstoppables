const API_URL = 'http://localhost:8080/api/usuarios'

// LISTAR
export async function obtenerUsuarios() {

  const response = await fetch(API_URL)

  if (!response.ok) {
    throw new Error('Error al obtener usuarios')
  }

  return await response.json()
}

// CREAR
export async function crearUsuario(usuario) {

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(usuario)
  })

  if (!response.ok) {
    throw new Error('Error al crear usuario')
  }

  return await response.json()
}

// ELIMINAR
export async function eliminarUsuario(id) {

  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE'
  })

  if (!response.ok) {
    throw new Error('Error al eliminar usuario')
  }
}