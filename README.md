# ERP Cárnicos y Lácteos — Guía completa del proyecto

Sistema ERP para producción, inventario, ventas y tienda online de productos cárnicos y lácteos.

**Stack:** Django 5 + DRF + PostgreSQL + JWT · React 19 + Vite + Tailwind 4 + pnpm

---

## Índice

1. [Inicio rápido](#inicio-rápido)
2. [Raíz del proyecto](#raíz-del-proyecto)
3. [Backend — configuración](#backend--configuración)
4. [Backend — código compartido (`shared/`)](#backend--código-compartido-shared)
5. [Backend — apps Django (patrón común)](#backend--apps-django-patrón-común)
6. [Backend — cada módulo](#backend--cada-módulo)
7. [Backend — Docker, scripts y tests](#backend--docker-scripts-y-tests)
8. [Frontend — configuración](#frontend--configuración)
9. [Frontend — núcleo de la app](#frontend--núcleo-de-la-app)
10. [Frontend — módulos de pantalla](#frontend--módulos-de-pantalla)
11. [Frontend — componentes](#frontend--componentes)
12. [Frontend — servicios, estado y tipos](#frontend--servicios-estado-y-tipos)
13. [Flujos importantes](#flujos-importantes)

---

## Inicio rápido

```powershell
# 1. Variables de entorno
cp .env.example .env

# 2. Backend (Docker)
docker compose up -d

# 3. Frontend (solo pnpm, no npm)
cd frontend
pnpm install
pnpm dev
```

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| API | http://localhost:8001/api |
| Swagger | http://localhost:8001/api/docs/ |
| Nginx | http://localhost:8080 |
| Admin Django | http://localhost:8001/admin/ |

**Login inicial:** `admin` / `Admin123!`

**Registro:** http://localhost:5173/register — requiere aprobación del admin en **Solicitudes**.

---

## Raíz del proyecto

| Archivo | Qué hace |
|---------|----------|
| `.env` | Variables del backend (DB, Redis, JWT, CORS, `SECRET_KEY`). No subir a git si tiene secretos. |
| `.env.example` | Plantilla de variables. Copiar a `.env` y completar. |
| `docker-compose.yml` | Orquesta PostgreSQL, Redis, backend Django, Celery, Celery Beat y Nginx para desarrollo. |
| `docker-compose.prod.yml` | Variante para despliegue en producción (configuración endurecida). |
| `README.md` | Este documento. |
| `docs/TESTING.md` | Plan de pruebas por niveles (infra, API, registro, tienda, ERP). |
| `carnicos.txt` | Notas o requisitos del proyecto (documento auxiliar). |
| `stitch_meat_dairy_erp_system.zip` | Export/backup de diseño UI (referencia visual). |

---

## Backend — configuración

Carpeta: `backend/config/`

| Archivo | Qué hace |
|---------|----------|
| `manage.py` | Punto de entrada CLI de Django (`migrate`, `runserver`, `seed_initial_data`, etc.). |
| `config/__init__.py` | Marca el paquete; importa Celery al arrancar Django. |
| `config/urls.py` | **Rutas principales:** monta `/api/auth/`, `/api/users/`, `/api/proveedores/`, … y Swagger. Sirve `/media/` en DEBUG. |
| `config/wsgi.py` | Interfaz WSGI para Gunicorn en producción. |
| `config/asgi.py` | Interfaz ASGI (websockets/async si se usa en el futuro). |
| `config/celery.py` | Configuración de Celery (cola de tareas con Redis). |
| `config/settings/base.py` | Settings compartidos: apps instaladas, DRF, JWT, PostgreSQL, Redis, CORS, media/static, logging. |
| `config/settings/development.py` | Settings de desarrollo (`DEBUG=True`). |
| `config/settings/production.py` | Settings de producción (seguridad, hosts, etc.). |
| `config/settings/testing.py` | Settings para pytest (base de datos de prueba). |

---

## Backend — código compartido (`shared/`)

Código reutilizado por todas las apps.

| Archivo | Qué hace |
|---------|----------|
| `shared/models/base.py` | Modelo base `BaseModel`: UUID, `created_at`, `updated_at`, **soft delete** (`is_deleted`). |
| `shared/models/__init__.py` | Exporta modelos base. |
| `shared/serializers/user_mixin.py` | Serializa usuario Django a JSON con grupos, permisos y `approval_status` (para login/profile). |
| `shared/exceptions/handlers.py` | Manejador global de errores API (formato JSON uniforme). |
| `shared/permissions/django_model.py` | Permisos DRF basados en permisos nativos de Django. |
| `shared/utils/pagination.py` | Paginación estándar de listados API (`page`, `page_size`). |
| `shared/utils/viewset_mixins.py` | Mixin para ViewSets: auditoría automática en create/update/delete. |

---

## Backend — apps Django (patrón común)

Cada módulo en `backend/apps/<nombre>/` sigue esta estructura:

| Archivo típico | Qué hace |
|----------------|----------|
| `apps.py` | Registra la app en Django (`AppConfig`). |
| `models.py` | Tablas de base de datos (entidades del negocio). |
| `serializers.py` | Convierte modelos ↔ JSON para la API REST. |
| `views.py` | Lógica HTTP: listar, crear, editar, borrar, acciones custom. |
| `urls.py` | Rutas del módulo (ej. `/api/proveedores/`). |
| `admin.py` | (Opcional) Registro en panel admin de Django. |
| `migrations/` | Historial de cambios de esquema en PostgreSQL. Cada `.py` es un paso de migración. |
| `migrations/__init__.py` | Marca el paquete de migraciones. |

---

## Backend — cada módulo

### `apps/authentication/` — Login, registro, JWT

| Archivo | Qué hace |
|---------|----------|
| `views.py` | `LoginView`, `RegisterView`, `LogoutView`, `ProfileView`, `ChangePasswordView`, refresh JWT. El registro crea usuario **inactivo** pendiente de aprobación. |
| `urls.py` | `/api/auth/login/`, `/register/`, `/refresh/`, `/logout/`, `/profile/`, `/change-password/`. |
| `apps.py` | Config de la app de autenticación. |

### `apps/users/` — Usuarios, grupos, aprobación de registros

| Archivo | Qué hace |
|---------|----------|
| `models.py` | `UserProfile`: estado de aprobación (`pending`, `approved`, `rejected`), motivo de rechazo, quién revisó. |
| `signals.py` | Crea perfil automáticamente al crear un `User`. |
| `serializers.py` | `UserSerializer`, `RegisterSerializer`, `GroupSerializer`. |
| `views.py` | CRUD usuarios/grupos (solo admin). Acciones: `pending/`, `approve/`, `reject/`. |
| `urls.py` | `/api/users/users/`, `/api/users/groups/`. |
| `management/commands/seed_initial_data.py` | Comando `python manage.py seed_initial_data`: crea grupos, permisos y usuario `admin`. |

### `apps/proveedores/` — Proveedores de materia prima

| Archivo | Qué hace |
|---------|----------|
| `models.py` | Proveedor: razón social, NIT, contacto, estado activo/inactivo. |
| `views.py` | CRUD + soft delete. |
| `urls.py` | `/api/proveedores/`. |
| `admin.py` | Admin Django para proveedores. |

### `apps/clientes/` — Clientes

| Archivo | Qué hace |
|---------|----------|
| `models.py` | Cliente: datos fiscales, límite de crédito, saldo pendiente. |
| `views.py` | CRUD + endpoint `estado_cuenta/`. |
| `urls.py` | `/api/clientes/`. |

### `apps/materias_primas/` — Materias primas (cárnicos/lácteos)

| Archivo | Qué hace |
|---------|----------|
| `models.py` | Materia prima: lote, stock, vencimiento, proveedor, alertas de stock bajo. |
| `views.py` | CRUD + `alertas_stock/`. |
| `urls.py` | `/api/materias-primas/`. |

### `apps/inventario/` — Movimientos de inventario (Kardex)

| Archivo | Qué hace |
|---------|----------|
| `models.py` | Movimiento: entrada, salida, ajuste; vinculado a materia prima. |
| `views.py` | CRUD + `kardex/` por producto. |
| `urls.py` | `/api/inventario/movimientos/`. |

### `apps/produccion/` — Producción

| Archivo | Qué hace |
|---------|----------|
| `models.py` | Fórmulas de producción y órdenes (estados, rendimiento, ingredientes). |
| `views.py` | CRUD fórmulas/órdenes + `iniciar/`, `completar/`. |
| `urls.py` | `/api/produccion/formulas/`, `/api/produccion/ordenes/`. |

### `apps/productos/` — Productos terminados y catálogo

| Archivo | Qué hace |
|---------|----------|
| `models.py` | Producto terminado: lote, stock, precio, **imagen**, **visible_catalogo**, estado. |
| `views.py` | CRUD + subir imagen + `toggle-catalogo/`, `quitar-imagen/`. |
| `serializers.py` | Incluye `imagen_url` para el frontend. |
| `urls.py` | `/api/productos/`. |
| `migrations/0002_...` | Añade `visible_catalogo` e `imagen`. |

### `apps/ventas/` — Ventas y pedidos

| Archivo | Qué hace |
|---------|----------|
| `models.py` | Venta, detalle, `VentaService.confirmar_venta()` (descuenta stock, crea CxC). Campo `metodo_pago`. |
| `views.py` | CRUD + `confirmar/`. |
| `urls.py` | `/api/ventas/`. |
| `migrations/0002_...` | Añade `metodo_pago` (efectivo, tarjeta, PayPal, etc.). |

### `apps/distribucion/` — Distribución y logística

| Archivo | Qué hace |
|---------|----------|
| `models.py` | Pedidos de distribución, vehículos, estados de entrega. |
| `views.py` | CRUD pedidos y vehículos. |
| `urls.py` | `/api/distribucion/pedidos/`, `/vehiculos/`. |

### `apps/cuentas_cobrar/` — Cuentas por cobrar

| Archivo | Qué hace |
|---------|----------|
| `models.py` | Cuenta por cobrar vinculada a venta/cliente. |
| `views.py` | Listado + `abonar/` (registrar pago parcial/total). |
| `urls.py` | `/api/cuentas-cobrar/`. |

### `apps/cuentas_pagar/` — Cuentas por pagar

| Archivo | Qué hace |
|---------|----------|
| `models.py` | Facturas de proveedores por pagar. |
| `views.py` | Listado + `pagar/`. |
| `urls.py` | `/api/cuentas-pagar/facturas/`. |

### `apps/finanzas/` — Finanzas

| Archivo | Qué hace |
|---------|----------|
| `models.py` | Movimientos financieros (ingresos/egresos). |
| `views.py` | Dashboard y movimientos. |
| `urls.py` | `/api/finanzas/dashboard/`, `/movimientos/`. |

### `apps/trazabilidad/` — Trazabilidad de lotes

| Archivo | Qué hace |
|---------|----------|
| `services.py` | Consultas de trazabilidad por lote, producto o cliente. |
| `views.py` | Endpoints de búsqueda. |
| `urls.py` | `/api/trazabilidad/lote/`, `/producto/{id}/`, `/cliente/{id}/`. |

### `apps/reportes/` — Reportes y dashboard

| Archivo | Qué hace |
|---------|----------|
| `services.py` | Agregaciones: KPIs del dashboard, exportaciones. |
| `views.py` | `/api/reportes/dashboard/` y reportes por tipo. |
| `tasks.py` | Tareas Celery para reportes pesados (async). |
| `urls.py` | `/api/reportes/`. |

### `apps/auditoria/` — Auditoría del sistema

| Archivo | Qué hace |
|---------|----------|
| `models.py` | Log de acciones: quién, qué, cuándo, recurso. |
| `middleware.py` | Captura usuario y request para auditoría. |
| `signals.py` | Registra cambios en modelos automáticamente. |
| `services.py` | Lógica de escritura de logs. |
| `views.py` | `/api/auditoria/logs/`. |
| `admin.py` | Ver logs en admin Django. |

---

## Backend — Docker, scripts y tests

| Archivo | Qué hace |
|---------|----------|
| `docker/Dockerfile` | Imagen Python 3.12 con dependencias y Gunicorn. |
| `docker/entrypoint.sh` | Al arrancar: espera PostgreSQL, `migrate`, `seed_initial_data`, `collectstatic`. |
| `docker/nginx.conf` | Nginx: proxy al backend, sirve `/static/` y `/media/`. |
| `requirements/base.txt` | Dependencias Python core (Django, DRF, JWT, Pillow, etc.). |
| `requirements/development.txt` | Deps de desarrollo (pytest, etc.). |
| `requirements/production.txt` | Deps de producción (incluye base). |
| `scripts/backup_db.sh` | Script de respaldo de PostgreSQL. |
| `scripts/run_seed.py` | Ejecuta seed desde script externo. |
| `scripts/seed_initial_data.py` | Copia/alternativa del comando seed. |
| `pytest.ini` | Config pytest: cobertura mínima 80%, settings de testing. |
| `tests/conftest.py` | Fixtures: `api_client`, `admin_user`, `auth_client`. |
| `tests/test_authentication.py` | Tests login, registro, perfil, usuario pendiente. |
| `tests/test_users.py` | Tests usuarios, aprobar/rechazar solicitudes. |
| `tests/test_proveedores.py` | Tests CRUD proveedores. |
| `tests/test_materias_primas.py` | Tests materias primas. |
| `tests/test_integration.py` | Tests clientes, inventario, ventas, dashboard. |
| `tests/test_auditoria.py` | Tests logs de auditoría. |
| `logs/django.log` | Archivo de log generado en runtime. |

---

## Frontend — configuración

Carpeta: `frontend/`

| Archivo | Qué hace |
|---------|----------|
| `package.json` | Dependencias y scripts (`pnpm dev`, `build`, `lint`). Define `packageManager: pnpm`. |
| `pnpm-lock.yaml` | Versiones exactas bloqueadas de dependencias. |
| `pnpm-workspace.yaml` | Config del workspace pnpm. |
| `.npmrc` | Fuerza uso de pnpm; verificación de integridad del store. |
| `vite.config.ts` | Bundler Vite: plugin React, Tailwind, alias `@` → `src/`. |
| `tsconfig.json` | TypeScript: paths `@/*`, JSX, strict checks. |
| `eslint.config.js` | Reglas ESLint para calidad de código. |
| `.prettierrc` | Formato automático de código. |
| `index.html` | HTML base; monta React en `#root`. |
| `.env` | `VITE_API_URL=http://localhost:8001/api` |
| `.env.example` | Plantilla de variables del frontend. |
| `README.md` | Guía específica del frontend. |

---

## Frontend — núcleo de la app

| Archivo | Qué hace |
|---------|----------|
| `src/main.tsx` | Punto de entrada: monta React en el DOM con `StrictMode`. |
| `src/App.tsx` | Reexporta `AppProviders` (legacy). |
| `src/index.css` | Estilos globales + Tailwind 4 + fuentes. |
| `src/vite-env.d.ts` | Tipos para `import.meta.env` de Vite. |

### `src/app/` — Arquitectura de la aplicación

| Archivo | Qué hace |
|---------|----------|
| `app/providers/AppProviders.tsx` | Envuelve la app: React Query + React Router. |
| `app/router/index.tsx` | **Todas las rutas:** login, register, dashboard, tienda, módulos ERP. |
| `app/layouts/AppLayout.tsx` | Layout principal: **sidebar fijo**, header, avatar, carrito, logout. |
| `app/layouts/AuthLayout.tsx` | Layout pantallas públicas (login/registro) sin sidebar. |
| `app/guards/PrivateRoute.tsx` | `PrivateRoute`: exige JWT. `ProtectedRoute`: exige permiso Django. |
| `app/config/menu.config.ts` | Ítems del menú lateral (ruta, icono, permiso requerido). |
| `app/config/env.ts` | Lee `VITE_API_URL` del entorno. |
| `app/permissions/index.ts` | `hasPermission()`, `hasGroup()` — evalúa permisos Django en UI. |
| `hooks/useAuth.tsx` | Bootstrap de sesión: hidrata Zustand, carga perfil, loaders en rutas privadas. |

---

## Frontend — módulos de pantalla

Cada carpeta en `src/modules/` es una **pantalla o flujo** de negocio.

| Archivo | Qué hace |
|---------|----------|
| `modules/auth/LoginPage.tsx` | Formulario de inicio de sesión JWT. |
| `modules/auth/RegisterPage.tsx` | Registro público; cuenta queda pendiente de aprobación. |
| `modules/dashboard/DashboardPage.tsx` | Dashboard con KPIs desde `/api/reportes/dashboard/`. |
| `modules/perfil/PerfilPage.tsx` | Foto de perfil y datos del usuario logueado. |
| `modules/proveedores/ProveedoresPage.tsx` | CRUD proveedores conectado a API (referencia de módulo completo). |
| `modules/usuarios/UsuariosPage.tsx` | Gestión de usuarios (vista legacy + permisos). |
| `modules/usuarios/SolicitudesPage.tsx` | Admin aprueba/rechaza registros pendientes. |
| `modules/grupos/GruposPage.tsx` | Grupos y permisos Django. |
| `modules/clientes/ClientesPage.tsx` | Clientes (vista legacy, migración pendiente a API). |
| `modules/materias-primas/MateriasPrimasPage.tsx` | Materias primas (legacy). |
| `modules/inventario/InventarioPage.tsx` | Inventario/Kardex (legacy). |
| `modules/produccion/ProduccionPage.tsx` | Órdenes de producción (legacy). |
| `modules/productos/ProductosPage.tsx` | Productos terminados internos (legacy). |
| `modules/ventas/VentasPage.tsx` | Ventas internas (legacy). |
| `modules/distribucion/DistribucionPage.tsx` | Distribución (legacy). |
| `modules/cuentas-cobrar/CuentasCobrarPage.tsx` | CxC (legacy). |
| `modules/cuentas-pagar/CuentasPagarPage.tsx` | CxP (legacy). |
| `modules/finanzas/FinanzasPage.tsx` | Finanzas (legacy). |
| `modules/trazabilidad/TrazabilidadPage.tsx` | Trazabilidad (legacy). |
| `modules/reportes/ReportesPage.tsx` | Reportes (legacy). |
| `modules/configuracion/ConfiguracionPage.tsx` | Config técnica / pruebas API (legacy). |

### Tienda online (`modules/tienda/`)

| Archivo | Qué hace |
|---------|----------|
| `tienda/CatalogoPage.tsx` | Catálogo público: productos visibles con imagen y precio. |
| `tienda/CarritoPage.tsx` | Carrito de compras con cantidades. |
| `tienda/CheckoutPage.tsx` | Pago: efectivo, transferencia, tarjeta, PayPal, Nequi, PSE, crédito. |
| `tienda/MisPedidosPage.tsx` | Historial de pedidos del cliente. |
| `tienda/PedidoDetallePage.tsx` | Detalle de pedido + pantalla "Venta registrada". |
| `tienda/GestionCatalogoPage.tsx` | Admin: crear/editar productos, imagen, visible/oculto en catálogo. |
| `tienda/utils.ts` | Helpers: formato dinero, imágenes fallback, métodos de pago, estados. |

---

## Frontend — componentes

### UI reutilizable (`components/ui/`)

| Archivo | Qué hace |
|---------|----------|
| `ui/Alert.tsx` | Mensajes info/success/warning/error. |
| `ui/Badge.tsx` | Etiquetas de estado (activo, pendiente, etc.). |
| `ui/Card.tsx` | Tarjeta con título y contenido. |
| `ui/Loader.tsx` | Spinner de carga. |
| `ui/EmptyState.tsx` | Estado vacío en listas. |
| `ui/UserAvatar.tsx` | Avatar con foto de perfil o icono por defecto. |

### Componentes de negocio (`components/`)

| Archivo | Qué hace |
|---------|----------|
| `DataTable.tsx` | Tabla con búsqueda, orden y paginación local. |
| `Modal.tsx` | Diálogo modal reutilizable. |
| `permissions/Can.tsx` | Muestra hijos solo si el usuario tiene permiso/grupo. |
| `Permissions.tsx` | Puente permisos JWT + store legacy de demo. |

### Vistas legacy (`components/*View.tsx`)

Pantallas de demostración con **datos mock** en Zustand. Se reutilizan visualmente mientras se migran módulo a módulo a la API real.

| Archivo | Qué hace |
|---------|----------|
| `DashboardView.tsx` | Dashboard demo con gráficos mock. |
| `SuppliersView.tsx` | Vista antigua de proveedores. |
| `ClientsView.tsx` | Vista antigua de clientes. |
| `RawMaterialsView.tsx` | Materias primas mock. |
| `InventoryView.tsx` | Inventario mock. |
| `ProductionView.tsx` | Producción mock. |
| `FinishedProductsView.tsx` | Productos terminados mock. |
| `SalesView.tsx` | Ventas mock con carrito local. |
| `DistributionView.tsx` | Distribución mock. |
| `AccountsReceivableView.tsx` | CxC mock. |
| `AccountsPayableView.tsx` | CxP mock. |
| `FinanceView.tsx` | Finanzas mock. |
| `TraceabilityView.tsx` | Trazabilidad mock. |
| `ReportsView.tsx` | Reportes mock. |
| `UsersView.tsx` | Usuarios mock con avatares de demo. |
| `ConfigView.tsx` | Pruebas de conexión API/JWT. |

---

## Frontend — servicios, estado y tipos

### Servicios (`services/`)

| Archivo | Qué hace |
|---------|----------|
| `api.ts` | Cliente Axios: base URL, tokens JWT en localStorage, refresh automático en 401. |
| `auth.service.ts` | `login`, `logout`, `register`, `profile`, `changePassword`. |
| `users.service.ts` | CRUD usuarios + `pending`, `approve`, `reject`. |
| `index.ts` | Servicios de todos los módulos ERP: proveedores, clientes, productos, ventas, etc. |

### Estado global (`store/`)

| Archivo | Qué hace |
|---------|----------|
| `auth-ui.store.ts` | Usuario logueado, `isAuthenticated`, hidratación persistida en localStorage. |
| `cart.store.ts` | Carrito de la tienda (items, cantidades, total). Persistido. |
| `profile.store.ts` | Fotos de perfil por userId (base64 en localStorage). |
| `legacy-erp.store.ts` | Datos mock del ERP demo (clientes, ventas, inventario ficticio). |
| `index.ts` | Reexporta stores. |

### Tipos TypeScript (`types/`)

| Archivo | Qué hace |
|---------|----------|
| `auth.ts` | `AuthUser`, `LoginCredentials`, `LoginResponse`. |
| `register.ts` | Payload y respuesta del registro. |
| `api.ts` | `PaginatedResponse`, `ApiError`. |
| `index.ts` | Tipos ERP: `Proveedor`, `Cliente`, `DjangoUser`, etc. |
| `tienda.ts` | `ProductoTerminado`, `Venta`, detalles de pedido. |
| `legacy-erp.types.ts` | Tipos del store mock antiguo (`Supplier`, `Client`, etc.). |

---

## Flujos importantes

### 1. Registro con aprobación

```
Usuario → /register → POST /api/auth/register/ → is_active=false, approval_status=pending
Admin → /usuarios/solicitudes → POST .../approve/ → usuario activo → puede hacer login
```

### 2. Compra en tienda

```
Gestión Catálogo (admin) → producto visible + imagen
Catálogo → Carrito → Checkout (método pago) → POST /api/ventas/ → confirmar → Mis Pedidos
```

### 3. Permisos en pantalla

```
Login → JWT + lista de permisos Django
menu.config.ts filtra ítems → Can / ProtectedRoute ocultan botones y rutas
```

### 4. Arranque con Docker

```
docker compose up → postgres + redis healthy → entrypoint.sh migrate + seed → gunicorn :8000
Nginx :8080 → proxy API y archivos estáticos/media
```

---

## Convenciones del proyecto

- **Backend:** cada app Django = un dominio de negocio; API bajo `/api/<modulo>/`.
- **Frontend:** `modules/` = pantallas; `components/` = UI reutilizable o legacy; `services/` = llamadas HTTP.
- **Permisos:** siempre los nativos de Django (`app_label.action_model`).
- **Paquetes frontend:** solo **pnpm** (`pnpm install`, `pnpm dev`).
- **Migraciones:** no editar a mano; usar `python manage.py makemigrations`.

---

## Documentación adicional

- [backend/README.md](backend/README.md) — detalle API y endpoints
- [frontend/README.md](frontend/README.md) — desarrollo frontend
- [docs/TESTING.md](docs/TESTING.md) — plan de pruebas por niveles
