import { apiClient } from '../apiClient';
import {
  VehiclesResponseSchema,
  VehicleResponseSchema,
  CreateVehicleSchema,
  UpdateVehicleSchema,
  type Vehicle,
  type CreateVehicleRequest,
  type UpdateVehicleRequest,
  type VehicleQuery,
} from '@/types/vehicle';

// ============================================================================
// VEHICLE API SERVICE
// ============================================================================

/**
 * Get all vehicles (with optional ownerId filter)
 * GET /api/vehicles?ownerId={ownerId}
 */
export async function getVehicles(query?: VehicleQuery): Promise<Vehicle[]> {
  const params = new URLSearchParams();
  if (query?.ownerId) {
    params.append('ownerId', query.ownerId.toString());
  }

  const queryString = params.toString();
  const url = queryString ? `/vehicles?${queryString}` : '/vehicles';
  
  const response = await apiClient.get(url, {
    schema: VehiclesResponseSchema,
  });

  return response.data;
}

/**
 * Get single vehicle by ID
 * GET /api/vehicles/{id}
 */
export async function getVehicleById(id: number): Promise<Vehicle> {
  const response = await apiClient.get(`/vehicles/${id}`, {
    schema: VehicleResponseSchema,
  });

  return response.data;
}

/**
 * Create new vehicle
 * POST /api/vehicles
 */
export async function createVehicle(data: CreateVehicleRequest): Promise<Vehicle> {
  // Validate data before sending
  const validatedData = CreateVehicleSchema.parse(data);

  const response = await apiClient.post('/vehicles', {
    data: validatedData,
    schema: VehicleResponseSchema,
  });

  return response.data;
}

/**
 * Update vehicle (full update)
 * PUT /api/vehicles/{id}
 */
export async function updateVehicle(id: number, data: CreateVehicleRequest): Promise<Vehicle> {
  // Validate data before sending
  const validatedData = CreateVehicleSchema.parse(data);

  const response = await apiClient.put(`/vehicles/${id}`, {
    data: validatedData,
    schema: VehicleResponseSchema,
  });

  return response.data;
}

/**
 * Patch vehicle (partial update)
 * PATCH /api/vehicles/{id}
 */
export async function patchVehicle(id: number, data: UpdateVehicleRequest): Promise<Vehicle> {
  // Validate partial data before sending
  const validatedData = UpdateVehicleSchema.parse(data);

  const response = await apiClient.patch(`/vehicles/${id}`, {
    data: validatedData,
    schema: VehicleResponseSchema,
  });

  return response.data;
}

/**
 * Delete vehicle
 * DELETE /api/vehicles/{id}
 */
export async function deleteVehicle(id: number): Promise<void> {
  await apiClient.delete(`/vehicles/${id}`);
}

// ============================================================================
// QUERY HELPERS (for React Query)
// ============================================================================

/**
 * Query keys for React Query
 */
export const vehicleKeys = {
  all: ['vehicles'] as const,
  lists: () => [...vehicleKeys.all, 'list'] as const,
  list: (filters?: VehicleQuery) => [...vehicleKeys.lists(), filters] as const,
  details: () => [...vehicleKeys.all, 'detail'] as const,
  detail: (id: number) => [...vehicleKeys.details(), id] as const,
  byOwner: (ownerId: number) => [...vehicleKeys.all, 'owner', ownerId] as const,
};

/**
 * Get vehicles owned by current user
 */
export async function getMyVehicles(ownerId: number): Promise<Vehicle[]> {
  return getVehicles({ ownerId });
}

/**
 * Get only approved vehicles
 */
export async function getApprovedVehicles(ownerId?: number): Promise<Vehicle[]> {
  const vehicles = await getVehicles(ownerId ? { ownerId } : undefined);
  return vehicles.filter((v) => v.verificationStatus === 'Approved');
}

/**
 * Get only pending vehicles
 */
export async function getPendingVehicles(ownerId?: number): Promise<Vehicle[]> {
  const vehicles = await getVehicles(ownerId ? { ownerId } : undefined);
  return vehicles.filter((v) => v.verificationStatus === 'Pending');
}
