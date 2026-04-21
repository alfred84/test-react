export const ENDPOINTS = {
  auth: {
    login: 'api/Authenticate/login',
    register: 'api/Authenticate/register',
  },
  clients: {
    list: 'api/Cliente/Listado',
    get: (id: string): string => `api/Cliente/Obtener/${encodeURIComponent(id)}`,
    create: 'api/Cliente/Crear',
    update: 'api/Cliente/Actualizar',
    delete: (id: string): string => `api/Cliente/Eliminar/${encodeURIComponent(id)}`,
  },
  interests: {
    list: 'api/Intereses/Listado',
  },
} as const;
