import { httpDelete, httpGet, httpPatch, httpPost, httpPut } from './http'
import type { ApiSuccessResponse, Restaurant, RestaurantCreateInput, RestaurantUpdateInput } from '../../types'

export async function getRestaurants() {
  const response = await httpGet<ApiSuccessResponse<Restaurant[]>>('/api/restaurants')
  return response.success.data
}

export async function getRestaurantById(id: number) {
  const response = await httpGet<ApiSuccessResponse<Restaurant>>(`/api/restaurants/${id}`)
  return response.success.data
}

export async function createRestaurant(restaurant: RestaurantCreateInput) {
  const response = await httpPost<ApiSuccessResponse<Restaurant>>('/api/restaurants', restaurant)
  return response.success.data
}

export async function updateRestaurant(id: number, restaurant: RestaurantUpdateInput) {
  const response = await httpPut<ApiSuccessResponse<Restaurant>>(`/api/restaurants/${id}`, restaurant)
  return response.success.data
}

export async function deleteRestaurant(id: number) {
  const response = await httpDelete<ApiSuccessResponse<Restaurant>>(`/api/restaurants/${id}`)
  return response.success.data
}

export async function patchRestaurantStatus(id: number, isOpen: boolean) {
  const response = await httpPatch<ApiSuccessResponse<Restaurant>>(`/api/restaurants/${id}/status`, { isOpen })
  return response.success.data
}

export async function patchRestaurantLocation(id: number, latitude: number, longitude: number) {
  const response = await httpPatch<ApiSuccessResponse<Restaurant>>(`/api/restaurants/${id}/location`, { latitude, longitude })
  return response.success.data
}
