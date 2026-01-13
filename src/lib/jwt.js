/**
 * Decodifica un token JWT sin verificar la firma
 * Solo para extraer información del payload
 * @param {string} token - Token JWT
 * @returns {object|null} Payload decodificado o null si falla
 */
export function decodeJWT(token) {
  try {
    if (!token) return null;
    
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    // Decodificar base64url a string
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error al decodificar JWT:', error);
    return null;
  }
}

/**
 * Extrae el userId del token JWT
 * @param {string} token - Token JWT
 * @returns {number|null} userId o null si no se encuentra
 */
export function getUserIdFromToken(token) {
  const payload = decodeJWT(token);
  if (!payload) return null;
  
  // El userId puede estar en diferentes campos según el backend
  return payload.userId || payload.id || payload.sub || null;
}

/**
 * Verifica si el token ha expirado
 * @param {string} token - Token JWT
 * @returns {boolean} true si el token ha expirado
 */
export function isTokenExpired(token) {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return true;
  
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}
