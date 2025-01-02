export async function generateToken(email) {
  if (!email || typeof email !== 'string') {
    throw new Error('Invalid email input')
  }

  // Convertir el email a un ArrayBuffer
  const encoder = new TextEncoder()
  const data = encoder.encode(email)

  // Generar un hash SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)

  // Convertir el hash a una cadena hexadecimal
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('')

  // Extraer los primeros 12 caracteres
  const token = hashHex.slice(0, 12)

  return token
}

export function sanitize(value) {
  let newValue = value.toLowerCase()

  newValue = newValue.replace(/á/g, 'a')
  newValue = newValue.replace(/é/g, 'e')
  newValue = newValue.replace(/í/g, 'i')
  newValue = newValue.replace(/ó/g, 'o')
  newValue = newValue.replace(/ú/g, 'u')

  return newValue
}
