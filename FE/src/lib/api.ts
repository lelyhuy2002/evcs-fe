/**
 * API Utility Functions
 * Handles all HTTP requests to the backend with proper error handling
 */

import { z } from 'zod';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

/**
 * Helper function to convert relative image paths to full URLs
 * Backend returns paths like "/uploads/vehicles/image.jpg"
 * We need to convert to "http://localhost:8080/uploads/vehicles/image.jpg"
 */
export function getFullImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) return '';
  
  // If already a full URL (starts with http:// or https://), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If relative path, prepend API_BASE_URL
  return `${API_BASE_URL}${imagePath}`;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ============================================================================
// UNIFIED API CLIENT WITH ZOD VALIDATION
// ============================================================================

class ApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Generic request method with Zod validation
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    schema?: z.ZodType<T>
  ): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        credentials: 'include',
        headers: {
          ...options.headers,
        },
      });

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        if (response.status === 403) {
          throw new Error('Unauthorized: Please login first');
        }
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Bạn cần đăng nhập để truy cập tài nguyên này');
        }
        throw new Error(data.message || 'Something went wrong');
      }

      // Validate with Zod if schema provided
      if (schema) {
        return schema.parse(data);
      }

      return data;
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('API Response validation error:', error.issues);
        throw new Error('Invalid response from server');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  async get<T>(endpoint: string, schema?: z.ZodType<T>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' }, schema);
  }

  async post<T>(endpoint: string, body: unknown, schema?: z.ZodType<T>): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
      schema
    );
  }

  async put<T>(endpoint: string, body: unknown, schema?: z.ZodType<T>): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
      schema
    );
  }

  async patch<T>(endpoint: string, body: unknown, schema?: z.ZodType<T>): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
      schema
    );
  }

  async delete(endpoint: string): Promise<void> {
    await this.request(endpoint, { method: 'DELETE' });
  }

  async postFormData<T>(endpoint: string, formData: FormData, schema?: z.ZodType<T>): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: formData,
      },
      schema
    );
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// ============================================================================
// LEGACY API FUNCTIONS (keep for backward compatibility)
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: number;
  email: string;
  fullName: string;
  role: string;
  verificationStatus: string;
  sessionId: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  cccd: string;
  driverLicense: string;
  birthday: string;
  location: string;
  cccdFront: File;
  cccdBack: File;
  driverLicenseImg: File;
}

/**
 * Generic fetch wrapper with credentials and error handling
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      credentials: 'include', // Important for session cookies
      headers: {
        ...options.headers,
      },
    });

    // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        if (response.status === 403) {
          throw new Error('Unauthorized: Please login first');
        }
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Bạn cần đăng nhập để truy cập tài nguyên này');
      }
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
}

/**
 * Login API call
 */
export async function login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  return apiFetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
}

/**
 * Register API call with multipart/form-data
 */
export async function register(data: RegisterRequest): Promise<ApiResponse<string>> {
  const formData = new FormData();
  
  formData.append('fullName', data.fullName);
  formData.append('email', data.email);
  formData.append('password', data.password);
  formData.append('cccd', data.cccd);
  formData.append('driverLicense', data.driverLicense);
  formData.append('birthday', data.birthday);
  formData.append('location', data.location);
  formData.append('cccdFront', data.cccdFront);
  formData.append('cccdBack', data.cccdBack);
  formData.append('driverLicenseImg', data.driverLicenseImg);

  return apiFetch<string>('/api/auth/register', {
    method: 'POST',
    body: formData,
    // Don't set Content-Type header, browser will set it with boundary
  });
}

/**
 * Check login status
 */
export async function checkLoginStatus(): Promise<ApiResponse<{
  isAuthenticated: boolean;
  userId?: number;
  email?: string;
  role?: string;
  sessionId: string;
}>> {
  return apiFetch('/api/auth/status', {
    method: 'GET',
  });
}

/**
 * Get current user profile
 */
export async function getCurrentUser(): Promise<ApiResponse<{
  id: number;
  fullName: string;
  email: string;
  cccd: string;
  driverLicense: string;
  birthday: string;
  role: string;
  verificationStatus: string;
  createdAt: string;
  location: string;
  cccdFrontUrl: string;
  cccdBackUrl: string;
  driverLicenseUrl: string;
}>> {
  return apiFetch('/api/auth/profile', {
    method: 'GET',
  });
}

/**
 * Update user profile
 */
