const TOKEN_KEY = 'gallery_token'
const USER_KEY = 'gallery_username'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token, username) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  if (username) localStorage.setItem(USER_KEY, username)
}

export function getUsername() {
  return localStorage.getItem(USER_KEY)
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function isLoggedIn() {
  return !!getToken()
}
