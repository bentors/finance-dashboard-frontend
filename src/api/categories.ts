import api from './axios'
import type {
  CategoryRequestDTO,
  CategoryResponseDTO,
  Page,
} from '../types/api'

export async function getCategories(page = 0, size = 100) {
  const response = await api.get<Page<CategoryResponseDTO>>('/categories', {
    params: { page, size, sort: 'name,asc' },
  })
  return response.data
}

export async function getCategoryById(id: string) {
  const response = await api.get<CategoryResponseDTO>(`/categories/${id}`)
  return response.data
}

export async function createCategory(dto: CategoryRequestDTO) {
  const response = await api.post<CategoryResponseDTO>('/categories', dto)
  return response.data
}

export async function updateCategory(id: string, dto: CategoryRequestDTO) {
  const response = await api.put<CategoryResponseDTO>(`/categories/${id}`, dto)
  return response.data
}

export async function deleteCategory(id: string) {
  await api.delete(`/categories/${id}`)
}