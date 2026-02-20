// ============================================
// CONFIGURACIÓN DEL WALLET
// ============================================
// IMPORTANTE: Esta configuración debe coincidir con backend/.env

const WALLET_CONFIG = {
  // ============================================
  // ROTACIÓN DE DIDs
  // ============================================
  // Período de rotación de DIDs
  // Opciones:
  //   - 'hours'  : Rotación cada hora (DEMO - para mostrar cambio rápido)
  //   - 'days'   : Rotación cada día (TESTING)
  //   - 'weeks'  : Rotación cada semana (PoC)
  //   - 'months' : Rotación cada mes (Testing medio plazo)
  //   - 'years'  : Rotación cada 4 años (PRODUCCIÓN - certificación BPF)
  //
  // El modo se puede cambiar dinámicamente con:
  // localStorage.setItem('did_rotation_mode', 'weeks')
  get rotationPeriod() {
    return localStorage.getItem('did_rotation_mode') || 'hours';
  },

  // ============================================
  // SALT PARA DIDs
  // ============================================
  // Salt usado para generar DIDs determinísticos
  // CRÍTICO: Este valor DEBE ser EXACTAMENTE igual al DID_SALT del backend
  // Si no coinciden, los DIDs generados serán diferentes
  // Cambiar en producción a un valor único y secreto
  salt: 'semear-cooperativa-poc-2026',

  // ============================================
  // API URL
  // ============================================
  // URL del backend API (se detecta automáticamente según entorno)
  get apiUrl() {
    const hostname = window.location.hostname;

    // Desarrollo local
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3000';
    }

    // Producción
    return 'https://cooperativa-vc-backend.onrender.com';
  },

  // ============================================
  // VERIFICACIÓN MULTI-PERÍODO
  // ============================================
  // Cuántos períodos atrás verificar (para certificados históricos)
  get periodosHistoricos() {
    const modo = this.rotationPeriod;
    const periodos = {
      'hours': 24,    // Últimas 24 horas
      'days': 7,      // Últimos 7 días
      'weeks': 12,    // Últimas 12 semanas
      'months': 12,   // Últimos 12 meses
      'years': 3      // Últimos 12 años (3 períodos de 4)
    };
    return periodos[modo] || 3;
  }
};

// ============================================
// HELPERS DE CONFIGURACIÓN
// ============================================

/**
 * Cambiar modo de rotación (para demos/testing)
 * @param {string} modo - 'hours', 'days', 'weeks', 'months', 'years'
 */
function cambiarModoRotacion(modo) {
  const modos = ['hours', 'days', 'weeks', 'months', 'years'];

  if (!modos.includes(modo)) {
    console.error('[ERROR] Modo inválido:', modo);
    return false;
  }

  localStorage.setItem('did_rotation_mode', modo);
  console.log('[OK] Modo de rotación cambiado a:', modo);
  console.log('[INFO] Recarga la página para aplicar cambios');
  return true;
}

/**
 * Ver configuración actual
 */
function verConfiguracion() {
  console.log('Configuración actual del Wallet:');
  console.log('  - Modo rotación:', WALLET_CONFIG.rotationPeriod);
  console.log('  - Salt:', WALLET_CONFIG.salt);
  console.log('  - API URL:', WALLET_CONFIG.apiUrl);
  console.log('  - Períodos históricos:', WALLET_CONFIG.periodosHistoricos);
}

// Exponer globalmente para debugging
window.WALLET_CONFIG = WALLET_CONFIG;
window.cambiarModoRotacion = cambiarModoRotacion;
window.verConfiguracion = verConfiguracion;

console.log('[OK] Wallet Config loaded');
