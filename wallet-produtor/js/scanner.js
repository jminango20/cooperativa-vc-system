// ============================================
// QR SCANNER
// ============================================
// Maneja el escaneo de códigos QR con la cámara

let html5QrCode = null;
let escannerActivo = false;

/**
 * Iniciar el scanner QR
 * @param {function} onSuccess - Callback cuando se escanea un QR
 */
async function iniciarScanner(onSuccess) {
  if (escannerActivo) {
    console.warn('Scanner ya está activo');
    return;
  }

  try {
    // Verificar que html5-qrcode esté cargado
    if (typeof Html5Qrcode === 'undefined') {
      throw new Error('Librería html5-qrcode no cargada');
    }

    // Crear instancia del scanner
    html5QrCode = new Html5Qrcode('qr-reader');

    // Configuración del scanner
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 }
    };

    // Iniciar scanner
    await html5QrCode.start(
      { facingMode: 'environment' }, // Cámara trasera
      config,
      (decodedText) => {
        // QR escaneado exitosamente
        console.log('✅ QR escaneado:', decodedText.substring(0, 50) + '...');
        detenerScanner();
        onSuccess(decodedText);
      },
      (errorMessage) => {
        // Error normal de escaneo (no hacer nada)
      }
    );

    escannerActivo = true;
    console.log('✅ Scanner iniciado');

  } catch (error) {
    console.error('❌ Error al iniciar scanner:', error);
    mostrarError('Erro ao acessar câmera. Verifique as permissões.');
    throw error;
  }
}

/**
 * Detener el scanner
 */
async function detenerScanner() {
  if (!escannerActivo || !html5QrCode) {
    return;
  }

  try {
    await html5QrCode.stop();
    html5QrCode.clear();
    escannerActivo = false;
    console.log('✅ Scanner detenido');
  } catch (error) {
    console.error('❌ Error al detener scanner:', error);
  }
}

/**
 * Verificar si el navegador soporta cámara
 */
function soportaCamara() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}
