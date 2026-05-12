# Completar Chatbot IA + Mini CRM — WhatsApp

El proyecto ya tiene la estructura base (Fase 1-3 del roadmap). El backend tiene esqueleto funcional pero varios módulos están incompletos (`TODO`). El frontend es prácticamente una página vacía. Este plan completa el sistema de manera incremental siguiendo las fases 4–7 del roadmap.

---

## Estado actual

| Componente | Estado |
|---|---|
| Express + middlewares base | ✅ Completo |
| Agentes IA (7 agentes) | ✅ Completo (prompts básicos) |
| Orquestador (classifyIntent + route) | ✅ Completo |
| WhatsApp bridge (QR, LocalAuth) | ✅ Parcial — **no conecta WA con orquestador/CRM** |
| Prisma schema (Contact, Lead, Message, Note) | ✅ Completo |
| CRM contacts/leads routers | ✅ Funcional (CRUD básico) |
| Auth JWT | ❌ Solo stub vacío (`TODO`) |
| Middleware RBAC / error handler | ❌ Vacío |
| WA router (status, QR, send) | ❌ Solo stubs |
| WooCommerce (cliente real) | ✅ Funcional (básico) |
| Frontend dashboard CRM | ❌ Solo UI mínima |

---

## Propuestas de Cambio

### FASE A — Backend: Núcleo crítico (conectar todo)

#### [MODIFY] whatsapp.ts
Conectar el evento `message` al orquestador + persistir mensajes y actualizar leads en la BD.

#### [NEW] src/whatsapp/message.handler.ts
Handler dedicado que:
1. Busca o crea el `Contact` en BD
2. Persiste el `Message` (INBOUND)
3. Llama a `orchestrator.route()`
4. Persiste respuesta (OUTBOUND) y actualiza el `Lead`
5. Envía respuesta de vuelta por WA

#### [MODIFY] src/whatsapp/whatsapp.router.ts
Implementar los endpoints reales:
- `GET /status` → estado real del cliente WA (connected/disconnected)
- `GET /qr` → QR en base64 actual
- `POST /send` → enviar mensaje manual

#### [MODIFY] src/auth/auth.router.ts → [NEW] src/auth/auth.service.ts
Implementar JWT HS256 (simplificado sobre RS256 para desarrollo más rápido):
- Login con usuario hardcoded en `.env` (admin/password configurable)
- Generación de JWT con `jsonwebtoken`
- Refresh token
- `verifyToken` middleware exportable

#### [NEW] src/middleware/auth.middleware.ts
Middleware `requireAuth` que valida JWT en `Authorization: Bearer <token>`.

#### [NEW] src/middleware/error.middleware.ts
Handler global de errores Express (404 + 500).

#### [MODIFY] src/agents/agents.ts
Enriquecer los prompts de cada agente con instrucciones más específicas del negocio de vehículos. El agente de Ventas consultará WooCommerce para cotizaciones.

---

### FASE B — Backend: WooCommerce integrado en agente Ventas

#### [NEW] src/woocommerce/woocommerce.service.ts
Cliente desacoplado para consultar productos WooCommerce con cache simple en memoria.

#### [MODIFY] src/agents/agents.ts (VentasAgent)
El `VentasAgent` consulta `WooCommerceService.searchProducts()` antes de generar su respuesta con Gemini.

---

### FASE C — Frontend: Dashboard CRM completo

El frontend actual solo tiene una pantalla de QR básica. Se construirá un dashboard completo multi-página:

#### Páginas nuevas

| Ruta | Descripción |
|---|---|
| `/` | Login page |
| `/dashboard` | Resumen: métricas, últimos leads, estado WA |
| `/contacts` | Lista de contactos + búsqueda |
| `/contacts/[id]` | Detalle del contacto + historial mensajes |
| `/pipeline` | Kanban visual de leads por etapa |
| `/whatsapp` | Estado QR, logs de mensajes recientes |

#### Componentes nuevos

- `Layout.astro` — Sidebar de navegación, header con estado WA
- `KanbanBoard.astro` — Pipeline visual drag-and-drop por etapas
- `ContactCard.astro` — Tarjeta de contacto con badge de módulo
- `MessageBubble.astro` — Burbuja de mensaje (in/out con timestamp)
- `StatCard.astro` — Tarjeta de métrica para el dashboard

#### Estilos
- CSS variables global (modo oscuro, colores WhatsApp green)
- Layout sidebar + contenido principal
- Diseño moderno glassmorphism con animaciones

---

## Open Questions

> [!IMPORTANT]
> **Auth**: ¿Usamos JWT HS256 (más simple, un solo secreto en `.env`) o JWT RS256 (par de claves asimétricas, más seguro)? El `objetivo.md` dice RS256, pero para desarrollo local HS256 es más práctico. **Recomendación: HS256 para development, configuración preparada para RS256 en producción.**

> [!IMPORTANT]
> **Usuarios del CRM**: ¿El sistema de login solo tendrá un admin hardcoded en `.env`, o se necesita gestión de múltiples usuarios (tabla `User` en Prisma)? Para simplificar la primera versión, propongo **un solo admin por `.env`**, sin tabla de usuarios.

> [!IMPORTANT]
> **WooCommerce**: ¿Ya tienes una tienda WooCommerce real configurada? Si no, los agentes de ventas usarán un **catálogo de productos de ejemplo** hardcoded para poder probar el flujo completo.

> [!NOTE]
> **whatsapp-web.js en Windows**: Puppeteer puede tener problemas con Chromium en Windows. Si el QR no funciona, configuraremos `executablePath` para apuntar a Chrome instalado.

---

## Orden de Ejecución

1. **Backend core** — message handler + auth JWT + middlewares
2. **WhatsApp router** — endpoints reales de status/QR/send
3. **Agentes mejorados** — prompts ricos + integración WooCommerce
4. **Frontend login + dashboard** — layout, métricas, pipeline Kanban
5. **Frontend contactos + detalle** — historial de mensajes
6. **Verificación end-to-end** — probar el flujo completo

---

## Verification Plan

### Backend
- `npm run dev` sin errores de compilación
- `GET /api/v1/health` → `{ status: "ok" }`
- `POST /api/v1/auth/login` → JWT válido
- `GET /api/v1/contacts` con token → lista de contactos

### Frontend
- `npm run dev` en `/apps/frontend`
- Navegar a cada ruta y verificar que carga correctamente
- Verificar pipeline Kanban renderiza leads

### Integración
- Mensaje entrante WA → aparece en `/contacts/:id` con historial
- Lead creado automáticamente con la etapa correcta
