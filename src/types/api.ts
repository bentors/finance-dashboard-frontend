// ── Enums ──────────────────────────────────────────────

export type CategoryType = 'INCOME' | 'EXPENSE'

// ── Auth ───────────────────────────────────────────────

export interface LoginDTO {
  email: string
  password: string
}

export interface RegisterDTO {
  name: string
  email: string
  password: string
}

export interface TokenResponseDTO {
  name: string
  token: string
}

// ── Category ───────────────────────────────────────────

export interface CategoryRequestDTO {
  name: string
  type: CategoryType
}

export interface CategoryResponseDTO {
  id: string
  name: string
  type: CategoryType
}

// ── Transaction ────────────────────────────────────────

export interface TransactionRequestDTO {
  description: string
  amount: number
  transactionDate: string   // LocalDate → "YYYY-MM-DD"
  categoryId: string
}

export interface TransactionResponseDTO {
  id: string
  description: string
  amount: number
  transactionDate: string
  category: CategoryResponseDTO
}

// ── Dashboard ──────────────────────────────────────────

export interface DashboardSummaryDTO {
  totalIncome: number
  totalExpense: number
  balance: number
}

export interface MonthlySummaryDTO {
  month: number             // 1–12
  income: number
  expense: number
}

// ── Paginação ──────────────────────────────────────────

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number            // página atual (0-indexed)
  size: number
  first: boolean
  last: boolean
}