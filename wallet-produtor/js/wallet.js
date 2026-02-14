// ============================================
// WALLET - IndexedDB Manager
// ============================================
// Gestiona el almacenamiento local de VCs

const DB_NAME = 'SemearWalletDB';
const DB_VERSION = 1;
const STORE_NAME = 'recibos';

let db = null;

// Inicializar base de datos
async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      console.log('✅ IndexedDB inicializado');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      db = event.target.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true
        });

        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        objectStore.createIndex('cpf', 'produtor.cpf', { unique: false });

        console.log('✅ Object store creado');
      }
    };
  });
}

// Verificar si VC ya existe (por JWT)
async function vcExiste(vcJWT) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const existe = request.result.some(vc => vc.vcJWT === vcJWT);
      resolve(existe);
    };

    request.onerror = () => reject(request.error);
  });
}

// Guardar VC
async function guardarVC(vcData) {
  // Verificar si ya existe
  const yaExiste = await vcExiste(vcData.vcJWT);

  if (yaExiste) {
    console.log('ℹ️ VC ya existe, no se guarda duplicado');
    throw new Error('Este recibo ya está guardado en tu wallet');
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const recibo = {
      vcJWT: vcData.vcJWT,
      produtor: vcData.produtor,
      entrega: vcData.entrega,
      cooperativa: vcData.cooperativa,
      verificado: true,
      timestamp: new Date().toISOString()
    };

    const request = store.add(recibo);

    request.onsuccess = () => {
      console.log('✅ VC guardado, ID:', request.result);
      resolve(request.result);
    };

    request.onerror = () => reject(request.error);
  });
}

// Obtener todos los VCs
async function obtenerTodosVCs() {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const recibos = request.result.sort((a, b) =>
        new Date(b.timestamp) - new Date(a.timestamp)
      );
      resolve(recibos);
    };

    request.onerror = () => reject(request.error);
  });
}

// Obtener VC por ID
async function obtenerVCPorId(id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Eliminar VC
async function eliminarVC(id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Contar VCs
async function contarVCs() {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.count();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
