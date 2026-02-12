// ============================================
// GENERADOR DE QR CODES
// ============================================
// Wrapper para la librería qrcodejs (davidshimjs)

/**
 * Genera un QR code en un div
 * @param {string} elementId - ID del elemento donde se generará el QR
 * @param {string} data - Datos a codificar (el JWT del VC)
 * @param {number} size - Tamaño del QR (default: 300)
 */
function generarQR(elementId, data, size = 300) {
  const container = document.getElementById(elementId);

  if (!container) {
    console.error('❌ Container no encontrado:', elementId);
    return;
  }

  // Verificar que la librería QRCode esté cargada
  if (typeof window.QRCode === 'undefined') {
    console.error('❌ Librería QRCode no cargada');
    console.log('📦 Intentando cargar desde CDN alternativo...');
    mostrarError('Error al cargar generador de QR. Recarga la página.');
    return;
  }

  try {
    // Limpiar el contenedor (por si hay un QR anterior)
    container.innerHTML = '';

    // Generar el QR code usando davidshimjs/qrcodejs
    new window.QRCode(container, {
      text: data,
      width: size,
      height: size,
      colorDark: '#003D82',  // Azul Embrapa
      colorLight: '#FFFFFF',  // Fondo blanco
      correctLevel: window.QRCode.CorrectLevel.H // Nivel alto de corrección
    });

    console.log('✅ QR code generado correctamente');
  } catch (error) {
    console.error('❌ Error al generar QR:', error);
    mostrarError('Error al generar código QR');
  }
}

/**
 * Descarga el QR code como imagen PNG
 * @param {string} containerId - ID del container con el QR
 * @param {string} filename - Nombre del archivo (default: qr-code.png)
 */
function descargarQR(containerId, filename = 'recibo-digital.png') {
  const container = document.getElementById(containerId);

  if (!container) {
    console.error('❌ Container no encontrado');
    return;
  }

  try {
    // Buscar el canvas dentro del container
    const canvas = container.querySelector('canvas');

    if (!canvas) {
      console.error('❌ Canvas no encontrado en el container');
      mostrarError('No se puede descargar el QR');
      return;
    }

    // Convertir canvas a blob
    canvas.toBlob((blob) => {
      // Crear URL temporal
      const url = URL.createObjectURL(blob);

      // Crear enlace temporal y hacer click
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Liberar URL temporal
      URL.revokeObjectURL(url);

      console.log('✅ QR descargado:', filename);
      mostrarExito('QR code descargado');
    });
  } catch (error) {
    console.error('❌ Error al descargar QR:', error);
    mostrarError('Error al descargar QR code');
  }
}

console.log('✅ QR Generator loaded');
