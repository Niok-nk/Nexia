# Chatbot IA + Mini CRM — Proyecto WhatsApp

> Plataforma de atención automatizada vía WhatsApp con IA (Google Gemini), mini CRM modular, gestión de leads por etapas y agentes especializados por flujo de negocio.

## Estructura del Proyecto

```
proyecto/
├── apps/
│   ├── backend/        # Node.js / Express API (Migrado a @open-wa/wa-automate)
│   └── frontend/       # Astro Dashboard CRM
├── docker-compose.yml
└── README.md
```

## Requisitos Previos

- Node.js ≥ 20 LTS
- pnpm o npm
- Docker y Docker Compose (opcional)
- Redis (para BullMQ)
- API Key de Google Gemini
- API de WooCommerce (opcional)

---

## Instalación Rápida

### 1. Clonar el repositorio

```bash
cd 2026-05-11_chat_ia_whatsaap
```

### 2. Backend (Express API)

El backend utiliza **`@open-wa/wa-automate`** para conectarse de manera estable a WhatsApp Web, evitando desconexiones, bloqueos y mezcla de números telefónicos.

```bash
cd apps/backend
pnpm install

# Generar Prisma client y actualizar base de datos local SQLite
pnpm run prisma:generate
pnpx prisma db push

# Iniciar servidor de desarrollo
pnpm run dev
```

El backend se ejecutará en `http://localhost:8000`.

### 3. Frontend (Astro Dashboard)

```bash
cd apps/frontend
pnpm install
pnpm run dev
```

El frontend se ejecutará en `http://localhost:4322` (o 4321).
Abre esta URL en tu navegador e inicia sesión con las credenciales por defecto (usuario: `admin`, contraseña: `admin1234`).

---

## Integración de WhatsApp (`@open-wa/wa-automate`)

La API utiliza la robusta librería `@open-wa/wa-automate` en lugar de `whatsapp-web.js` para asegurar estabilidad a largo plazo.

### Configuración del Navegador
El backend está configurado para:
- Ejecutarse en segundo plano de manera invisible (`headless: 'new'`).
- Utilizar el binario de **Chromium v148** descargado localmente por Puppeteer en el sistema (`C:\Users\Niok\.cache\puppeteer\chrome\win64-148.0.7778.97\chrome-win64\chrome.exe`).
- Simular un User-Agent idéntico a Chrome v148 (`Chrome/148.0.0.0`) para evitar bloqueos por versión desactualizada o detección de bots por parte de WhatsApp.
- Omitir políticas CSP (`bypassCSP: true`) para garantizar la inyección correcta de scripts.
- Habilitar autenticación alternativa a través de un servidor local en el puerto **`3012`** (`http://localhost:3012`).

### Rutas de Archivos y Caché
- **`nexia-crm-client.data.json`**: Contiene la clave de sesión encriptada del cliente.
- **`_IGNORE_nexia-crm-client/`**: Carpeta de caché de datos de sesión y cookies de Chrome de Puppeteer.

---

## 🛠️ Resolución de Problemas (Troubleshooting)

Si experimentas problemas con la inicialización de WhatsApp o si el navegador se cierra abruptamente (`TimeoutError: Waiting failed: 30000ms exceeded`), sigue estos pasos:

### 1. Limpieza Completa (Recomendado)
A veces, sesiones previas corruptas o bloqueos de archivos en Windows impiden la reconexión.
Ejecuta los siguientes comandos desde la carpeta `apps/backend` en una terminal con permisos adecuados para liberar recursos:

```powershell
# 1. Matar procesos residuales de Google Chrome
taskkill /F /IM chrome.exe /T

# 2. Borrar la caché del navegador de Puppeteer
rmdir /s /q _IGNORE_nexia-crm-client

# 3. Eliminar el archivo de sesión encriptado
del /f /q nexia-crm-client.data.json
```

### 2. Ejecutar el Servidor Interactivamente
Cuando el servidor se arranca en segundo plano a través de ciertos entornos de tareas (como procesos no interactivos), Chromium puede quedarse esperando recursos del sistema o colgarse. Se sugiere ejecutar siempre `pnpm run dev` en una terminal de PowerShell interactiva de tu sistema para asegurar que Chrome tenga permisos de red y ejecución completos.

---

## Variables de Entorno

### Backend (`apps/backend/.env`)

```env
NODE_ENV=development
PORT=8000
DATABASE_URL="file:./prisma/dev.db"
GEMINI_API_KEY=tu_api_key_aqui
WC_BASE_URL=https://tu-tienda.com
WC_CONSUMER_KEY=ck_xxx
WC_CONSUMER_SECRET=cs_xxx
REDIS_URL=redis://localhost:6379
```

---

## Endpoints API

### Auth
- `POST /api/v1/auth/login` - Iniciar sesión
- `POST /api/v1/auth/refresh` - Renovar token
- `POST /api/v1/auth/logout` - Cerrar sesión

### CRM
- `GET /api/v1/contacts` - Listar contactos
- `GET /api/v1/contacts/:id` - Detalle contacto
- `POST /api/v1/contacts` - Crear contacto
- `PATCH /api/v1/contacts/:id` - Actualizar contacto
- `GET /api/v1/leads` - Listar leads
- `GET /api/v1/leads/:id` - Detalle lead
- `PATCH /api/v1/leads/:id/stage` - Cambiar etapa de Kanban
- `POST /api/v1/leads/:id/notes` - Agregar nota interna

### WhatsApp
- `GET /api/v1/whatsapp/status` - Estado de la conexión
- `GET /api/v1/whatsapp/qr` - Obtener código QR en base64
- `POST /api/v1/whatsapp/reconnect` - Forzar reconexión y limpieza
- `POST /api/v1/whatsapp/send` - Enviar mensaje saliente

---

## Agentes IA Disponibles (Google Gemini)

| Agente | Responsabilidad |
|---|---|
| Ventas | Cotizaciones, financiamiento crédito/contado |
| Cartera | Seguimiento y recordatorios de pagos |
| Servicio Técnico | Diagnóstico inicial y agendamiento de citas |
| Repuestos | Precios, stock y compatibilidad |
| Vacantes | Reclutamiento e información de vacantes activas |
| Distribuidores | Registro y catálogo de distribuidores |
| Medios de Pago | Envío de links y métodos de pago aceptados |

---

## Roadmap

- [x] Setup base del backend
- [x] Schema de Prisma
- [x] Endpoints CRUD básicos
- [x] Agentes IA con Gemini
- [x] Migración e integración de `@open-wa/wa-automate` (Estable y Robusto)
- [x] Frontend Astro Dashboard (con Kanban, estadísticas y mensajería)
- [x] Autenticación JWT y middleware
- [x] Rate limiting y seguridad base
- [ ] JWT RS256 completo para producción
- [ ] CI/CD

## Licencia

ISC
