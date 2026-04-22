# test-react — Sistema de gestión de clientes

SPA en **React 17 + TypeScript** para la administración de clientes de
la prueba técnica. Implementa autenticación con JWT, listado con
filtros, mantenimiento completo (alta/edición/borrado con confirmación),
y cumple de forma estricta con los requisitos del enunciado.

El proyecto está estructurado con **Clean Architecture**, tipado
estricto (`strict`, `noUncheckedIndexedAccess`,
`exactOptionalPropertyTypes`), inyección de dependencias y
cobertura TDD sobre cada capa.

---

## Tabla de contenido

- [Stack](#stack)
- [Estructura de carpetas](#estructura-de-carpetas)
- [Requisitos previos](#requisitos-previos)
- [Puesta en marcha](#puesta-en-marcha)
- [Variables de entorno](#variables-de-entorno)
- [Scripts de npm](#scripts-de-npm)
- [Testing](#testing)
- [Arquitectura](#arquitectura)
- [Convenciones de código](#convenciones-de-código)
- [Deploy en Vercel](#deploy-en-vercel)
- [Credenciales y endpoint](#credenciales-y-endpoint)

---

## Stack

| Área                 | Tecnología                           |
| -------------------- | ------------------------------------ |
| Framework            | React 17 (CRA + CRACO)               |
| Lenguaje             | TypeScript 4.9 (strict)              |
| UI                   | Material UI v4 (+ `@material-ui/lab`) |
| Routing              | React Router DOM v5                  |
| HTTP                 | Axios 1.x con interceptors           |
| Formularios          | React Hook Form 7.51                 |
| Estado               | Context API + `useReducer` tipado    |
| Tests                | Jest + Testing Library + `axios-mock-adapter` |
| Calidad              | ESLint + Prettier + `tsc --noEmit`   |

---

## Estructura de carpetas

```
src/
├── app/                      # Composition root (AppProviders, DI)
├── config/                   # ENV resolver tipado
├── domain/                   # Entidades, errores y contratos (puertos)
│   ├── entities/
│   ├── errors/
│   └── repositories/         # IAuthRepository, IClientRepository, ...
├── infrastructure/           # Adaptadores (Axios, LocalStorage, mappers)
│   ├── http/                 # axiosInstance + HttpError
│   ├── mappers/              # DTO <-> domain
│   ├── repositories/         # *Http implementations
│   └── storage/              # ITokenStorage (LocalStorage / InMemory)
├── presentation/
│   ├── components/           # Componentes reutilizables (ConfirmDialog, ...)
│   ├── features/             # Slices por feature (clients, ...)
│   ├── hooks/                # Hooks reutilizables (useLogout, ...)
│   ├── layouts/              # AuthLayout, AppShellLayout, navItems
│   ├── pages/                # Páginas (LoginPage, HomePage, ClientsListPage, ...)
│   ├── providers/            # Auth/Feedback/Repositories contexts
│   ├── routing/              # AppRouter, PrivateRoute, PublicOnlyRoute
│   ├── theme/                # Tema MUI ejecutivo
│   └── utils/                # domainErrorMessage, passwordRules, ...
├── shared/                   # Tipos utilitarios (Result, Nullable, ...)
└── testing/                  # Harnesses de test (mocks, renderers)
```

Cada capa depende únicamente de capas más internas:

```
presentation → application / domain ← infrastructure
```

---

## Requisitos previos

- **Node 20.20.2** (ver `.nvmrc`, campo `engines` en `package.json`).
  Recomendado: `nvm use`.
- npm 10+.

---

## Puesta en marcha

```bash
# 1. Clonar
git clone <REPO_URL> test-react
cd test-react

# 2. Seleccionar la versión de Node
nvm use

# 3. Instalar dependencias
npm install --legacy-peer-deps

# 4. Crear el archivo de entorno local
cp .env.example .env

# 5. Arrancar en modo desarrollo
npm start
```

La app queda disponible en <http://localhost:3000>. El servidor de
desarrollo hace *hot reload* de todo `src/`.

> `--legacy-peer-deps` es necesario porque algunos plugins de
> `eslint-import-resolver-typescript` expresan peers con rangos más
> modernos que los que CRA impone.

---

## Variables de entorno

| Variable                 | Obligatoria | Descripción                                             |
| ------------------------ | ----------- | ------------------------------------------------------- |
| `REACT_APP_API_BASE_URL` | Sí          | Base del API. Por defecto `https://pruebareactjs.test-class.com/Api/`. |

`src/config/env.ts` resuelve y tipa estas variables; si falta alguna
obligatoria el build falla de forma explícita, evitando *runtime
errors* silenciosos.

---

## Scripts de npm

| Script              | Descripción                                                     |
| ------------------- | --------------------------------------------------------------- |
| `npm start`         | Servidor de desarrollo con CRACO.                               |
| `npm run build`     | Build productivo (minificado, hashing de assets).               |
| `npm test`          | Jest en modo watch (interactivo).                               |
| `npm run test:ci`   | Jest con `CI=true` (una sola pasada, salida no interactiva).    |
| `npm run typecheck` | `tsc --noEmit` con la configuración estricta del proyecto.      |
| `npm run lint`      | ESLint + Prettier sobre `src/**/*.{ts,tsx}`.                    |
| `npm run lint:fix`  | Igual que `lint` aplicando autofixes.                           |
| `npm run format`    | Prettier write sobre todo `src/`.                               |
| `npm run format:check` | Prettier check (útil en CI).                                 |

---

## Testing

- Framework: **Jest + React Testing Library + `@testing-library/user-event`**.
- Adaptador HTTP: **`axios-mock-adapter`** (se probó MSW pero resultó
  incompatible con Axios 1.x en jsdom).
- Cada repositorio, mapper, hook y página tiene tests dedicados:
  - `*.test.ts` — utilidades, reducers, mappers, validadores.
  - `*.test.tsx` — componentes, páginas y hooks con render.
- Utilidades de test centralizadas en `src/testing/`:
  - `renderWithProviders` — monta el stack completo (Router + Providers + Theme + Feedback).
  - `buildMockRepositories` — mocks tipados de los repositorios de dominio.
  - `InMemoryTokenStorage` — `ITokenStorage` en memoria para seedear sesiones.

Correr la suite completa:

```bash
npm run test:ci
```

---

## Arquitectura

### Inyección de dependencias

`AppProviders` actúa como *composition root*: instancia el cliente
HTTP con los interceptors (JWT, 401 → logout), construye las
implementaciones `*RepositoryHttp` y las publica vía
`RepositoriesContext`. Los tests intercambian este árbol pasando
`repositoriesOverride` sin tocar el resto de la app.

### Estado de autenticación

`authReducer` implementa una máquina de estados tipada (`idle`,
`authenticating`, `authenticated`, `unauthenticated`) con acciones
discriminadas. La sesión se persiste/rehidrata desde
`LocalStorageTokenStorage` en un `useEffect` único — la identidad del
storage se congela a nivel módulo para evitar bucles infinitos.

### Interceptors Axios

- **Request:** lee el token vigente desde un `ref` (no invalida la
  instancia Axios en cada login).
- **Response:** mapea `AxiosError` a `DomainError` (`InvalidCredentialsError`,
  `NotFoundError`, `ValidationError`, `HttpError` genérico) y dispara
  `logout()` ante 401.

### Feature *clients*

- `useClients` — `useReducer` con estados `idle | loading | ready | deleting | error`,
  `pendingDeleteId` por fila y `search`/`remove` con identidades estables.
- `useInterests` — catálogo cacheado por instancia.
- `ClientForm` (modo `create | edit`) + `ClientFiltersForm` +
  `ClientsTable` + `ConfirmDialog` reutilizable.
- Páginas: `ClientsListPage`, `ClientCreatePage`, `ClientEditPage`
  (esta última con estados *loading / not-found / error* + navegación).

---

## Convenciones de código

- **Git flow:** trabajo en `master` con *conventional commits* atómicos
  (`feat(...)`, `fix(...)`, `chore(...)`, `refactor(...)`), uno por paso
  del plan.
- **Imports** ordenados y normalizados por ESLint (grupo externo,
  grupo interno por alias, tipos explícitos).
- **Prohibido `any`** y casts sin justificación. Cuando una API de
  librería lo obliga, se usan utility types propios (`Result<T, E>`,
  `Nullable<T>`).
- **SOLID:** cada repositorio depende de un *puerto* del dominio; las
  fábricas e interceptors aíslan adaptadores de la UI.
- **TDD:** los módulos críticos tienen tests escritos con el ciclo
  red-green-refactor (ver `clientsReducer.test.ts`, `authReducer.test.ts`,
  `clientMapper.test.ts`, `useClients.test.tsx`, etc.).

---

## Deploy en Vercel

El proyecto se despliega como SPA estática.

1. Instalar la CLI y autenticarse:

   ```bash
   npm i -g vercel
   vercel login
   ```

2. Desde la raíz del proyecto:

   ```bash
   vercel
   ```

   Configuraciones sugeridas:

   | Setting                    | Valor                         |
   | -------------------------- | ----------------------------- |
   | Framework preset           | *Create React App*            |
   | Install Command            | `npm install --legacy-peer-deps` |
   | Build Command              | `npm run build`               |
   | Output Directory           | `build`                       |
   | Node.js Version            | 20.x                          |

3. En *Project Settings → Environment Variables* agregar:

   - `REACT_APP_API_BASE_URL=https://pruebareactjs.test-class.com/Api/`

4. Deploy productivo:

   ```bash
   vercel --prod
   ```

El archivo `vercel.json` ya incluye el `rewrite` necesario para que
las rutas del cliente (`/clients`, `/clients/:id/edit`, ...) resuelvan
siempre a `index.html` sin que Vercel devuelva 404.

---

## Credenciales y endpoint

- **API base:** `https://pruebareactjs.test-class.com/Api/`
- **Usuario de prueba:** usar el endpoint `POST Acceso/Registrar` o las
  credenciales provistas por el examinador.

> Nunca se suben archivos `.env` reales al repositorio (`.gitignore`
> los excluye). Sólo `.env.example` sirve como plantilla.
