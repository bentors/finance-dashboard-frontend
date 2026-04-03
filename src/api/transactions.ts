import api from './axios'
import type {
  TransactionRequestDTO,
  TransactionResponseDTO,
  DashboardSummaryDTO,
  MonthlySummaryDTO,
  CategoryType,
  Page,
} from '../types/api'

export async function getTransactions(page = 0, size = 10) {
  const response = await api.get<Page<TransactionResponseDTO>>('/transactions', {
    params: { page, size, sort: 'transactionDate,desc' },
  })
  return response.data
}

export async function getTransactionById(id: string) {
  const response = await api.get<TransactionResponseDTO>(`/transactions/${id}`)
  return response.data
}

export async function createTransaction(dto: TransactionRequestDTO) {
  const response = await api.post<TransactionResponseDTO>('/transactions', dto)
  return response.data
}

export async function updateTransaction(id: string, dto: TransactionRequestDTO) {
  const response = await api.put<TransactionResponseDTO>(`/transactions/${id}`, dto)
  return response.data
}

export async function deleteTransaction(id: string) {
  await api.delete(`/transactions/${id}`)
}

export async function getTransactionsByPeriod(
  startDate: string,
  endDate: string,
  page = 0,
  size = 10
) {
  const response = await api.get<Page<TransactionResponseDTO>>('/transactions/period', {
    params: { startDate, endDate, page, size, sort: 'transactionDate,desc' },
  })
  return response.data
}

export async function getSummary(startDate: string, endDate: string) {
  const response = await api.get<DashboardSummaryDTO>('/transactions/summary', {
    params: { startDate, endDate },
  })
  return response.data
}

export async function getMonthlySummary(year?: number) {
  const response = await api.get<MonthlySummaryDTO[]>('/transactions/summary/monthly', {
    params: { year },
  })
  return response.data
}

export async function searchTransactions(
  params: {
    description?: string
    categoryId?: string
    type?: CategoryType
    page?: number
    size?: number
  }
) {
  const response = await api.get<Page<TransactionResponseDTO>>('/transactions/search', {
    params: { ...params, sort: 'transactionDate,desc' },
  })
  return response.data
}

export async function exportTransactionsCsv(startDate: string, endDate: string) {
  const response = await api.get('/transactions/export', {
    params: { startDate, endDate },
    responseType: 'blob',
  })

  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `extrato_${startDate}_a_${endDate}.csv`)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}