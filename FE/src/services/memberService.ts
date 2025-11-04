import { apiClient } from '@/lib/apiClient';
import {
  MembersResponseSchema,
  MemberResponseSchema,
  type Member,
  type CreateMemberRequest,
  type UpdateMemberRequest,
} from '@/types/member';

// ============================================================================
// MEMBER API SERVICE
// ============================================================================

/**
 * Get all members
 * GET /api/members
 */
export async function getMembers(groupId?: number): Promise<Member[]> {
  const params = new URLSearchParams();
  if (groupId) {
    params.append('groupId', groupId.toString());
  }

  const queryString = params.toString();
  const url = queryString ? `/api/members?${queryString}` : '/api/members';
  const response = await apiClient.get<Member[]>(url, { schema: MembersResponseSchema });
  return response.data;
}

/**
 * Get single member by ID
 * GET /api/members/{id}
 */
export async function getMemberById(id: number): Promise<Member> {
  const response = await apiClient.get<Member>(`/api/members/${id}`, { schema: MemberResponseSchema });
  return response.data;
}

/**
 * Create new member (join request)
 * POST /api/members
 */
export async function createMember(data: CreateMemberRequest): Promise<Member> {
  const response = await apiClient.post<Member>('/api/members', { 
    data, 
    schema: MemberResponseSchema 
  });
  return response.data;
}

/**
 * Update member (approve/reject/counter-offer)
 * PUT /api/members/{id}
 */
export async function updateMember(id: number, data: UpdateMemberRequest): Promise<Member> {
  const response = await apiClient.put<Member>(`/api/members/${id}`, { 
    data, 
    schema: MemberResponseSchema 
  });
  return response.data;
}

/**
 * Patch member (partial update)
 * PATCH /api/members/{id}
 */
export async function patchMember(id: number, data: Partial<UpdateMemberRequest>): Promise<Member> {
  const response = await apiClient.patch<Member>(`/api/members/${id}`, { 
    data, 
    schema: MemberResponseSchema 
  });
  return response.data;
}

/**
 * Delete member (remove from group)
 * DELETE /api/members/{id}
 */
export async function deleteMember(id: number): Promise<void> {
  await apiClient.delete(`/api/members/${id}`);
}

/**
 * Get members of a specific group
 */
export async function getGroupMembers(groupId: number): Promise<Member[]> {
  return getMembers(groupId);
}

/**
 * Get pending member requests (for group owner to review)
 */
export async function getPendingMemberRequests(groupId: number): Promise<Member[]> {
  const members = await getMembers(groupId);
  return members.filter((m) => m.joinStatus === 'Pending');
}

/**
 * Approve member request
 */
export async function approveMemberRequest(
  memberId: number,
  approvedPercentage?: number
): Promise<Member> {
  return updateMember(memberId, {
    joinStatus: 'Approved',
    ownershipPercentage: approvedPercentage,
  });
}

/**
 * Reject member request
 */
export async function rejectMemberRequest(
  memberId: number,
  reason?: string
): Promise<Member> {
  return updateMember(memberId, {
    joinStatus: 'Rejected',
    rejectReason: reason,
  });
}

/**
 * Send counter offer to member
 */
export async function sendCounterOffer(
  memberId: number,
  counterOfferPercentage: number
): Promise<Member> {
  return updateMember(memberId, {
    joinStatus: 'Counter Offered',
    counterOfferPercentage,
  });
}

/**
 * Accept counter offer (by member)
 */
export async function acceptCounterOffer(memberId: number): Promise<Member> {
  return patchMember(memberId, {
    counterOfferStatus: 'Accepted',
  });
}

/**
 * Reject counter offer (by member)
 */
export async function rejectCounterOffer(memberId: number): Promise<Member> {
  return patchMember(memberId, {
    counterOfferStatus: 'Rejected',
  });
}

/**
 * Respond to counter offer (new API from backend)
 */
export async function respondToCounterOffer(
  groupId: number,
  memberId: number,
  accept: boolean
): Promise<Member> {
  const response = await apiClient.post<Member>(
    `/api/groups/${groupId}/members/${memberId}/respond-counter-offer`,
    {
      data: { accept },
      schema: MemberResponseSchema,
    }
  );
  return response.data;
}

/**
 * Leave group
 */
export async function leaveGroup(groupId: number): Promise<void> {
  await apiClient.post(`/api/groups/${groupId}/leave`);
}

/**
 * Get available ownership
 */
export async function getAvailableOwnership(groupId: number): Promise<number> {
  const response = await apiClient.get<number>(`/api/groups/${groupId}/available-ownership`);
  return response.data;
}
