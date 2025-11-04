'use server';

import { revalidatePath } from 'next/cache';
import {
  createVehicle as createVehicleService,
  updateVehicle as updateVehicleService,
  patchVehicle as patchVehicleService,
  deleteVehicle as deleteVehicleService,
} from '@/lib/services/vehicleService';
import type { CreateVehicleRequest, UpdateVehicleRequest } from '@/types/vehicle';

// ============================================================================
// SERVER ACTIONS FOR VEHICLE MUTATIONS
// ============================================================================

/**
 * Create new vehicle
 */
export async function createVehicleAction(data: CreateVehicleRequest) {
  try {
    const vehicle = await createVehicleService(data);
    
    // Revalidate paths
    revalidatePath('/vehicles');
    revalidatePath('/dashboard');
    
    return {
      success: true,
      message: 'Xe đã được tạo thành công và đang chờ duyệt',
      data: vehicle,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Không thể tạo xe',
      data: null,
    };
  }
}

/**
 * Update vehicle (full update)
 */
export async function updateVehicleAction(id: number, data: CreateVehicleRequest) {
  try {
    const vehicle = await updateVehicleService(id, data);
    
    // Revalidate paths
    revalidatePath('/vehicles');
    revalidatePath(`/vehicles/${id}`);
    revalidatePath('/dashboard');
    
    return {
      success: true,
      message: 'Thông tin xe đã được cập nhật',
      data: vehicle,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Không thể cập nhật xe',
      data: null,
    };
  }
}

/**
 * Patch vehicle (partial update)
 */
export async function patchVehicleAction(id: number, data: UpdateVehicleRequest) {
  try {
    const vehicle = await patchVehicleService(id, data);
    
    // Revalidate paths
    revalidatePath('/vehicles');
    revalidatePath(`/vehicles/${id}`);
    revalidatePath('/dashboard');
    
    return {
      success: true,
      message: 'Thông tin xe đã được cập nhật',
      data: vehicle,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Không thể cập nhật xe',
      data: null,
    };
  }
}

/**
 * Delete vehicle
 */
export async function deleteVehicleAction(id: number) {
  try {
    await deleteVehicleService(id);
    
    // Revalidate paths
    revalidatePath('/vehicles');
    revalidatePath('/dashboard');
    
    return {
      success: true,
      message: 'Xe đã được xóa thành công',
      data: null,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Không thể xóa xe',
      data: null,
    };
  }
}
