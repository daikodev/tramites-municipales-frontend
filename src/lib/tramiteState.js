/**
 * Utilidades para gestionar el estado del trámite en localStorage
 */

/**
 * Guarda el estado del trámite en un paso específico
 */
export function saveTramiteState(step, data) {
  try {
    localStorage.setItem(`tramiteStep_${step}`, JSON.stringify(data));
  } catch (error) {
    console.error('Error al guardar estado del trámite:', error);
  }
}

/**
 * Carga el estado del trámite de un paso específico
 */
export function loadTramiteState(step) {
  try {
    const data = localStorage.getItem(`tramiteStep_${step}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error al cargar estado del trámite:', error);
    return null;
  }
}

/**
 * Limpia todo el estado del trámite
 */
export function clearTramiteState() {
  const keys = [
    'applicationId',
    'currentApplicationId',
    'selectedTramite',
    'tramiteCost',
    'tramiteFormData',
    'paymentMethod',
    'currentRequisitos',
    'uploadProgress',
    'tramiteStep_files',
    'tramiteStep_form',
    'tramiteStep_payment'
  ];
  
  keys.forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error al limpiar ${key}:`, error);
    }
  });
}

/**
 * Verifica si existe un trámite en progreso
 */
export function hasTramiteInProgress() {
  return !!(
    localStorage.getItem('applicationId') ||
    localStorage.getItem('currentApplicationId')
  );
}

/**
 * Obtiene el ID de la solicitud actual
 */
export function getCurrentApplicationId() {
  return localStorage.getItem('applicationId') || 
         localStorage.getItem('currentApplicationId');
}

/**
 * Guarda el progreso del archivo subido
 */
export function saveUploadProgress(requirementId, uploaded) {
  try {
    const progress = JSON.parse(localStorage.getItem('uploadProgress') || '{}');
    progress[requirementId] = uploaded;
    localStorage.setItem('uploadProgress', JSON.stringify(progress));
  } catch (error) {
    console.error('Error al guardar progreso de carga:', error);
  }
}

/**
 * Carga el progreso de archivos subidos
 */
export function loadUploadProgress() {
  try {
    return JSON.parse(localStorage.getItem('uploadProgress') || '{}');
  } catch (error) {
    console.error('Error al cargar progreso de carga:', error);
    return {};
  }
}

/**
 * Limpia el progreso de carga de archivos
 */
export function clearUploadProgress() {
  try {
    localStorage.removeItem('uploadProgress');
  } catch (error) {
    console.error('Error al limpiar progreso de carga:', error);
  }
}
