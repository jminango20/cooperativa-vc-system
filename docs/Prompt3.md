### **📝 PROMPT 3: PWA Wallet Produtor (Cloud Ready)**
```
Crea una Progressive Web App para productores rurales brasileños recibir y almacenar Verifiable Credentials de entregas agrícolas. Deploy en Vercel/Netlify.

DISEÑO:
- Tema rural-friendly (simple, claro):
  --verde-principal: #8CC63F (Semear)
  --azul-principal: #0066B3 (Semear)
  --fondo: #FFFFFF
  --card: #F9F9F9
  --borde: #E0E0E0
  --texto: #333333
  --sucesso: #00A859
  --erro: #DC3545

- Logo Semear Digital en splash y header

- Iconografia grande e clara (mínimo 48x48px touch targets)

- Textos simples (evitar tecnicismos)

FUNCIONALIDADES:

1. SPLASH SCREEN (primeira visita):
   - Logo Semear grande
   - Título: "Semear Wallet"
   - Subtítulo: "Seus recibos digitais"
   - Botão: "Começar"
   - Explicação 3 passos:
     1. 📷 Escanear QR da cooperativa
     2. 💾 Recibo salvo automaticamente
     3. 📱 Mostrar para verificadores

2. TELA PRINCIPAL:
   - Header:
     * Logo Semear
     * "Meus Recibos" (título)
     * Badge: Quantidade recibos
   
   - Botão DESTAQUE (hero):
     * "📷 Escanear Novo Recibo"
     * Verde grande (80% width)
     * Abre scanner
   
   - Lista Recibos (se vazia):
     * Ilustração vazia state
     * "Você ainda não tem recibos"
     * "Toque no botão acima para escanear"
   
   - Lista Recibos (com dados):
     * Cards ordenados por data
     * Cada card:
       - 📄 Ícone
       - [Produto] - [Quantidade] [Unidade]
       - 📅 [Data] às [Hora]
       - 🏢 Cooperativa: [Nome]
       - Badge: ✅ Verificado
     * Click card → ver detalhes

3. SCANNER QR:
   - Fullscreen overlay
   - Camera view
   - Cuadro guía (250x250px)
   - Instrução: "Posicione o QR dentro do quadro"
   - Botão voltar (X)
   - Usa html5-qrcode:
     * CDN: https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js
     * facingMode: "environment"
     * fps: 10
     * qrbox: 250

4. PROCESSAMENTO VC:
   - Ao escanear QR:
     1. Mostrar loading: "Verificando recibo..."
     2. Decodificar JWT
     3. Verificar firma com did-jwt (CDN)
     4. Extraer datos VC
     5. Validar estructura W3C
     6. Guardar en IndexedDB
     7. Mostrar: "✅ Recibo salvo!"
     8. Fechar scanner
     9. Atualizar lista

5. DETALLE RECIBO:
   - Header com volta
   - Card detalhado:
     * 👤 Produtor
       - Nome: [nome]
       - CPF: [XXX.XXX.XXX-XX]
     
     * 📦 Entrega
       - Produto: [produto]
       - Quantidade: [quantidade] [unidade]
       - Data: [DD/MM/YYYY HH:mm]
     
     * 🏢 Cooperativa
       - Nome: [nome cooperativa]
       - Status: ✅ Verificado
     
     * 🔐 Segurança
       - ID: [primeiros 8 chars do VC]
       - Assinatura: Válida
   
   - Botões:
     * "Ver QR" → mostrar QR para verificadores
     * "Compartilhar" → Web Share API

6. MOSTRAR QR (para verificadores):
   - Fullscreen branco
   - QR grande (350x350px)
   - Texto: "Mostre este código ao verificador"
   - QR contém: VC JWT completo
   - Botão fechar

7. STORAGE (IndexedDB):
   - Database: "SemearWalletDB"
   - Store: "recibos"
   - Schema:
```javascript
     {
       id: auto_increment,
       vcJWT: string,
       produtor: { nome, cpf },
       entrega: { produto, quantidade, unidade, data },
       cooperativa: { nome, did },
       verificado: boolean,
       timestamp: ISOString
     }
```

8. PWA MANIFEST:
```json
   {
     "name": "Semear Wallet",
     "short_name": "Semear",
     "description": "Carteira digital de recibos agrícolas",
     "start_url": "/",
     "display": "standalone",
     "background_color": "#FFFFFF",
     "theme_color": "#8CC63F",
     "icons": [
       { "src": "/icons/icon-192.png", "sizes": "192x192" },
       { "src": "/icons/icon-512.png", "sizes": "512x512" }
     ]
   }
```

9. SERVICE WORKER:
   - Cache-first strategy
   - Cache:
     * HTML, CSS, JS
     * Logos, ícones
     * did-jwt, html5-qrcode (CDN)
   - Funciona 100% offline depois de instalado

TECNOLOGIAS:
- HTML5 + CSS3 + Vanilla JavaScript
- html5-qrcode (CDN)
- did-jwt (CDN): https://cdn.jsdelivr.net/npm/did-jwt@7/dist/did-jwt.min.js
- IndexedDB nativo
- Service Worker
- Web Share API

ESTRUCTURA:
/wallet-produtor
  - index.html
  - css/
    - style.css
    - scanner.css
  - js/
    - app.js (main app)
    - wallet.js (IndexedDB manager)
    - scanner.js (QR scanner)
    - vc-verifier.js (verificar firma)
  - manifest.json
  - service-worker.js
  - icons/
    - icon-192.png
    - icon-512.png
  - assets/
    - logo-semear.svg
  - README.md

VERIFICAÇÃO VC:
- Usar did-jwt.verifyJWT()
- Verificar issuer é cooperativa conhecida
- Validar estrutura credentialSubject
- Verificar não expirado (exp claim)
- Se inválido: não guardar, mostrar erro

OFFLINE-FIRST:
- App funciona sem internet depois de instalado
- VCs guardados localmente
- Pode mostrar QRs offline
- Sync futuro (opcional)

UX CRÍTICA:
- Linguagem muito simples
- Não mencionar: "DID", "VC", "JWT", "blockchain"
- Usar: "recibo", "escanear", "verificado"
- Botões grandes (min 48x48px)
- Alto contraste
- Icons + texto sempre

ACESSIBILIDADE:
- ARIA labels
- Alt text imagens
- Keyboard navigation
- Screen reader friendly

SEGURANÇA:
- Não guardar VCs inválidos
- Alertar se firma falha
- HTTPS obrigatório
- Content Security Policy

DEPLOYMENT:
- Vercel ou Netlify
- Build: ninguno (estático)
- HTTPS automático
- Custom domain: wallet.semear.app

Incluye:
- README setup
- Tutorial instalação PWA (screenshots)
- Guia uso para agricultores (PDF)
```

---

