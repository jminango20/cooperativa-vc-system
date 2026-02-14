// ============================================
// APP PRINCIPAL - EMISOR DE VCs
// ============================================
// Este archivo contiene toda la lógica de la aplicación

// ============================================
// VARIABLES GLOBALES
// ============================================
let historicoVCs = []; // Array para guardar histórico local
let ultimoVC = null;   // Último VC emitido (para re-abrir modal)

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Aplicación cargada');

  // Cargar histórico del localStorage
  cargarHistorico();

  // Event listeners
  configurarEventListeners();

  // Auto-focus en campo CPF
  document.getElementById('cpf').focus();
});

// ============================================
// CONFIGURAR EVENT LISTENERS
// ============================================
function configurarEventListeners() {
  // Formulario de emisión
  const form = document.getElementById('form-emitir');
  form.addEventListener('submit', handleSubmitForm);

  // Máscara de CPF (formatear mientras se escribe)
  const cpfInput = document.getElementById('cpf');
  cpfInput.addEventListener('input', function(e) {
    e.target.value = formatarCPF(e.target.value);
  });

  // Validación en blur (cuando se pierde el foco)
  cpfInput.addEventListener('blur', function(e) {
    const cpf = e.target.value.replace(/[^\d]/g, '');
    if (cpf && !validarCPF(cpf)) {
      e.target.classList.add('error');
    } else {
      e.target.classList.remove('error');
    }
  });

  // Cerrar modal al hacer click fuera
  const modalOverlay = document.getElementById('modal-qr');
  modalOverlay.addEventListener('click', function(e) {
    if (e.target === modalOverlay) {
      fecharModal();
    }
  });
}

// ============================================
// MANEJAR ENVÍO DEL FORMULARIO
// ============================================
async function handleSubmitForm(e) {
  e.preventDefault();

  // Limpiar alertas previas
  limpiarAlertas();

  // Obtener valores del formulario
  const cpf = document.getElementById('cpf').value.replace(/[^\d]/g, '');
  const nome = document.getElementById('nome').value.trim();
  const produto = document.getElementById('produto').value;
  const quantidade = parseFloat(document.getElementById('quantidade').value);
  const unidade = document.getElementById('unidade').value;

  // Validar datos
  if (!validarFormulario(cpf, nome, produto, quantidade, unidade)) {
    return;
  }

  // Preparar datos para enviar
  const dados = {
    produtor: {
      cpf,
      nome
    },
    entrega: {
      produto,
      quantidade,
      unidade
    }
  };

  // Emitir VC
  await emitirVC(dados);
}

// ============================================
// VALIDAR FORMULARIO
// ============================================
function validarFormulario(cpf, nome, produto, quantidade, unidade) {
  let valido = true;

  // Validar CPF
  if (!validarCPF(cpf)) {
    document.getElementById('cpf').classList.add('error');
    valido = false;
  } else {
    document.getElementById('cpf').classList.remove('error');
  }

  // Validar nome
  if (!validarCampoRequerido(nome)) {
    document.getElementById('nome').classList.add('error');
    valido = false;
  } else {
    document.getElementById('nome').classList.remove('error');
  }

  // Validar producto
  if (!validarCampoRequerido(produto)) {
    document.getElementById('produto').classList.add('error');
    valido = false;
  } else {
    document.getElementById('produto').classList.remove('error');
  }

  // Validar cantidad
  if (!validarCantidad(quantidade)) {
    document.getElementById('quantidade').classList.add('error');
    valido = false;
  } else {
    document.getElementById('quantidade').classList.remove('error');
  }

  // Validar unidade
  if (!validarCampoRequerido(unidade)) {
    document.getElementById('unidade').classList.add('error');
    valido = false;
  } else {
    document.getElementById('unidade').classList.remove('error');
  }

  if (!valido) {
    mostrarError('Por favor, corrija os campos em vermelho');
  }

  return valido;
}

