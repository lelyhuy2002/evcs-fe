import { z } from 'zod';

// ============================================================================
// MEMBER ENUMS AND TYPES
// ============================================================================

export const MemberJoinStatus = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  COUNTER_OFFERED: 'Counter Offered',
} as const;

export const CounterOfferStatus = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
} as const;

export type MemberJoinStatusType = (typeof MemberJoinStatus)[keyof typeof MemberJoinStatus];
export type CounterOfferStatusType = (typeof CounterOfferStatus)[keyof typeof CounterOfferStatus];

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

/**
 * Schema cho User object (simplified)
 */
export const UserSchema = z.object({
  id: z.number(),
  fullName: z.string(),
  email: z.string(),
  passwordHash: z.string().optional(),
  cccd: z.string(),
  driverLicense: z.string(),
  birthday: z.string(),
  role: z.string(),
  verificationStatus: z.string(),
  createdAt: z.string(),
  location: z.string(),
  cccdFrontUrl: z.string().nullable(),
  cccdBackUrl: z.string().nullable(),
  driverLicenseUrl: z.string().nullable(),
});

/**
 * Schema cho Vehicle object (nested in Group)
 */
export const VehicleNestedSchema = z.object({
  id: z.number(),
  model: z.string(),
  brand: z.string(),
  licensePlate: z.string(),
  location: z.string(),
  status: z.string(),
  owner: UserSchema,
  registrationInfo: z.string(),
  batteryCapacity: z.number(),
  yearOfManufacture: z.number(),
  imageUrl1: z.string().nullable(),
  imageUrl2: z.string().nullable(),
  imageUrl3: z.string().nullable(),
  verificationStatus: z.string(),
  verifiedBy: UserSchema.nullable(),
  verifiedAt: z.string().nullable(),
  rejectReason: z.string().nullable(),
  createdAt: z.string(),
});

/**
 * Schema cho Group object (nested in Member)
 */
export const GroupNestedSchema = z.object({
  id: z.number(),
  vehicle: VehicleNestedSchema,
  createdBy: UserSchema,
  approvedBy: UserSchema.nullable(),
  name: z.string(),
  description: z.string(),
  status: z.string(),
  estimatedValue: z.number(),
  createdAt: z.string(),
  approvalStatus: z.string(),
  rejectReason: z.string().nullable(),
  maxMembers: z.number(),
  minOwnershipPercentage: z.number(),
  totalOwnershipPercentage: z.number(),
  isLocked: z.boolean(),
  contractUrl: z.string().nullable(),
  balance: z.number(),
});

/**
 * Schema cho Member object từ API
 */
/**
 * Schema cho Member object từ API
 */
/**
 * Schema cho Member object từ API
 */
export const MemberSchema = z.object({
  id: z.number(),
  user: UserSchema,
  group: GroupNestedSchema,
  ownershipPercentage: z.number(),
  joinStatus: z.enum([
    MemberJoinStatus.PENDING,
    MemberJoinStatus.APPROVED,
    MemberJoinStatus.REJECTED,
    MemberJoinStatus.COUNTER_OFFERED
  ]),
  joinedAt: z.string().optional(),
  reason: z.string().optional(),
  counterOfferPercentage: z.number().optional(),
  counterOfferStatus: z.enum([
    CounterOfferStatus.PENDING,
    CounterOfferStatus.ACCEPTED,
    CounterOfferStatus.REJECTED
  ]).optional(),
  isOwner: z.boolean().default(false),
});

/**
 * Schema cho danh sách members response
 */
export const MembersResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.array(MemberSchema),
});

/**
 * Schema cho single member response
 */
export const MemberResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: MemberSchema,
});

/**
 * Schema cho create/update member request
 */
export const CreateMemberSchema = z.object({
  groupId: z.number(),
  userId: z.number().optional(), // Optional, backend có thể lấy từ session
  proposedOwnershipPercentage: z.number().min(0.1, 'Phần trăm sở hữu tối thiểu là 0.1%').max(100),
  reason: z.string().min(10, 'Lý do tham gia phải có ít nhất 10 ký tự'),
});

