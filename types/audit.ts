export interface Role {
  id: number
  name: string
  permissions: string[]
  users_count?: number
  created_at: string
}

export interface AuditLog {
  id: number
  user_id: number | null
  user?: User
  event: string
  auditable_type: string
  auditable_id: number | null
  old_values: Record<string, any> | null
  new_values: Record<string, any> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface AccessLog {
  id: number
  user_id: number | null
  user?: User
  email_attempted: string | null
  event: 'login' | 'logout' | 'login_failed'
  ip_address: string | null
  user_agent: string | null
  created_at: string
}
