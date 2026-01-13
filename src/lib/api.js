// Configuración de APIs para el backend
const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Utilidad para manejar respuestas de fetch
 */
async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ 
      message: 'Error en la petición' 
    }));
    throw new Error(error.message || `Error ${response.status}`);
  }
  return response.json();
}

/**
 * API para gestión de trámites
 */
export const tramitesAPI = {
  /**
   * Subir archivo para un requisito específico
   * @param {string} applicationId - ID de la solicitud
   * @param {string|number} requirementId - ID del requisito
   * @param {File} file - Archivo a subir
   */
  async subirArchivo(applicationId, requirementId, file) {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('requirementId', requirementId);

    const response = await fetch(
      `${API_URL}/applications/${applicationId}/files`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      }
    );

    return handleResponse(response);
  },

  /**
   * Obtener requisitos de un procedimiento
   * @param {string|number} procedureId - ID del procedimiento
   */
  async obtenerRequisitos(procedureId) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(
      `${API_URL}/procedures/${procedureId}/requisitos`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return handleResponse(response);
  },

  /**
   * Obtener lista de procedimientos/trámites disponibles
   */
  async obtenerProcedimientos() {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/procedures`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return handleResponse(response);
  },

  /**
   * Crear una nueva solicitud de trámite
   * @param {number} procedureId - ID del procedimiento
   */
  async crearSolicitud(procedureId) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/applications`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ procedureId }),
    });

    return handleResponse(response);
  },

  /**
   * Obtener historial de trámites del usuario
   */
  async obtenerHistorial() {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/applications/my`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return handleResponse(response);
  },

  /**
   * Obtener detalle de un trámite específico
   * @param {string|number} applicationId - ID de la solicitud
   */
  async obtenerDetalle(applicationId) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/applications/${applicationId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return handleResponse(response);
  },

  /**
   * Obtener resumen de una solicitud
   * @param {string|number} applicationId - ID de la solicitud
   */
  async obtenerResumen(applicationId) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(
      `${API_URL}/applications/${applicationId}/summary`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return handleResponse(response);
  },

  /**
   * Registrar pago de un trámite
   * @param {string|number} applicationId - ID de la solicitud
   * @param {object} paymentData - Datos del pago
   */
  async registrarPago(applicationId, paymentData) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(
      `${API_URL}/applications/${applicationId}/pay`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      }
    );

    return handleResponse(response);
  },

  /**
   * Obtener historial de cambios de una solicitud
   * @param {string|number} applicationId - ID de la solicitud
   */
  async obtenerHistorialCambios(applicationId) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(
      `${API_URL}/applications/${applicationId}/history`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return handleResponse(response);
  },
};

/**
 * API para gestión de formatos/documentos
 */
export const formatosAPI = {
  /**
   * Descargar un formato específico
   * @param {string|number} formatId - ID del formato
   * @returns {Promise<Blob>} Archivo en formato Blob
   */
  async descargar(formatId) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/formats/${formatId}/download`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al descargar el formato');
    }

    return response.blob();
  },

  /**
   * Obtener lista de formatos disponibles
   */
  async obtenerFormatos() {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/formats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return handleResponse(response);
  },
};

/**
 * API para autenticación (complementaria)
 */
export const authAPI = {
  /**
   * Verificar si el token es válido
   */
  async verificarToken() {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const response = await fetch(`${API_URL}/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch {
      return false;
    }
  },

  /**
   * Cerrar sesión
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('currentApplicationId');
    localStorage.removeItem('currentRequisitos');
    localStorage.removeItem('applicationId');
  },
};

// Exportar URL base para uso directo si es necesario
export const API_BASE_URL = API_URL;
