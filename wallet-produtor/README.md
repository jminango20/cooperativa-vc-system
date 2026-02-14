# 📱 Semear Wallet - PWA para Productores

Progressive Web App para productores rurales brasileños recibir y almacenar Verifiable Credentials.

## 🚀 Características

- ✅ Scanner QR con cámara
- ✅ Verificación de firmas criptográficas
- ✅ Almacenamiento local (IndexedDB)
- ✅ Funciona offline (PWA)
- ✅ Diseño mobile-first
- ✅ Instalable en el celular

---

## 🧪 Probar Localmente

### 1. Arrancar servidor

```bash
cd wallet-produtor
npx serve -l 9000
```

### 2. Abrir en navegador

```
http://localhost:9000
```

**IMPORTANTE:** Usa HTTPS o localhost para que la cámara funcione.

### 3. Probar flujo completo

1. Abre el Issuer en otra pestaña (http://localhost:8000)
2. Emite un VC (genera QR)
3. En la Wallet, click "Escanear Novo Recibo"
4. Escanea el QR de la pantalla (o usa tu celular)
5. ¡El recibo se guarda automáticamente!

---

## 📱 Instalar como App

### En Android (Chrome):
1. Abre la wallet en Chrome
2. Menú (⋮) → "Instalar app" o "Agregar a pantalla de inicio"
3. ¡Listo! Funciona como app nativa

### En iOS (Safari):
1. Abre la wallet en Safari
2. Compartir → "Agregar a pantalla de inicio"
3. ¡Listo!

---

## 🏗️ Arquitectura

```
Scanner QR → Verifica Firma → Guarda en IndexedDB → Muestra Lista
```

### Tecnologías:
- **html5-qrcode**: Scanner QR
- **did-jwt**: Verificación de firmas
- **IndexedDB**: Storage local
- **Service Worker**: Cache offline
- **Web Share API**: Compartir recibos

---

## 🔐 Seguridad

- ✅ Solo acepta VCs con firma válida
- ✅ Verifica estructura W3C
- ✅ Verifica expiración
- ✅ HTTPS obligatorio en producción

---

## 📊 Storage

Los recibos se guardan en IndexedDB del navegador:
- **Persistente**: No se borran al cerrar el navegador
- **Offline**: Funciona sin internet
- **Privado**: Solo accesible desde la app

---

## 🌐 Deploy

### Vercel

```bash
cd wallet-produtor
vercel
```

### Netlify

```bash
cd wallet-produtor
netlify deploy --prod
```

---

## 🐛 Troubleshooting

### Cámara no funciona
- Verifica permisos del navegador
- Usa HTTPS (no HTTP)
- En localhost funciona sin HTTPS

### QR no se escanea
- Asegúrate que el QR sea de un VC válido
- Mejora la iluminación
- Acerca más el QR a la cámara

### Recibo no se guarda
- Abre DevTools → Console
- Ve el error específico
- Verifica que el VC tenga firma válida

---

## 📄 Licencia

MIT License
