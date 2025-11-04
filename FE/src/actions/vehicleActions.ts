'use server';

import { vehicleService } from '@/services/vehicleService';
import type {
  CreateVehicleRequest,
  UpdateVehicleRequest,
  Vehicle,
} from '@/types/vehicle';
import { revalidatePath } from 'next/cache';

/**
 * Server Action: Tạo xe mới
 */
export async function createVehicleAction(
  data: CreateVehicleRequest
): Promise<{ success: boolean; message: string; data?: Vehicle }> {
  try {
    const vehicle = await vehicleService.createVehicle(data);
    revalidatePath('/vehicles');
    revalidatePath('/dashboard');
    return {
      success: true,
      message: 'Tạo xe thành công! Vui lòng chờ admin duyệt.',
      data: vehicle,
    };
  } catch (error) {
    console.error('Create vehicle error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo xe',
    };
  }
}

/**
 * Server Action: Cập nhật xe
 */
export async function updateVehicleAction(
  id: number,
  data: UpdateVehicleRequest
): Promise<{ success: boolean; message: string; data?: Vehicle }> {
  try {
    const vehicle = await vehicleService.patchVehicle(id, data);
    revalidatePath('/vehicles');
    revalidatePath(`/vehicles/${id}`);
    revalidatePath('/dashboard');
    return {
      success: true,
      message: 'Cập nhật xe thành công!',
      data: vehicle,
    };
  } catch (error) {
    console.error('Update vehicle error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Có lỗi xảy ra khi cập nhật xe',
    };
  }
}

/**
 * Server Action: Xóa xe
 */
export async function deleteVehicleAction(
  id: number
): Promise<{ success: boolean; message: string }> {
  try {
    await vehicleService.deleteVehicle(id);
    revalidatePath('/vehicles');
    revalidatePath('/dashboard');
    return {
      success: true,
      message: 'Xóa xe thành công!',
    };
  } catch (error) {
    console.error('Delete vehicle error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Có lỗi xảy ra khi xóa xe',
    };
  }
}
