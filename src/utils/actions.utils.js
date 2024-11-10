export function generateToken(email, username) {
  const baseString = `${email}${username}`

  let hash = 0
  for (let i = 0; i < baseString.length; i++) {
    hash = (hash << 5) - hash + baseString.charCodeAt(i)
    hash |= 0
  }

  const alphanumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''

  while (token.length < 12) {
    const index = Math.abs(hash % alphanumeric.length)
    token += alphanumeric[index]
    hash = Math.floor(hash / alphanumeric.length)
  }

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
