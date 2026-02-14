// ============================================
// CONFIGURACIÓN DE LA APLICACIÓN
// ============================================
// Este archivo centraliza todas las URLs y constantes

const CONFIG = {
  // URL del backend API
  // Para desarrollo local: http://localhost:3000
  // Para producción: https://api-cooperativa.onrender.com
  API_URL: 'http://localhost:3000',

  // Nombre de la cooperativa
  COOPERATIVA_NOME: 'Cooperativa Semear Digital',

  // Entorno (development o production)
  ENVIRONMENT: 'development',

  // Timeout para peticiones (en milisegundos)
  REQUEST_TIMEOUT: 30000, // 30 segundos

  // Límite de VCs en histórico local
  MAX_HISTORICO: 50
};

// Detectar si estamos en producción (por el hostname)
if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
  CONFIG.ENVIRONMENT = 'production';
  // En producción, cambiar a la URL real del backend
  CONFIG.API_URL = 'https://cooperativa-vc-backend.onrender.com';
}

console.log('🚀 Config loaded:', CONFIG);