export async function updateUserProfile(data: {
  fullName: string;
  location: string;
  birthday: string;
  driverLicense: string;
}): Promise<ApiResponse<{
  id: number;
  fullName: string;
  email: string;
  cccd: string;
  driverLicense: string;
  birthday: string;
  role: string;
  verificationStatus: string;
  createdAt: string;
  location: string;
  cccdFrontUrl: string;
  cccdBackUrl: string;
  driverLicenseUrl: string;
}>> {
  return apiFetch('/api/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

/**
 * Logout API call
 */
export async function logout(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// ============= USER MANAGEMENT APIs (Admin) =============

/**
 * Get all users (Admin only)
 */
export async function getAllUsers(): Promise<ApiResponse<User[]>> {
  return apiFetch<User[]>('/api/users', {
    method: 'GET',
  });
}

/**
 * Get user detail by ID (Admin only)
 */
export async function getUserDetail(userId: number): Promise<ApiResponse<User>> {
  return apiFetch<User>(`/api/users/${userId}`, {
    method: 'GET',
  });
}

/**
 * Update user (Admin only)
 */
export async function updateUser(
  userId: number,
  data: {
    fullName: string;
    email: string;
    cccd: string;
    driverLicense: string;
    birthday: string;
    role: string;
    verificationStatus: string;
    location: string;
  }
): Promise<ApiResponse<string>> {
  return apiFetch<string>(`/api/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

/**
 * Delete user (Admin only)
 */
export async function deleteUser(userId: number): Promise<ApiResponse<string>> {
  return apiFetch<string>(`/api/users/${userId}`, {
    method: 'DELETE',
  });
}

// ============= GROUP APIs =============

export interface Group {
  id: number;
  vehicleId: number;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleLicensePlate: string;
  name: string;
  description: string;
  status: string;
  estimatedValue: number;
  currentOwnership: number;
  maxMembers: number;
  currentMembers: number;
  minOwnershipPercentage: number;
  createdAt: string;
  approvalStatus: string;
  contractUrl: string;
  rejectReason: string;
  createdBy: number; // Deprecated - use createdById
  createdById: number; // New field from API
  createdByName: string;
  approvedBy: number;
  approvedById: number; // New field from API
  approvedByName: string;
  isLocked?: boolean; // Added for member management
  balance?: number; // Added for financial management
  totalOwnershipPercentage?: number; // Added from API
}

/**
 * Get all groups (public endpoint)
 */
export async function getAllGroups(): Promise<ApiResponse<Group[]>> {
  return apiFetch<Group[]>('/api/groups', {
    method: 'GET',
  });
}

/**
 * Get groups created by current user
 */
export async function getMyGroups(): Promise<ApiResponse<Group[]>> {
  return apiFetch<Group[]>('/api/groups/my-groups', {
    method: 'GET',
  });
}

/**
 * Get group detail by ID
 */
export async function getGroupDetail(groupId: number): Promise<ApiResponse<Group>> {
  return apiFetch<Group>(`/api/groups/${groupId}`, {
    method: 'GET',
  });
}

/**
 * Create a new group
 */
export async function createGroup(data: {
  vehicleId: number;
  groupName: string;
  description: string;
  estimatedValue: number;
  maxMembers: number;
  minOwnershipPercentage: number;
}): Promise<ApiResponse<string>> {
  return apiFetch<string>('/api/groups', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

/**
 * Update group (Admin only)
 */
export async function updateGroup(
  groupId: number,
  data: {
    name: string;
    description: string;
    status: string;
    estimatedValue: number;
    maxMembers: number;
    minOwnershipPercentage: number;
    approvalStatus: string;
    contractUrl?: string;
  }
): Promise<ApiResponse<string>> {
  return apiFetch<string>(`/api/groups/${groupId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

/**
 * Update group status (Owner can update status and isLocked)
 */
export async function updateGroupStatus(
  groupId: number,
  data: {
    status?: string;
    isLocked?: boolean;
  }
): Promise<ApiResponse<Group>> {
  return apiFetch<Group>(`/api/groups/${groupId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

/**
 * Delete group (Admin only)
 */
export async function deleteGroup(groupId: number): Promise<ApiResponse<string>> {
  return apiFetch<string>(`/api/groups/${groupId}`, {
    method: 'DELETE',
  });
}

// ============= VEHICLE APIs =============

export interface Vehicle {
  vehicleId: number;
  model: string;
  brand: string;
  licensePlate: string;
  location: string;
  status: string;
  registrationInfo: string;
  batteryCapacity: number;
  yearOfManufacture: number;
  imageUrl1: string;
  imageUrl2: string;
  imageUrl3: string;
  verificationStatus: string;
  rejectReason: string;
  verifiedAt: string;
  ownerId: number;
  ownerName: string;
  verifiedByName: string;
}

/**
 * Get all vehicles (with optional ownerId filter)
 */
export async function getVehicles(ownerId?: number): Promise<ApiResponse<Vehicle[]>> {
  const url = ownerId ? `/api/vehicles?ownerId=${ownerId}` : '/api/vehicles';
  return apiFetch<Vehicle[]>(url, {
    method: 'GET',
  });
}

/**
 * Get vehicle detail by ID
 */
export async function getVehicleDetail(vehicleId: number): Promise<ApiResponse<Vehicle>> {
  return apiFetch<Vehicle>(`/api/vehicles/${vehicleId}`, {
    method: 'GET',
  });
}

/**
 * Upload vehicle images
 * Returns URLs for uploaded images
 */
export async function uploadVehicleImages(data: {
  image1: File;
  image2?: File;
  image3?: File;
}): Promise<ApiResponse<Record<string, string>>> {
  const formData = new FormData();
  formData.append('image1', data.image1);
  if (data.image2) formData.append('image2', data.image2);
  if (data.image3) formData.append('image3', data.image3);

  return apiFetch<Record<string, string>>(
    '/api/vehicles/upload-images',
    {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - browser will set it with boundary for multipart/form-data
    }
  );
}

/**
 * Create a new vehicle
 */
export async function createVehicle(data: {
  model: string;
  brand: string;
  licensePlate: string;
  location: string;
  status: string;
  registrationInfo: string;
  batteryCapacity: number;
  yearOfManufacture: number;
  imageUrl1: string;
  imageUrl2: string;
  imageUrl3: string;
  ownerId: number;
}): Promise<ApiResponse<string>> {
  return apiFetch<string>('/api/vehicles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

/**
 * Update vehicle information (Admin only)
 */
export async function updateVehicle(
  vehicleId: number,
  data: {
    model: string;
    brand: string;
    licensePlate: string;
    location: string;
    status: string;
    registrationInfo: string;
    batteryCapacity: number;
    yearOfManufacture: number;
    imageUrl1: string;
    imageUrl2: string;
    imageUrl3: string;
    ownerId: number;
  }
): Promise<ApiResponse<string>> {
  return apiFetch<string>(`/api/vehicles/${vehicleId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

/**
 * Delete vehicle (Admin only)
 */
export async function deleteVehicle(vehicleId: number): Promise<ApiResponse<string>> {
  return apiFetch<string>(`/api/vehicles/${vehicleId}`, {
    method: 'DELETE',
  });
}

// ============= ADMIN APIs =============

export interface User {
  id: number;
  fullName: string;
  email: string;
  passwordHash?: string;
  cccd: string;
  driverLicense: string;
  birthday: string;
  role: string;
  verificationStatus: string;
  createdAt: string;
  location: string;
  cccdFrontUrl: string;
  cccdBackUrl: string;
  driverLicenseUrl: string;
}

export interface PendingGroup {
  id: number;
  vehicle: {
    id: number;
    model: string;
    brand: string;
    licensePlate: string;
    location: string;
    status: string;
    owner: User;
    registrationInfo: string;
    batteryCapacity: number;
    yearOfManufacture: number;
    imageUrl1: string;
    imageUrl2: string;
    imageUrl3: string;
    verificationStatus: string;
    verifiedBy: User | null;
    verifiedAt: string;
    rejectReason: string;
    createdAt: string;
  };
  createdBy: User;
  approvedBy: User | null;
  name: string;
  description: string;
  status: string;
  estimatedValue: number;
  createdAt: string;
  approvalStatus: string;
  rejectReason: string;
  maxMembers: number;
  minOwnershipPercentage: number;
  totalOwnershipPercentage: number;
  isLocked: boolean;
  contractUrl: string;
  balance: number;
}

export interface PendingVehicle {
  id: number;
  model: string;
  brand: string;
  licensePlate: string;
  location: string;
  status: string;
  owner: User;
  registrationInfo: string;
  batteryCapacity: number;
  yearOfManufacture: number;
  imageUrl1: string;
  imageUrl2: string;
  imageUrl3: string;
  verificationStatus: string;
  verifiedBy: User | null;
  verifiedAt: string;
  rejectReason: string;
  createdAt: string;
}

/**
 * Get pending groups for admin approval
 */
export async function getPendingGroups(): Promise<ApiResponse<PendingGroup[]>> {
  return apiFetch<PendingGroup[]>('/api/admin/pending-groups', {
    method: 'GET',
  });
}

/**
 * Get pending vehicles for admin approval
 */
export async function getPendingVehicles(): Promise<ApiResponse<PendingVehicle[]>> {
  return apiFetch<PendingVehicle[]>('/api/admin/pending-vehicles', {
    method: 'GET',
  });
}

/**
 * Approve or reject a group
 */
export async function approveGroup(
  groupId: number,
  approved: boolean,
  reason?: string
): Promise<ApiResponse<string>> {
  const params = new URLSearchParams({
    groupId: groupId.toString(),
    approved: approved.toString(),
  });
  
  if (reason) {
    params.append('reason', reason);
  }

  return apiFetch<string>(`/api/admin/approve-group?${params.toString()}`, {
    method: 'POST',
  });
}

/**
 * Approve or reject a vehicle
 */
export async function approveVehicle(
  vehicleId: number,
  approved: boolean,
  reason?: string
): Promise<ApiResponse<string>> {
  const params = new URLSearchParams({
    vehicleId: vehicleId.toString(),
    approved: approved.toString(),
  });
  
  if (reason) {
    params.append('reason', reason);
  }

  return apiFetch<string>(`/api/admin/approve-vehicle?${params.toString()}`, {
    method: 'POST',
  });
}

/**
 * Update vehicle verification status (admin only)
 */
export async function updateVehicleVerificationStatus(
  vehicleId: number,
  verificationStatus: string
): Promise<ApiResponse<Vehicle>> {
  return apiFetch<Vehicle>(`/api/vehicles/${vehicleId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ verificationStatus }),
  });
}

/**
 * Update vehicle status (admin only)
 */
export async function updateVehicleStatus(
  vehicleId: number,
  status: string
): Promise<ApiResponse<Vehicle>> {
  return apiFetch<Vehicle>(`/api/vehicles/${vehicleId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
}

// ============= MEMBER APIs =============

export interface Member {
  id: number;
  group: Group;
  user: User;
  ownershipPercentage: number;
  joinStatus: string;
  joinDate: string;
  reason: string | null;
  proposedOwnershipPercentage: number;
  counterOfferPercentage: number | null;
  counterOfferStatus: string | null;
}

/**
 * Get all members (optionally filter by groupId)
 */
export async function getMembers(groupId?: number): Promise<ApiResponse<Member[]>> {
  const url = groupId ? `/api/members?groupId=${groupId}` : '/api/members';
  return apiFetch<Member[]>(url, {
    method: 'GET',
  });
}

/**
 * Get group members with detailed information
 * Uses the specific endpoint: GET /api/groups/{groupId}/members
 */
export async function getGroupMembers(groupId: number): Promise<ApiResponse<Member[]>> {
  return apiFetch<Member[]>(`/api/groups/${groupId}/members`, {
    method: 'GET',
  });
}

/**
 * Get member detail by ID
 */
export async function getMemberDetail(memberId: number): Promise<ApiResponse<Member>> {
  return apiFetch<Member>(`/api/members/${memberId}`, {
    method: 'GET',
  });
}

/**
 * Join a group (send join request)
 * Uses the correct endpoint: POST /api/groups/{groupId}/join
 */
export async function joinGroup(data: {
  groupId: number;
  proposedOwnershipPercentage: number;
  reason: string;
}): Promise<ApiResponse<Member>> {
  const { groupId, ...bodyData } = data;
  return apiFetch<Member>(`/api/groups/${groupId}/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bodyData),
  });
}

/**
 * Create a new member (join group request)
 * @deprecated Use joinGroup() instead. This endpoint is for admin use only.
 * Try sending groupId as query parameter AND in body for compatibility
 */
export async function createMember(data: {
  groupId: number;
  userId?: number;
  proposedOwnershipPercentage: number;
  reason: string;
}): Promise<ApiResponse<Member>> {
  // Send groupId both as query param and in body to handle different backend expectations
  const { groupId } = data;
  return apiFetch<Member>(`/api/members?groupId=${groupId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data), // Keep full data including groupId
  });
}

/**
 * Update member (approve/reject/counter-offer)
 */
export async function updateMember(
  memberId: number,
  data: {
    joinStatus?: string;
    ownershipPercentage?: number;
    counterOfferPercentage?: number;
    counterOfferStatus?: string;
    rejectReason?: string;
  }
): Promise<ApiResponse<Member>> {
  return apiFetch<Member>(`/api/members/${memberId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

/**
 * Delete member (remove from group)
 */
export async function deleteMember(memberId: number): Promise<ApiResponse<string>> {
  return apiFetch<string>(`/api/members/${memberId}`, {
    method: 'DELETE',
  });
}

/**
 * Review member request (Owner only)
 * @param groupId - Group ID
 * @param memberId - Member ID to review
 * @param action - 'approve' | 'counter_offer' | 'reject'
 * @param counterOfferPercentage - Required when action = 'counter_offer'
 */
export async function reviewMemberRequest(
  groupId: number,
  memberId: number,
  data: {
    action: 'approve' | 'counter_offer' | 'reject';
    counterOfferPercentage?: number;
  }
): Promise<ApiResponse<Member>> {
  return apiFetch<Member>(`/api/groups/${groupId}/members/${memberId}/review`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

/**
 * Member respond to counter offer
 */
export async function respondToCounterOffer(
  groupId: number,
  memberId: number,
  accept: boolean
): Promise<ApiResponse<Member>> {
  return apiFetch<Member>(`/api/groups/${groupId}/members/${memberId}/respond-counter-offer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ accept }),
  });
}

/**
 * Leave group (member voluntarily leaves)
 */
export async function leaveGroup(groupId: number): Promise<ApiResponse<string>> {
  return apiFetch<string>(`/api/groups/${groupId}/leave`, {
    method: 'POST',
  });
}

/**
 * Get available ownership for a group
 */
export async function getAvailableOwnership(groupId: number): Promise<ApiResponse<number>> {
  return apiFetch<number>(`/api/groups/${groupId}/available-ownership`, {
    method: 'GET',
  });
}

/**
 * Get my ownership in a group
 */
export async function getMyOwnership(groupId: number): Promise<ApiResponse<Member>> {
  return apiFetch<Member>(`/api/groups/${groupId}/my-ownership`, {
    method: 'GET',
  });
}

// ============================================================================
// SCHEDULE MANAGEMENT
// ============================================================================

/**
 * Schedule interface matching backend response
 */
export interface Schedule {
  scheduleId: number;
  groupId: number;
  userId: number;
  userName: string;
  groupName: string;
  ownershipPercentage: number;
  userColor: string;
  startTime: string; // ISO 8601 format
  endTime: string; // ISO 8601 format
  status: string; // e.g., "pending", "approved", "in_progress", "completed", "cancelled"
  purpose?: string;
  batteryLevelBefore?: number;
  batteryLevelAfter?: number;
  vehicleCondition?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Get all schedules (optionally filtered by groupId)
 */
export async function getSchedules(groupId?: number): Promise<ApiResponse<Schedule[]>> {
  const url = groupId 
    ? `/api/schedules?groupId=${groupId}` 
    : '/api/schedules';
  
  return apiFetch<Schedule[]>(url, {
    method: 'GET',
  });
}

/**
 * Get schedule detail by ID
 */
export async function getScheduleDetail(scheduleId: number): Promise<ApiResponse<Schedule>> {
  return apiFetch<Schedule>(`/api/schedules/${scheduleId}`, {
    method: 'GET',
  });
}

/**
 * Create new schedule
 */
export async function createSchedule(data: {
  groupId: number;
  userId: number;
  startTime: string; // ISO 8601 format
  endTime: string; // ISO 8601 format
  purpose: string;
}): Promise<ApiResponse<Schedule>> {
  return apiFetch<Schedule>('/api/schedules', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

/**
 * Update schedule
 */
export async function updateSchedule(
  scheduleId: number,
  data: {
    startTime?: string;
    endTime?: string;
    purpose?: string;
    status?: string;
  }
): Promise<ApiResponse<Schedule>> {
  return apiFetch<Schedule>(`/api/schedules/${scheduleId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

/**
 * Delete/cancel schedule
 */
export async function deleteSchedule(scheduleId: number): Promise<ApiResponse<string>> {
  return apiFetch<string>(`/api/schedules/${scheduleId}`, {
    method: 'DELETE',
  });
}

/**
 * Check-in: Start using vehicle
 */
export async function checkInSchedule(
  scheduleId: number,
  data: {
    batteryLevelBefore: number;
    notes?: string;
  }
): Promise<ApiResponse<Schedule>> {
  return apiFetch<Schedule>(`/api/schedules/${scheduleId}/check-in`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

/**
 * Check-out: Finish using vehicle
 */
export async function checkOutSchedule(
  scheduleId: number,
  data: {
    batteryLevelAfter: number;
    vehicleCondition: string;
    notes?: string;
  }
): Promise<ApiResponse<Schedule>> {
  return apiFetch<Schedule>(`/api/schedules/${scheduleId}/check-out`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

