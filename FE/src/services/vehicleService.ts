import { apiClient } from '@/lib/api';
import type {
  Vehicle,
  VehiclesResponse,
  VehicleResponse,
  CreateVehicleRequest,
  UpdateVehicleRequest,
  VehicleQuery,
} from '@/types/vehicle';
import {
  VehiclesResponseSchema,
  VehicleResponseSchema,
} from '@/types/vehicle';

/**
 * Vehicle Service - API calls for vehicle management
 */
export const vehicleService = {
  /**
   * GET /api/vehicles
   * Lấy danh sách xe (có thể filter theo ownerId)
   */
  async getVehicles(query?: VehicleQuery): Promise<Vehicle[]> {
    const params = new URLSearchParams();
    if (query?.ownerId) {
      params.append('ownerId', query.ownerId.toString());
    }

    const url = `/api/vehicles${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiClient.get<VehiclesResponse>(url, VehiclesResponseSchema);
    return response.data;
  },

  /**
   * GET /api/vehicles/{id}
   * Lấy chi tiết xe theo ID
   */
  async getVehicleById(id: number): Promise<Vehicle> {
    const response = await apiClient.get<VehicleResponse>(
      `/api/vehicles/${id}`,
      VehicleResponseSchema
    );
    return response.data;
  },

  /**
   * POST /api/vehicles
   * Tạo xe mới
   */
  async createVehicle(data: CreateVehicleRequest): Promise<Vehicle> {
    const response = await apiClient.post<VehicleResponse>(
      '/api/vehicles',
      data,
      VehicleResponseSchema
    );
    return response.data;
  },

  /**
   * PUT /api/vehicles/{id}
   * Cập nhật toàn bộ thông tin xe
   */
  async updateVehicle(id: number, data: CreateVehicleRequest): Promise<Vehicle> {
    const response = await apiClient.put<VehicleResponse>(
      `/api/vehicles/${id}`,
      data,
      VehicleResponseSchema
    );
    return response.data;
  },

  /**
   * PATCH /api/vehicles/{id}
   * Cập nhật một phần thông tin xe
   */
  async patchVehicle(id: number, data: UpdateVehicleRequest): Promise<Vehicle> {
    const response = await apiClient.patch<VehicleResponse>(
      `/api/vehicles/${id}`,
      data,
      VehicleResponseSchema
    );
    return response.data;
  },

  /**
   * DELETE /api/vehicles/{id}
   * Xóa xe
   */
  async deleteVehicle(id: number): Promise<void> {
    await apiClient.delete(`/api/vehicles/${id}`);
  },

  /**
   * Lấy danh sách xe của user hiện tại
   */
  async getMyVehicles(userId: number): Promise<Vehicle[]> {
    return this.getVehicles({ ownerId: userId });
  },

  /**
   * Lấy danh sách xe đã được duyệt (Approved)
   */
  async getApprovedVehicles(ownerId?: number): Promise<Vehicle[]> {
    const vehicles = await this.getVehicles(ownerId ? { ownerId } : undefined);
    return vehicles.filter((v) => v.verificationStatus === 'Approved');
  },

  /**
   * Lấy danh sách xe chờ duyệt (Pending)
   */
  async getPendingVehicles(ownerId?: number): Promise<Vehicle[]> {
    const vehicles = await this.getVehicles(ownerId ? { ownerId } : undefined);
    return vehicles.filter((v) => v.verificationStatus === 'Pending');
  },
};
