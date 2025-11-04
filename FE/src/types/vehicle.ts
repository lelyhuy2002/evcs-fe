import { z } from 'zod';

// ============================================================================
// VEHICLE ENUMS
// ============================================================================

export const VehicleStatus = {
  AVAILABLE: 'Available',
  IN_USE: 'In Use',
  MAINTENANCE: 'Maintenance',
  INACTIVE: 'Inactive',
} as const;

export const VerificationStatus = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
} as const;

export type VehicleStatusType = (typeof VehicleStatus)[keyof typeof VehicleStatus];
export type VerificationStatusType = (typeof VerificationStatus)[keyof typeof VerificationStatus];

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

/**
 * Schema cho Vehicle object từ API
 */
export const VehicleSchema = z.object({
  vehicleId: z.number(),
  model: z.string(),
  brand: z.string(),
  licensePlate: z.string(),
  location: z.string(),
  status: z.string(), // Available, In Use, Maintenance, Inactive
  registrationInfo: z.string(),
  batteryCapacity: z.number(),
  yearOfManufacture: z.number(),
  imageUrl1: z.string().nullable(),
  imageUrl2: z.string().nullable(),
  imageUrl3: z.string().nullable(),
  verificationStatus: z.string(), // Pending, Approved, Rejected
  rejectReason: z.string().nullable(),
  verifiedAt: z.string().nullable(),
  ownerId: z.number(),
  ownerName: z.string().nullable(),
  verifiedByName: z.string().nullable(),
});

/**
 * Schema cho danh sách vehicles
 */
export const VehiclesResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.array(VehicleSchema),
});

/**
 * Schema cho single vehicle response
 */
export const VehicleResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: VehicleSchema,
});

/**
 * Schema cho create vehicle request
 */
export const CreateVehicleSchema = z.object({
  model: z.string().min(1, 'Model không được để trống'),
  brand: z.string().min(1, 'Brand không được để trống'),
  licensePlate: z.string().min(1, 'Biển số không được để trống'),
  location: z.string().min(1, 'Vị trí không được để trống'),
  status: z.string().default('Available'),
  registrationInfo: z.string().min(1, 'Thông tin đăng ký không được để trống'),
  batteryCapacity: z.number().min(1, 'Dung lượng pin phải lớn hơn 0'),
  yearOfManufacture: z.number().min(1900).max(new Date().getFullYear() + 1, 'Năm sản xuất không hợp lệ'),
  imageUrl1: z.string().optional(),
  imageUrl2: z.string().optional(),
  imageUrl3: z.string().optional(),
  ownerId: z.number(),
});

/**
 * Schema cho update vehicle request
 */
export const UpdateVehicleSchema = CreateVehicleSchema.partial();

/**
 * Schema cho query params
 */
export const VehicleQuerySchema = z.object({
  ownerId: z.number().optional(),
});

// ============================================================================
// TYPESCRIPT TYPES
// ============================================================================

export type Vehicle = z.infer<typeof VehicleSchema>;
export type VehiclesResponse = z.infer<typeof VehiclesResponseSchema>;
export type VehicleResponse = z.infer<typeof VehicleResponseSchema>;
export type CreateVehicleRequest = z.infer<typeof CreateVehicleSchema>;
export type UpdateVehicleRequest = z.infer<typeof UpdateVehicleSchema>;
export type VehicleQuery = z.infer<typeof VehicleQuerySchema>;

// ============================================================================
// FORM TYPES (for react-hook-form)
// ============================================================================

export interface VehicleFormData {
  model: string;
  brand: string;
  licensePlate: string;
  location: string;
  status: string;
  registrationInfo: string;
  batteryCapacity: number;
  yearOfManufacture: number;
  imageUrl1?: string;
  imageUrl2?: string;
  imageUrl3?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get badge color based on verification status
 */
export function getVerificationStatusColor(status: string): string {
  switch (status) {
    case VerificationStatus.APPROVED:
      return 'bg-green-100 text-green-800';
    case VerificationStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800';
    case VerificationStatus.REJECTED:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Get badge color based on vehicle status
 */
export function getVehicleStatusColor(status: string): string {
  switch (status) {
    case VehicleStatus.AVAILABLE:
      return 'bg-green-100 text-green-800';
    case VehicleStatus.IN_USE:
      return 'bg-blue-100 text-blue-800';
    case VehicleStatus.MAINTENANCE:
      return 'bg-orange-100 text-orange-800';
    case VehicleStatus.INACTIVE:
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Format vehicle display name
 */
export function getVehicleDisplayName(vehicle: Vehicle): string {
  return `${vehicle.brand} ${vehicle.model} - ${vehicle.licensePlate}`;
}
