# 🌱 Frontend Issuer - Cooperativa Semear Digital

Interfaz web para que agentes de cooperativa emitan Verifiable Credentials (recibos digitales) a productores rurales.

## 📋 Características

- ✅ Formulario intuitivo para emisión de recibos
- ✅ Validación de CPF brasileño
- ✅ Generación de QR codes
- ✅ Histórico local de emisiones
- ✅ Design responsivo (mobile, tablet, desktop)
- ✅ Colores Embrapa + Semear Digital
- ✅ 100% frontend (HTML + CSS + JavaScript vanilla)

---

## 🚀 Setup Local

### 1. Verificar que el backend esté corriendo

El backend debe estar en: `http://localhost:3000`

```bash
cd ../backend
npm run dev
```

### 2. Abrir el frontend

Simplemente abre `index.html` en tu navegador:

```bash
# Opción 1: Doble click en index.html

# Opción 2: Con un servidor local (recomendado)
npx serve .

# O con Python
python -m http.server 8000
```

Luego abre: http://localhost:8000

---

## 📡 Configuración

Edita `js/config.js` para cambiar la URL del backend:

```javascript
const CONFIG = {
  API_URL: 'http://localhost:3000',  // Cambiar para producción
  COOPERATIVA_NOME: 'Cooperativa Semear Digital',
  ENVIRONMENT: 'development'
};
```

---

## 🎨 Paleta de Colores

```css
--azul-primario: #003D82  /* Embrapa */
--verde-embrapa: #00A859  /* Embrapa */
--verde-semear: #8CC63F   /* Semear */
--azul-semear: #0066B3    /* Semear */
--fondo: #F5F5F5
--blanco: #FFFFFF
--texto: #333333
```

---

## 📱 Uso

### Para Agentes de Cooperativa:

1. **Llenar el formulario:**
   - CPF del productor (con validación)
   - Nome completo
   - Producto entregado
   - Cantidad y unidade

2. **Click en "Emitir Recibo Digital"**
   - El sistema valida los datos
   - Conecta con el backend
   - Genera el VC firmado

3. **Mostrar QR al productor**
   - Aparece un modal con QR grande
   - El productor escanea con su wallet
   - Se guarda en histórico local

4. **Histórico**
   - Últimos 50 recibos en sidebar
   - Click para ver QR nuevamente

---

## 🏗️ Estructura

```
issuer-cooperativa/
├── index.html          # Página principal
├── css/
│   ├── style.css       # Estilos generales + layout
│   └── components.css  # Componentes (botones, inputs, modal)
├── js/
│   ├── app.js          # Lógica principal
│   ├── config.js       # Configuración (URL API)
│   ├── validators.js   # Validación CPF
│   └── qr-generator.js # Generador QR
├── assets/
│   ├── logo-embrapa.svg
│   └── logo-semear.svg
└── README.md
```

---

## 🌐 Deploy en Vercel

### Opción 1: Vercel CLI

```bash
npm install -g vercel
vercel
```

### Opción 2: GitHub + Vercel Dashboard

1. Sube el código a GitHub
2. Ve a https://vercel.com
3. "New Project" → Importa tu repo
4. Root Directory: `issuer-cooperativa`
5. Deploy

**IMPORTANTE:** Después de deployar, actualiza `js/config.js`:

```javascript
CONFIG.API_URL = 'https://tu-backend.onrender.com';
```

---

## 🌐 Deploy en Netlify

### Opción 1: Netlify CLI

```bash
npm install -g netlify-cli
netlify deploy
```

### Opción 2: Drag & Drop

1. Ve a https://app.netlify.com
2. Arrastra la carpeta `issuer-cooperativa`
3. ¡Listo!

---

## 🔧 Tecnologías

- **HTML5** - Estructura semántica
- **CSS3** - Variables CSS, Grid, Flexbox
- **JavaScript ES6+** - Vanilla JS, Fetch API
- **QRCode.js** - Generación de QR codes
- **Google Fonts** - Inter font family

### Dependencias (CDN)

- QRCode.js: https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js

---

## 📱 Responsive

- **Mobile:** 320px+
- **Tablet:** 768px+
- **Desktop:** 1024px+

---

## 🐛 Troubleshooting

### Error: "Erro ao conectar com o servidor"

- Verifica que el backend esté corriendo
- Verifica la URL en `js/config.js`
- Abre DevTools → Console para ver errores

### Error de CORS

- El backend debe tener tu origen en `ALLOWED_ORIGINS`
- Ejemplo: `ALLOWED_ORIGINS=http://localhost:8000,https://tuapp.vercel.app`

### QR no se genera

- Verifica que QRCode.js esté cargado (DevTools → Network)
- Abre Console para ver errores

---

## 📄 Licencia

MIT License

---

## 🔗 Links

- Backend API: http://localhost:3000
- Documentación W3C VCs: https://www.w3.org/TR/vc-data-model/
- QRCode.js: https://github.com/soldair/node-qrcode