/**
 * Schema cho update member (approve/reject/counter-offer)
 */
export const UpdateMemberSchema = z.object({
  joinStatus: z.enum(['Approved', 'Rejected', 'Counter Offered']).optional(),
  ownershipPercentage: z.number().min(0.1).max(100).optional(),
  counterOfferPercentage: z.number().min(0.1).max(100).optional(),
  counterOfferStatus: z.enum(['Accepted', 'Rejected']).optional(),
  rejectReason: z.string().optional(),
});

// ============================================================================
// TYPESCRIPT TYPES
// ============================================================================

export type User = z.infer<typeof UserSchema>;
export type VehicleNested = z.infer<typeof VehicleNestedSchema>;
export type GroupNested = z.infer<typeof GroupNestedSchema>;
export type Member = z.infer<typeof MemberSchema>;
export type MembersResponse = z.infer<typeof MembersResponseSchema>;
export type MemberResponse = z.infer<typeof MemberResponseSchema>;
export type CreateMemberRequest = z.infer<typeof CreateMemberSchema>;
export type UpdateMemberRequest = z.infer<typeof UpdateMemberSchema>;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get badge color based on join status
 */
export function getJoinStatusColor(status: string): string {
  switch (status) {
    case MemberJoinStatus.APPROVED:
      return 'bg-green-100 text-green-800';
    case MemberJoinStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800';
    case MemberJoinStatus.REJECTED:
      return 'bg-red-100 text-red-800';
    case MemberJoinStatus.COUNTER_OFFERED:
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Get join status label in Vietnamese
 */
export function getJoinStatusLabel(status: string): string {
  switch (status) {
    case MemberJoinStatus.APPROVED:
      return 'Đã duyệt';
    case MemberJoinStatus.PENDING:
      return 'Chờ duyệt';
    case MemberJoinStatus.REJECTED:
      return 'Từ chối';
    case MemberJoinStatus.COUNTER_OFFERED:
      return 'Đề xuất ngược';
    default:
      return status;
  }
}

/**
 * Get counter offer status color
 */
export function getCounterOfferStatusColor(status: string | null): string {
  if (!status) return 'bg-gray-100 text-gray-800';
  
  switch (status) {
    case CounterOfferStatus.ACCEPTED:
      return 'bg-green-100 text-green-800';
    case CounterOfferStatus.PENDING:
      return 'bg-orange-100 text-orange-800';
    case CounterOfferStatus.REJECTED:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Get counter offer status label
 */
export function getCounterOfferStatusLabel(status: string | null): string {
  if (!status) return 'N/A';
  
  switch (status) {
    case CounterOfferStatus.ACCEPTED:
      return 'Đã chấp nhận';
    case CounterOfferStatus.PENDING:
      return 'Chờ phản hồi';
    case CounterOfferStatus.REJECTED:
      return 'Đã từ chối';
    default:
      return status;
  }
}

/**
 * Format ownership percentage
 */
export function formatOwnershipPercentage(percentage: number): string {
  return `${percentage.toFixed(1)}%`;
}

/**
 * Validate if user can join group based on available ownership
 */
export function canJoinGroup(
  requestedPercentage: number,
  currentTotalOwnership: number,
  minOwnershipPercentage: number
): { canJoin: boolean; reason?: string } {
  // Check if requested percentage meets minimum
  if (requestedPercentage < minOwnershipPercentage) {
    return {
      canJoin: false,
      reason: `Phần trăm sở hữu tối thiểu là ${minOwnershipPercentage}%`,
    };
  }

  // Check if there's enough available ownership
  const availableOwnership = 100 - currentTotalOwnership;
  if (requestedPercentage > availableOwnership) {
    return {
      canJoin: false,
      reason: `Chỉ còn ${availableOwnership.toFixed(1)}% sở hữu khả dụng`,
    };
  }

  return { canJoin: true };
}