// ============================================
// EMITIR VC (Llamada al backend)
// ============================================
async function emitirVC(dados) {
  try {
    // Mostrar loading
    mostrarLoading(true);

    // Hacer petición al backend
    const response = await fetch(`${CONFIG.API_URL}/api/emitir-vc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dados)
    });

    const resultado = await response.json();

    // Ocultar loading
    mostrarLoading(false);

    // Verificar respuesta
    if (!response.ok || !resultado.success) {
      throw new Error(resultado.error || 'Erro ao emitir recibo');
    }

    // Éxito!
    console.log('✅ VC emitido:', resultado);

    // Guardar en histórico (con JWT completo para backup local)
    guardarEnHistorico(dados, resultado.vcJWT, resultado.vcId);

    // Mostrar modal con QR (usando URL corta o JWT como fallback)
    mostrarModalQR(dados, resultado.qrData, resultado.vcId);

    // Limpiar formulario
    limpiarFormulario();

    // Mostrar mensaje de éxito
    mostrarExito('Recibo digital emitido com sucesso!');

  } catch (error) {
    console.error('❌ Error al emitir VC:', error);
    mostrarLoading(false);
    mostrarError(error.message || 'Erro ao conectar com o servidor');
  }
}

// ============================================
// MOSTRAR MODAL CON QR CODE
// ============================================
function mostrarModalQR(dados, qrData, vcId) {
  // Guardar VC para poder re-abrir el modal
  ultimoVC = { dados, qrData, vcId };

  // Llenar información del recibo
  document.getElementById('modal-nome').textContent = dados.produtor.nome;
  document.getElementById('modal-produto').textContent = dados.entrega.produto;
  document.getElementById('modal-quantidade').textContent =
    `${dados.entrega.quantidade} ${dados.entrega.unidade}`;
  document.getElementById('modal-data').textContent =
    new Date().toLocaleString('pt-BR');

  // Generar QR code (400px para mejor escaneo)
  // Ahora qrData es una URL corta en lugar del JWT completo
  generarQR('qrcode', qrData, 400);

  // Mostrar modal
  const modal = document.getElementById('modal-qr');
  modal.classList.add('active');
}

// ============================================
// CERRAR MODAL
// ============================================
function fecharModal() {
  const modal = document.getElementById('modal-qr');
  modal.classList.remove('active');
}

// ============================================
// LOADING STATE
// ============================================
function mostrarLoading(show) {
  const btnText = document.getElementById('btn-text');
  const btnLoading = document.getElementById('btn-loading');
  const btnEmitir = document.getElementById('btn-emitir');

  if (show) {
    btnText.classList.add('hidden');
    btnLoading.classList.remove('hidden');
    btnEmitir.disabled = true;
  } else {
    btnText.classList.remove('hidden');
    btnLoading.classList.add('hidden');
    btnEmitir.disabled = false;
  }
}

// ============================================
// ALERTAS
// ============================================
function mostrarAlerta(tipo, mensaje) {
  const container = document.getElementById('alert-container');
  const alert = document.createElement('div');
  alert.className = `alert alert-${tipo}`;
  alert.textContent = mensaje;
  container.appendChild(alert);

  // Auto-remover después de 5 segundos
  setTimeout(() => {
    alert.remove();
  }, 5000);
}

function mostrarExito(mensaje) {
  mostrarAlerta('success', mensaje);
}

function mostrarError(mensaje) {
  mostrarAlerta('error', mensaje);
}

function limpiarAlertas() {
  const container = document.getElementById('alert-container');
  container.innerHTML = '';
}

// ============================================
// LIMPIAR FORMULARIO
// ============================================
function limpiarFormulario() {
  document.getElementById('form-emitir').reset();
  document.getElementById('cpf').focus();

  // Remover clases de error
  const inputs = document.querySelectorAll('.input-field, .select-field');
  inputs.forEach(input => input.classList.remove('error'));
}

// ============================================
// HISTÓRICO LOCAL
// ============================================
function guardarEnHistorico(dados, vcJWT, vcId) {
  const item = {
    timestamp: new Date().toISOString(),
    produtor: dados.produtor.nome,
    cpf: dados.produtor.cpf,
    produto: dados.entrega.produto,
    quantidade: dados.entrega.quantidade,
    unidade: dados.entrega.unidade,
    vcJWT,
    vcId
  };

  // Añadir al inicio del array
  historicoVCs.unshift(item);

  // Limitar a MAX_HISTORICO items
  if (historicoVCs.length > CONFIG.MAX_HISTORICO) {
    historicoVCs = historicoVCs.slice(0, CONFIG.MAX_HISTORICO);
  }

  // Guardar en localStorage
  localStorage.setItem('historico_vcs', JSON.stringify(historicoVCs));

  // Actualizar UI
  renderizarHistorico();
}

function cargarHistorico() {
  const stored = localStorage.getItem('historico_vcs');
  if (stored) {
    try {
      historicoVCs = JSON.parse(stored);
      renderizarHistorico();
    } catch (error) {
      console.error('Error al cargar histórico:', error);
      historicoVCs = [];
    }
  }
}

function renderizarHistorico() {
  const lista = document.getElementById('historico-lista');

  if (historicoVCs.length === 0) {
    lista.innerHTML = '<div class="historico-empty">Nenhum recibo emitido ainda</div>';
    return;
  }

  lista.innerHTML = historicoVCs.map((item, index) => `
    <div class="historico-item" onclick="reabrirModalVC(${index})">
      <div class="historico-item-time">
        🕐 ${new Date(item.timestamp).toLocaleString('pt-BR')}
      </div>
      <div class="historico-item-nome">
        👤 ${item.produtor}
      </div>
      <div class="historico-item-produto">
        📦 ${item.produto} - ${item.quantidade} ${item.unidade}
      </div>
    </div>
  `).join('');
}

function reabrirModalVC(index) {
  const item = historicoVCs[index];
  if (!item) return;

  const dados = {
    produtor: {
      nome: item.produtor,
      cpf: item.cpf
    },
    entrega: {
      produto: item.produto,
      quantidade: item.quantidade,
      unidade: item.unidade
    }
  };

  // Si tiene vcId, usar URL corta; sino usar JWT completo (retrocompatibilidad)
  const qrData = item.vcId
    ? `${CONFIG.API_URL}/api/vc/${item.vcId}`
    : item.vcJWT;

  mostrarModalQR(dados, qrData, item.vcId);
}

console.log('✅ App.js loaded');

// Borrar histórico
const btnBorrarHistorico = document.getElementById('btn-borrar-historico');
if (btnBorrarHistorico) {
  btnBorrarHistorico.addEventListener('click', () => {
    if (confirm('¿Borrar TODO el histórico?\n\nEsta acción no se puede deshacer.')) {
      localStorage.removeItem('historico_vcs');
      historicoVCs = [];
      renderizarHistorico();
      mostrarExito('Histórico borrado');
    }
  });
}
