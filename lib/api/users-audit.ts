import { serverFetch } from '@/lib/api/client'
import { AccessLog, AuditLog, PaginatedResponse, Role, User } from '@/types/api'

export interface UserFilters {
  role?: string
  is_active?: boolean | string
  q?: string
  page?: number
  per_page?: number
}

export interface AuditFilters {
  event?: string
  user_id?: number | string
  from?: string
  to?: string
  page?: number
  per_page?: number
}

/**
 * Listado de usuarios con filtros y roles.
 */
export async function getUsers(filters: UserFilters = {}): Promise<PaginatedResponse<User>> {
  return serverFetch<PaginatedResponse<User>>('/users', {
    params: filters as Record<string, string | number | boolean>,
  })
}

/**
 * Listado de roles del sistema con sus permisos.
 */
export async function getRoles(): Promise<{ data: Role[] }> {
  return serverFetch<{ data: Role[] }>('/roles')
}

/**
 * Libro de auditoría de datos de negocio (audit_logs).
 */
export async function getAuditLogs(filters: AuditFilters = {}): Promise<PaginatedResponse<AuditLog>> {
  return serverFetch<PaginatedResponse<AuditLog>>('/audit-logs', {
    params: filters as Record<string, string | number | boolean>,
  })
}

/**
 * Libro de accesos e inicios de sesión (access_logs).
 */
export async function getAccessLogs(filters: AuditFilters = {}): Promise<PaginatedResponse<AccessLog>> {
  return serverFetch<PaginatedResponse<AccessLog>>('/access-logs', {
    params: filters as Record<string, string | number | boolean>,
  })
}
