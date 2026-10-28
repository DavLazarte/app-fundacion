/**
 * Tipos de datos que coinciden 1 a 1 con los API Resources de Laravel.
 */

export interface User {
  id: number
  name: string
  email: string
  is_active: boolean
  last_login_at: string | null
  roles: string[]
  permissions: string[]
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface EntityType {
  id: number
  name: string
  is_active: boolean
  entities_count?: number
  created_at: string
  updated_at: string
}

export interface Entity {
  id: number
  entity_type_id: number
  entity_type?: EntityType
  group_id: number | null
  group?: Fund
  name: string
  document_number: string | null
  phone: string | null
  email: string | null
  address: string | null
  notes: string | null
  is_active: boolean
  movements_count?: number
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  name: string
  flow: 'ingreso' | 'egreso'
  is_active: boolean
  movements_count?: number
  created_at: string
  updated_at: string
}

export interface Fund {
  id: number
  name: string
  kind: 'general' | 'group'
  description: string | null
  is_active: boolean
  balance?: string
  created_at: string
  updated_at: string
}

export interface MovementAttachment {
  id: number
  movement_id: number
  original_name: string
  mime_type: string
  size_bytes: number
  sha256: string
  uploader?: User
  download_url: string
  created_at: string
}

export interface MovementVoid {
  reason: string
  voided_at: string
  voided_by?: User
}

export interface Movement {
  id: number
  type: 'ingreso' | 'egreso' | 'asignacion' | 'devolucion'
  movement_date: string
  amount: string
  concept: string
  reference: string | null
  note: string | null
  from_fund_id: number | null
  from_fund?: Fund
  to_fund_id: number | null
  to_fund?: Fund
  entity_id: number | null
  entity?: Entity
  category_id: number | null
  category?: Category
  creator?: User
  is_voided: boolean
  void?: MovementVoid | null
  attachments?: MovementAttachment[]
  created_at: string
}

export interface DashboardMetrics {
  general_available: string
  total_funds: string
  month: {
    incomes: string
    expenses: string
  }
  monthly: Array<{
    month: string
    ingresos: string
    egresos: string
  }>
  expenses_by_entity_type: Array<{
    type: string
    amount: string
  }>
  latest_movements: Movement[]
}

export interface ReportSummary {
  totals: {
    incomes: string
    expenses: string
    net: string
    count_total: number
    count_voided: number
  }
  by_category: Array<{
    category: string
    flow: string
    total: string
    count: number
  }>
  by_entity: Array<{
    entity_id: number
    entity_name: string
    entity_type: string
    total: string
    count: number
  }>
}

export interface PaginatedResponse<T> {
  data: T[]
  links?: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
  meta?: {
    current_page: number
    from: number | null
    last_page: number
    path: string
    per_page: number
    to: number | null
    total: number
  }
}

export interface ApiErrorResponse {
  message: string
  code?: string
  errors?: Record<string, string[]>
}

export * from './audit'
