// ============================================
// APP PRINCIPAL - PWA WALLET
// ============================================

let recibosActuales = [];

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Semear Wallet iniciado');

  try {
    // Verificar si tiene DID configurado
    const { tiene } = verificarMiDID();

    if (!tiene) {
      // Primera vez - mostrar modal de configuración
      mostrarConfiguracionInicial();
      return;
    }

    // Inicializar IndexedDB
    await initDB();

    // Cargar recibos
    await cargarRecibos();

    // Actualizar badge contador
    actualizarBadge();

    // Event listeners
    configurarEventListeners();

    // Verificar soporte de cámara
    if (!soportaCamara()) {
      mostrarError('Seu dispositivo não suporta câmera');
    }

  } catch (error) {
    console.error('❌ Error inicializando app:', error);
    mostrarError('Erro ao iniciar aplicação');
  }
});

// ============================================
// EVENT LISTENERS
// ============================================
function configurarEventListeners() {
  // Botón escanear
  const btnEscanear = document.getElementById('btn-escanear');
  if (btnEscanear) {
    btnEscanear.addEventListener('click', abrirScanner);
  }

  // Botón cerrar scanner
  const btnCerrarScanner = document.getElementById('btn-cerrar-scanner');
  if (btnCerrarScanner) {
    btnCerrarScanner.addEventListener('click', cerrarScanner);
  }

  // Botón cerrar detalle
  const btnCerrarDetalle = document.getElementById('btn-cerrar-detalle');
  if (btnCerrarDetalle) {
    btnCerrarDetalle.addEventListener('click', cerrarDetalle);
  }

  // Botón ver QR (en detalle)
  const btnVerQR = document.getElementById('btn-ver-qr');
  if (btnVerQR) {
    btnVerQR.addEventListener('click', mostrarQRRecibo);
  }

  // Botón cerrar QR modal
  const btnCerrarQR = document.getElementById('btn-cerrar-qr-modal');
  if (btnCerrarQR) {
    btnCerrarQR.addEventListener('click', cerrarQRModal);
  }

  // Botón compartir
  const btnCompartir = document.getElementById('btn-compartir');
  if (btnCompartir) {
    btnCompartir.addEventListener('click', compartirRecibo);
  }

  // Botón borrar todos
  const btnBorrarTodos = document.getElementById('btn-borrar-todos');
  if (btnBorrarTodos) {
    btnBorrarTodos.addEventListener('click', borrarTodosRecibos);
  }
}

// ============================================
// CARGAR RECIBOS
// ============================================
async function cargarRecibos() {
  try {
    recibosActuales = await obtenerTodosVCs();
    renderizarLista();
    console.log('✅ Recibos cargados:', recibosActuales.length);
  } catch (error) {
    console.error('❌ Error cargando recibos:', error);
    mostrarError('Erro ao carregar recibos');
  }
}

