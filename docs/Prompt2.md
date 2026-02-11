### **📝 PROMPT 2: Frontend Cooperativa (Cloud Ready)**
```
Crea una interfaz web para que agentes de cooperativa agrícola emitan Verifiable Credentials a productores. Deploy en Vercel o Netlify.

DISEÑO VISUAL:
- Paleta Embrapa + Semear:
  --azul-primario: #003D82
  --verde-embrapa: #00A859
  --verde-semear: #8CC63F
  --azul-semear: #0066B3
  --fondo: #F5F5F5
  --blanco: #FFFFFF
  --texto: #333333

- Incluir logos SVG en header:
  - Logo Embrapa (izquierda)
  - Logo Semear Digital (derecha)

- Design system:
  - Botones: border-radius 8px, padding 16px
  - Cards: box-shadow suave
  - Inputs: border 2px, focus ring verde
  - Font: 'Inter' o 'Roboto' de Google Fonts

FUNCIONALIDADES:

1. HEADER FIXO:
   - Logo Embrapa
   - Título: "Sistema de Emissão de Recibos - Cooperativa Semear"
   - Logo Semear Digital
   - Badge: "Issuer" (verde)

2. FORMULÁRIO EMISSÃO:
   Card com campos:
   - CPF do Produtor
     * Input com máscara: 000.000.000-00
     * Validação CPF (algoritmo brasileiro)
     * Busca nome automaticamente se existe no sistema
   
   - Nome do Produtor
     * Auto-preenchido se CPF existe
     * Editável
   
   - Produto (Select):
     * Leite cru
     * Queijo
     * Manteiga
     * Iogurte
     * Outros
   
   - Quantidade (Number)
     * Min: 0.01
     * Step: 0.01
     * Placeholder: "Ex: 50.5"
   
   - Unidade (Select):
     * Litros
     * Kg
     * Unidades
   
   - Botão "Emitir Recibo Digital"
     * Verde Embrapa
     * Icon: 📄
     * Loading spinner quando processa

3. FLUXO EMISSÃO:
   - Validar todos los campos
   - POST para API: https://api-cooperativa.onrender.com/api/emitir-vc
   - Mostrar loading overlay
   - Recibir VC JWT
   - Generar QR code grande
   - Mostrar modal con QR

4. MODAL QR CODE:
   - Background branco
   - Título: "✅ Recibo Emitido com Sucesso!"
   - Subtítulo: "Produtor deve escanear este QR"
   - QR code centralizado (300x300px)
   - Info del recibo:
     * Produtor: [nome]
     * Produto: [produto]
     * Quantidade: [quantidade] [unidade]
     * Data/Hora: [timestamp]
   - Instrução: "O produtor deve abrir o app Semear Wallet e escanear este código"
   - Botão "Emitir Novo Recibo"
   - Botão "Baixar QR" (download PNG)

5. HISTÓRICO (sidebar/panel):
   - Título: "Últimos Recibos Emitidos"
   - Lista últimos 10 VCs (do localStorage)
   - Cada item:
     * 🕐 Timestamp
     * 👤 Nome produtor
     * 📦 Produto + quantidade
     * Click → re-mostrar QR

6. CONFIGURACIÓN:
   - Archivo config.js:
```javascript
     const CONFIG = {
       API_URL: 'https://api-cooperativa.onrender.com',
       COOPERATIVA_NOME: 'Cooperativa Semear Digital',
       ENVIRONMENT: 'production'
     };
```

TECNOLOGÍAS:
- HTML5 + CSS3 + Vanilla JavaScript
- Fetch API para llamadas backend
- qrcode.js (CDN): https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js
- LocalStorage para cache histórico
- Google Fonts: Inter

RESPONSIVE:
- Mobile: 320px+
- Tablet: 768px+ (layout para tablets de agentes)
- Desktop: 1024px+

ESTRUCTURA:
/issuer-cooperativa
  - index.html
  - css/
    - style.css (estilos principais)
    - components.css (botões, cards, inputs)
  - js/
    - app.js (lógica principal)
    - config.js (URLs, constantes)
    - validators.js (validar CPF)
    - qr-generator.js (wrapper qrcode.js)
  - assets/
    - logo-embrapa.svg
    - logo-semear.svg
  - vercel.json o netlify.toml (config deploy)
  - README.md

VALIDACIONES:
- CPF: algoritmo dígitos verificadores
- Campos required no vacíos
- Quantidade > 0
- Feedback visual errores (border rojo)

ERROR HANDLING:
- Network error → "Erro de conexão, tente novamente"
- API error → Mostrar mensaje del backend
- Timeout → "Operação demorada, tente novamente"

UX:
- Autofocus en campo CPF al cargar
- Tab index lógico
- Enter submit form
- Loading states claros
- Success animations sutiles

DEPLOYMENT:
- Vercel: vercel.json con headers CORS
- Netlify: netlify.toml con redirects
- Build command: ninguno (estático)
- Output: ./

Incluye README con:
- URL demo
- Instrucciones uso para agentes
- Screenshots
```

---