// ============================================
// RENDERIZAR LISTA
// ============================================
function renderizarLista() {
  const lista = document.getElementById('lista-recibos');
  const emptyState = document.getElementById('empty-state');

  if (recibosActuales.length === 0) {
    lista.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  lista.classList.remove('hidden');

  lista.innerHTML = recibosActuales.map(recibo => `
    <div class="recibo-card" onclick="verDetalle(${recibo.id})">
      <div class="recibo-icon">📄</div>
      <div class="recibo-info">
        <div class="recibo-produto">
          ${recibo.entrega.produto} - ${recibo.entrega.quantidade} ${recibo.entrega.unidade}
        </div>
        <div class="recibo-data">
          📅 ${formatarData(recibo.entrega.data)}
        </div>
        <div class="recibo-cooperativa">
          🏢 ${recibo.cooperativa.nome}
        </div>
      </div>
      <div class="recibo-badge">✅</div>
    </div>
  `).join('');
}

// ============================================
// ABRIR SCANNER
// ============================================
async function abrirScanner() {
  const scannerOverlay = document.getElementById('scanner-overlay');
  scannerOverlay.classList.add('active');

  try {
    await iniciarScanner(procesarQR);
  } catch (error) {
    console.error('❌ Error abriendo scanner:', error);
    cerrarScanner();
  }
}

// ============================================
// CERRAR SCANNER
// ============================================
async function cerrarScanner() {
  await detenerScanner();
  const scannerOverlay = document.getElementById('scanner-overlay');
  scannerOverlay.classList.remove('active');
}

// ============================================
// PROCESAR QR ESCANEADO
// ============================================
async function procesarQR(qrData) {
  try {
    // Mostrar loading
    mostrarLoading('Verificando recibo...');

    let vcJWT;

    // Detectar si es una URL (ID corto) o un JWT directo
    if (qrData.startsWith('http://') || qrData.startsWith('https://')) {
      // Es una URL - hacer fetch para obtener el VC
      console.log('📥 Obteniendo VC desde:', qrData);
      mostrarLoading('Baixando recibo...');

      const response = await fetch(qrData);
      const data = await response.json();

      if (!data.success || !data.vcJWT) {
        throw new Error('VC não encontrado no servidor');
      }

      vcJWT = data.vcJWT;
      console.log('✅ VC obtido do servidor');

    } else if (qrData.startsWith('eyJ')) {
      // Es un JWT directo (retrocompatibilidad)
      vcJWT = qrData;
      console.log('✅ JWT direto detectado');

    } else {
      throw new Error('QR inválido - formato desconhecido');
    }

    // Verificar el VC
    mostrarLoading('Verificando assinatura...');
    const resultado = await verificarVC(vcJWT);

    if (!resultado.valido) {
      throw new Error(resultado.error || 'Recibo inválido ou assinatura incorreta');
    }

    // Verificar que el VC sea para MI DID
    mostrarLoading('Verificando destinatário...');
    const { tiene, did: miDID, cpf: miCPF } = verificarMiDID();

    if (!tiene) {
      throw new Error('Você precisa configurar sua identidade primeiro');
    }

    // Obtener el DID del VC (puede estar en credentialSubject.id o en payload.sub)
    const vcDID = resultado.vcData.produtor?.id || resultado.payload?.sub;

    if (!vcDID) {
      throw new Error('VC não contém DID do destinatário');
    }

    // Generar DIDs históricos (actual + períodos anteriores) para verificación
    mostrarLoading('Verificando período de emissão...');
    const didsHistoricos = await generarDIDsHistoricos(miCPF);

    // Verificar si el DID del VC coincide con alguno de los períodos
    const didValido = didsHistoricos.includes(vcDID);

    if (!didValido) {
      throw new Error('❌ Este recibo não é para você!\n\nEste recibo foi emitido para outro produtor.');
    }

    console.log('[OK] Recibo verificado: DID válido para período');

    // Guardar en IndexedDB
    const vcData = {
      vcJWT: vcJWT,
      ...resultado.vcData
    };

    await guardarVC(vcData);

    // Recargar lista
    await cargarRecibos();
    actualizarBadge();

    // Ocultar loading
    ocultarLoading();

    // Mostrar éxito
    mostrarExito('✅ Recibo salvo com sucesso!');

  } catch (error) {
    console.error('❌ Error procesando QR:', error);
    ocultarLoading();
    mostrarError(error.message || 'Erro ao processar QR');
  }
}

// ============================================
// VER DETALLE
// ============================================
async function verDetalle(id) {
  try {
    const recibo = await obtenerVCPorId(id);

    if (!recibo) {
      mostrarError('Recibo não encontrado');
      return;
    }

    // Guardar ID actual para compartir
    window.reciboActualId = id;
    window.reciboActualJWT = recibo.vcJWT;

    // Llenar datos
    document.getElementById('detalle-nome').textContent = recibo.produtor.nome;
    document.getElementById('detalle-cpf').textContent = formatarCPF(recibo.produtor.cpf);
    document.getElementById('detalle-produto').textContent = recibo.entrega.produto;
    document.getElementById('detalle-quantidade').textContent =
      `${recibo.entrega.quantidade} ${recibo.entrega.unidade}`;
    document.getElementById('detalle-data').textContent = formatarDataCompleta(recibo.entrega.data);
    document.getElementById('detalle-cooperativa').textContent = recibo.cooperativa.nome;

    // Mostrar overlay
    const detalleOverlay = document.getElementById('detalle-overlay');
    detalleOverlay.classList.add('active');

  } catch (error) {
    console.error('❌ Error mostrando detalle:', error);
    mostrarError('Erro ao carregar detalhes');
  }
}

// ============================================
// CERRAR DETALLE
// ============================================
function cerrarDetalle() {
  const detalleOverlay = document.getElementById('detalle-overlay');
  detalleOverlay.classList.remove('active');
}

// ============================================
// MOSTRAR QR DEL RECIBO
// ============================================
function mostrarQRRecibo() {
  const jwt = window.reciboActualJWT;

  if (!jwt) {
    mostrarError('Erro ao gerar QR');
    return;
  }

  // Generar QR
  const qrContainer = document.getElementById('qr-display');
  qrContainer.innerHTML = '';

  new QRCode(qrContainer, {
    text: jwt,
    width: 350,
    height: 350,
    colorDark: '#333333',
    colorLight: '#FFFFFF',
    correctLevel: QRCode.CorrectLevel.L  // Nivel bajo para mejor escaneo
  });

  // Mostrar modal
  const qrModal = document.getElementById('qr-modal');
  qrModal.classList.add('active');
}

// ============================================
// CERRAR QR MODAL
// ============================================
function cerrarQRModal() {
  const qrModal = document.getElementById('qr-modal');
  qrModal.classList.remove('active');
}

// ============================================
// COMPARTIR RECIBO
// ============================================
async function compartirRecibo() {
  const jwt = window.reciboActualJWT;
  const reciboId = window.reciboActualId;

  if (!jwt) {
    mostrarError('Erro ao compartilhar');
    return;
  }

  try {
    // Obtener datos del recibo
    const recibo = await obtenerVCPorId(reciboId);

    // Crear mensaje descriptivo
    const mensaje = `📄 *Recibo Digital - Semear*\n\n` +
      `👤 Produtor: ${recibo.produtor.nome}\n` +
      `📦 Produto: ${recibo.entrega.produto}\n` +
      `📊 Quantidade: ${recibo.entrega.quantidade} ${recibo.entrega.unidade}\n` +
      `📅 Data: ${formatarData(recibo.entrega.data)}\n\n` +
      `Recibo verificável:\n${jwt}`;

    // Web Share API (compartir por WhatsApp/Telegram/etc)
    if (navigator.share) {
      try {
        // Crear archivo blob
        const blob = new Blob([jwt], { type: 'text/plain' });
        const file = new File([blob], 'recibo-semear.txt', { type: 'text/plain' });

        await navigator.share({
          title: 'Recibo Digital - Semear',
          text: mensaje,
          files: [file]
        });

        console.log('✅ Compartido exitosamente');
      } catch (error) {
        // Si falla con archivo, intentar solo con texto
        if (error.name !== 'AbortError') {
          await navigator.share({
            title: 'Recibo Digital - Semear',
            text: mensaje
          });
        }
      }
    } else {
      // Fallback: copiar al clipboard
      await navigator.clipboard.writeText(mensaje);
      mostrarExito('✅ Recibo copiado para a área de transferência!');
    }
  } catch (error) {
    console.error('❌ Error al compartir:', error);

    // Último fallback: copiar solo el JWT
    try {
      await navigator.clipboard.writeText(jwt);
      mostrarExito('Recibo copiado!');
    } catch (e) {
      mostrarError('Erro ao compartilhar');
    }
  }
}

// ============================================
// ACTUALIZAR BADGE
// ============================================
async function actualizarBadge() {
  const count = await contarVCs();
  const badge = document.getElementById('badge-count');
  if (badge) {
    badge.textContent = count;
    badge.classList.toggle('hidden', count === 0);
  }
}

// ============================================
// UTILIDADES
// ============================================
function formatarData(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString('pt-BR') + ' às ' +
         date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatarDataCompleta(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString('pt-BR');
}

function formatarCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// ============================================
// BORRAR TODOS LOS RECIBOS
// ============================================
async function borrarTodosRecibos() {
  const count = await contarVCs();

  if (count === 0) {
    mostrarError('Não há recibos para deletar');
    return;
  }

  const confirmar = confirm(`Tem certeza que deseja deletar TODOS os ${count} recibos?\n\nEsta ação não pode ser desfeita.`);

  if (!confirmar) {
    return;
  }

  try {
    mostrarLoading('Deletando recibos...');

    // Obtener todos los IDs
    const todos = await obtenerTodosVCs();

    // Eliminar uno por uno
    for (const recibo of todos) {
      await eliminarVC(recibo.id);
    }

    // Recargar lista
    await cargarRecibos();
    actualizarBadge();

    ocultarLoading();
    mostrarExito(`✅ ${count} recibo(s) deletado(s) com sucesso!`);

  } catch (error) {
    console.error('❌ Error al borrar recibos:', error);
    ocultarLoading();
    mostrarError('Erro ao deletar recibos');
  }
}

function mostrarLoading(mensaje) {
  const overlay = document.getElementById('loading-overlay');
  const text = document.getElementById('loading-text');
  if (text) text.textContent = mensaje;
  overlay.classList.add('active');
}

function ocultarLoading() {
  const overlay = document.getElementById('loading-overlay');
  overlay.classList.remove('active');
}

function mostrarExito(mensaje) {
  // Crear toast
  const toast = document.createElement('div');
  toast.className = 'toast toast-success';
  toast.textContent = mensaje;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function mostrarError(mensaje) {
  const toast = document.createElement('div');
  toast.className = 'toast toast-error';
  toast.textContent = mensaje;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

console.log('✅ App.js cargado');

// ============================================
// CONFIGURACIÓN INICIAL - DID
// ============================================
function mostrarConfiguracionInicial() {
  const overlay = document.getElementById('config-overlay');
  overlay.style.display = 'flex';

  const input = document.getElementById('config-cpf');
  const btn = document.getElementById('btn-configurar');

  // Máscara CPF
  input.addEventListener('input', (e) => {
    e.target.value = formatarCPF(e.target.value);
  });

  // Configurar identidad
  btn.addEventListener('click', async () => {
    const cpf = input.value.replace(/\D/g, '');

    if (cpf.length !== 11) {
      alert('Por favor, digite um CPF válido');
      return;
    }

    try {
      mostrarLoading('Configurando identidade...');

      // Generar y guardar DID
      const { did } = await configurarMiIdentidad(cpf);

      console.log('✅ Identidade configurada:', did);

      // Ocultar modal
      overlay.style.display = 'none';
      ocultarLoading();

      // Inicializar app
      await initDB();
      await cargarRecibos();
      actualizarBadge();
      configurarEventListeners();

      mostrarExito('✅ Identidade configurada com sucesso!');

    } catch (error) {
      console.error('❌ Error configurando identidad:', error);
      ocultarLoading();
      alert('Erro ao configurar identidade');
    }
  });
}
