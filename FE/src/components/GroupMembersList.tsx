'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getMembers, reviewMemberRequest, deleteMember } from '@/lib/api';
import { format } from 'date-fns';
import { Send, UserMinus, X } from 'lucide-react';
import SendCounterOfferModal from './SendCounterOfferModal';
import { z } from 'zod';
import {
  JoinStatus,
  CounterOfferStatus,
  Member,
  CounterOfferModalData,
  GroupMemberListProps
} from './types';
import { ApiResponse, ReviewMemberRequestParams } from '@/types/api';

// Zod schema for Member validation
const MemberSchema = z.object({
  id: z.number(),
  user: z.object({
    id: z.number(),
    fullName: z.string(),
    email: z.string().email()
  }),
  joinedAt: z.string(),
  ownershipPercentage: z.number(),
  counterOfferPercentage: z.number().optional(),
  counterOfferStatus: z.nativeEnum(CounterOfferStatus).optional(),
  reason: z.string().optional(),
  joinStatus: z.nativeEnum(JoinStatus)
});

  // Type declarations
  declare type MemberResponse = ApiResponse<Member[]>;
  declare type ActionResponse = ApiResponse<void>;
  declare type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

  interface State {
    loading: boolean;
    error: string | null;
    members: Member[];
    processingId: number | null;
    counterOfferModal: CounterOfferModalData | null;
  }

  interface Props extends GroupMemberListProps {
    state: State;
    setState: {
      setLoading: SetState<boolean>;
      setError: SetState<string | null>;
      setMembers: SetState<Member[]>;
      setProcessingId: SetState<number | null>;
      setCounterOfferModal: SetState<CounterOfferModalData | null>;
    };
  }// Create the component
'use client';

// Remove duplicate import of React
import { Card, CardContent, CircularProgress, Alert, List, ListItem, Button, Typography, Box } from '@mui/material';
import { getMembers } from '@/services/memberService';
import { reviewMemberRequest } from '@/lib/api';
import { type Member } from '@/types/member';
import { type MemberJoinStatusType, MemberJoinStatus } from '@/types/member';
import { CounterOfferModal } from './CounterOfferModal';

interface CounterOfferModalData {
  memberId: number;
  percentage: number;
}

export interface GroupMembersListProps {
  groupId: string;
  availablePercentage: number;
  currentUserId: string;
  isGroupOwner: boolean;
  onSuccess?: () => void;
}

export default function GroupMembersList(props: GroupMembersListProps): JSX.Element {
  const { groupId, availablePercentage, currentUserId, isGroupOwner, onSuccess } = props;
  
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [members, setMembers] = React.useState<Member[]>([]);
  const [processingId, setProcessingId] = React.useState<number | null>(null);
  const [counterOfferModal, setCounterOfferModal] = React.useState<CounterOfferModalData | null>(null);

  const fetchMembers = React.useCallback(async () => {
    setLoading(true);
    try {
      const members = await getMembers(parseInt(groupId));
      setMembers(members);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  React.useEffect(() => {
    void fetchMembers();
  }, [fetchMembers]);

  if (loading) {
    return <Card><CardContent><CircularProgress /></CardContent></Card>;
  }

  if (error) {
    return <Card><CardContent><Alert severity="error">{error}</Alert></CardContent></Card>;
  }

  if (!members.length) {
    return <Card><CardContent><Alert severity="info">No members found</Alert></CardContent></Card>;
  }

  return (
    <Card>
      <CardContent>
        <List>
          {members.map((member) => (
            <ListItem 
              key={member.id} 
              sx={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1,
                p: 2,
                bgcolor: 'background.paper',
                borderRadius: 1
              }}
            >
              <Box>
                <Typography variant="subtitle1">
                  {member.user.fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {member.ownershipPercentage}% ownership
                </Typography>
              </Box>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  // Fetch members
  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getMembers(groupId);
      if (!response || !response.success || !response.data) {
        throw new Error(response?.message || 'Không thể tải danh sách thành viên');
      }
      setMembers(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách thành viên');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  // Handle member actions
  const handleApprove = async (memberId: number) => {
    setProcessingId(memberId);
    try {
      const response = await reviewMemberRequest(groupId, memberId, { action: 'approve' });
      if (!response.success) {
        throw new Error(response.message);
      }
      await fetchMembers();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể duyệt yêu cầu');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (memberId: number) => {
    setProcessingId(memberId);
    try {
      const response = await reviewMemberRequest(groupId, memberId, { action: 'reject' });
      if (!response.success) {
        throw new Error(response.message);
      }
      await fetchMembers();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể từ chối yêu cầu');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRemove = async (memberId: number) => {
    setProcessingId(memberId);
    try {
      const response = await deleteMember(groupId, memberId);
      if (!response.success) {
        throw new Error(response.message);
      }
      await fetchMembers();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xóa thành viên');
    } finally {
      setProcessingId(null);
    }
  };

// Zod schema for Member validation
const MemberSchema = z.object({
  id: z.number(),
  user: z.object({
    id: z.number(),
    fullName: z.string(),
    email: z.string().email()
  }),
  joinedAt: z.string(),
  ownershipPercentage: z.number(),
  counterOfferPercentage: z.number().optional(),
  counterOfferStatus: z.nativeEnum(CounterOfferStatus).optional(),
  reason: z.string().optional(),
  joinStatus: z.nativeEnum(JoinStatus)
});

// Type declarations
export type GroupMembers = z.infer<typeof MemberSchema>[];

type GroupMemberListComponent = React.FC<GroupMemberListProps>;

// Main component
const GroupMembersList: GroupMemberListComponent = ({
  groupId,
  availablePercentage,
  currentUserId,
  isGroupOwner,
  onSuccess
}): JSX.Element => {

// Zod schema for Member validation
const MemberSchema = z.object({
  id: z.number(),
  user: z.object({
    id: z.number(),
    fullName: z.string(),
    email: z.string().email()
  }),
  joinedAt: z.string(),
  ownershipPercentage: z.number(),
  counterOfferPercentage: z.number().optional(),
  counterOfferStatus: z.nativeEnum(CounterOfferStatus).optional(),
  reason: z.string().optional(),
  joinStatus: z.nativeEnum(JoinStatus)
});

// Utility functions
const getJoinStatusColor = (status: JoinStatus): string => {
  switch (status) {
    case JoinStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800';
    case JoinStatus.APPROVED:
      return 'bg-green-100 text-green-800';
    case JoinStatus.REJECTED:
      return 'bg-red-100 text-red-800';
    case JoinStatus.OWNER:
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getJoinStatusLabel = (status: JoinStatus): string => {
  switch (status) {
    case JoinStatus.PENDING:
      return 'Chờ duyệt';
    case JoinStatus.APPROVED:
      return 'Đã chấp nhận';
    case JoinStatus.REJECTED:
      return 'Đã từ chối';
    case JoinStatus.OWNER:
      return 'Chủ sở hữu';
    default:
      return 'Không xác định';
  }
};

const formatDate = (dateStr: string): string => {
  try {
    return format(new Date(dateStr), 'dd/MM/yyyy HH:mm');
  } catch {
    return 'Invalid date';
  }
};
  isGroupOwner: boolean;
  onSuccess?: () => void;
}

// Utility functions
const getJoinStatusColor = (status: JoinStatus): string => {
  switch (status) {
    case JoinStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800';
    case JoinStatus.APPROVED:
      return 'bg-green-100 text-green-800';
    case JoinStatus.REJECTED:
      return 'bg-red-100 text-red-800';
    case JoinStatus.OWNER:
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getJoinStatusLabel = (status: JoinStatus): string => {
  switch (status) {
    case JoinStatus.PENDING:
      return 'Chờ duyệt';
    case JoinStatus.APPROVED:
      return 'Đã chấp nhận';
    case JoinStatus.REJECTED:
      return 'Đã từ chối';
    case JoinStatus.OWNER:
      return 'Chủ sở hữu';
    default:
      return 'Không xác định';
  }
};

const formatDate = (dateStr: string): string => {
  try {
    return format(new Date(dateStr), 'dd/MM/yyyy HH:mm');
  } catch {
    return 'Invalid date';
  }
};

const GroupMembersList = ({
  groupId,
  availablePercentage,
  currentUserId,
  isGroupOwner,
  onSuccess
}: GroupMemberListProps): React.ReactElement => {
  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<z.infer<typeof MemberSchema>[]>([]);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [counterOfferModal, setCounterOfferModal] = useState<CounterOfferModalData | null>(null);

  // Fetch members
  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getMembers(groupId);
      if (response.success) {
        const parsedMembers = MemberSchema.array().safeParse(response.data);
        if (!parsedMembers.success) {
          console.error('Invalid member data:', parsedMembers.error);
          setError('Dữ liệu thành viên không hợp lệ');
        } else {
          setMembers(parsedMembers.data);
          setError(null);
        }
      } else {
        setError(response.message);
      }
    } catch {
      setError('Không thể tải danh sách thành viên');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  // Handle member actions
  const handleApprove = async (memberId: number) => {
    setProcessingId(memberId);
    try {
      const response = await reviewMemberRequest(groupId, memberId, { action: 'approve' });
      if (response.success) {
        await fetchMembers();
        if (onSuccess) onSuccess();
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể duyệt yêu cầu');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (memberId: number) => {
    setProcessingId(memberId);
    try {
      const response = await reviewMemberRequest(groupId, memberId, { action: 'reject' });
      if (response.success) {
        await fetchMembers();
        if (onSuccess) onSuccess();
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể từ chối yêu cầu');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRemove = async (memberId: number) => {
    setProcessingId(memberId);
    try {
      const response = await deleteMember(groupId, memberId);
      if (response.success) {
        await fetchMembers();
        if (onSuccess) onSuccess();
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xóa thành viên');
    } finally {
      setProcessingId(null);
    }
  };

  // Effects
  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Calculate total ownership
  const totalOwnership = members.reduce((sum, member) => {
    return sum + (member.joinStatus === JoinStatus.APPROVED ? (member.ownershipPercentage || 0) : 0);
  }, 0);

  // Render loading state
  if (loading) {
    return <div className="text-center py-4">Đang tải...</div>;
  }

  // Render error state
  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  // Render empty state
  if (members.length === 0) {
    return <div className="text-center py-4">Chưa có thành viên nào trong nhóm</div>;
  }

  return (
    <div className="space-y-4">
      {members.map((member) => (
        <div
          key={member.id}
          className="bg-white p-4 rounded-lg shadow border flex items-center justify-between"
        >
          <div className="flex-grow">
            <div className="flex items-center gap-4">
              <h3 className="font-medium">{member.user.fullName}</h3>
              <span className={`text-sm px-2 py-1 rounded-full ${getJoinStatusColor(member.joinStatus)}`}>
                {getJoinStatusLabel(member.joinStatus)}
              </span>
            </div>
            <p className="text-sm text-gray-600">{member.user.email}</p>
            <p className="text-sm text-gray-600">
              Tỷ lệ sở hữu: {member.ownershipPercentage}%
              {member.counterOfferStatus === CounterOfferStatus.PENDING && (
                <span className="ml-2 text-yellow-600">
                  (Đề xuất: {member.counterOfferPercentage}%)
                </span>
              )}
            </p>
            <p className="text-sm text-gray-600">
              Tham gia: {formatDate(member.joinedAt)}
            </p>
          </div>

          {isGroupOwner && member.joinStatus !== JoinStatus.OWNER && (
            <div className="flex items-center gap-2">
              {member.joinStatus === JoinStatus.PENDING && (
                <>
                  <button
                    onClick={() => handleApprove(member.id)}
                    disabled={processingId === member.id}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleReject(member.id)}
                    disabled={processingId === member.id}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </>
              )}
              {member.joinStatus === JoinStatus.APPROVED && (
                <button
                  onClick={() => handleRemove(member.id)}
                  disabled={processingId === member.id}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                >
                  <UserMinus className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </div>
      ))}

      {counterOfferModal && (
        <SendCounterOfferModal
          groupId={groupId}
          modalData={counterOfferModal}
          onClose={() => setCounterOfferModal(null)}
          onSuccess={() => {
            setCounterOfferModal(null);
            fetchMembers();
            if (onSuccess) onSuccess();
          }}
        />
      )}
    </div>
  );
};

export default GroupMembersList;

const getJoinStatusColor = (status: JoinStatus): string => {
  switch (status) {
    case JoinStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800';
    case JoinStatus.APPROVED:
      return 'bg-green-100 text-green-800';
    case JoinStatus.REJECTED:
      return 'bg-red-100 text-red-800';
    case JoinStatus.OWNER:
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getJoinStatusLabel = (status: JoinStatus): string => {
  switch (status) {
    case JoinStatus.PENDING:
      return 'Chờ duyệt';
    case JoinStatus.APPROVED:
      return 'Đã chấp nhận';
    case JoinStatus.REJECTED:
      return 'Đã từ chối';
    case JoinStatus.OWNER:
      return 'Chủ sở hữu';
    default:
      return 'Không xác định';
  }
};

const formatDate = (dateStr: string): string => {
  try {
    return format(new Date(dateStr), 'dd/MM/yyyy HH:mm');
  } catch {
    return 'Invalid date';
  }
};

export enum JoinStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  OWNER = 'OWNER'
}

export enum CounterOfferStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  NONE = 'NONE'
}

interface User {
  id: number;
  fullName: string;
  email: string;
}

interface Member {
  id: number;
  user: User;
  joinedAt: string;
  ownershipPercentage: number;
  counterOfferPercentage?: number;
  counterOfferStatus?: CounterOfferStatus;
  reason?: string;
  joinStatus: JoinStatus;
}

interface CounterOfferModalData {
  memberId: number;
  memberName: string;
  proposedPercentage: number;
}

interface Props {
  groupId: string;
  availablePercentage: number;
  currentUserId: string;
  isGroupOwner: boolean;
  onSuccess?: () => void;
}

const getJoinStatusColor = (status: JoinStatus): string => {
  switch (status) {
    case JoinStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800';
    case JoinStatus.APPROVED:
      return 'bg-green-100 text-green-800';
    case JoinStatus.REJECTED:
      return 'bg-red-100 text-red-800';
    case JoinStatus.OWNER:
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getJoinStatusLabel = (status: JoinStatus): string => {
  switch (status) {
    case JoinStatus.PENDING:
      return 'Chờ duyệt';
    case JoinStatus.APPROVED:
      return 'Đã chấp nhận';
    case JoinStatus.REJECTED:
      return 'Đã từ chối';
    case JoinStatus.OWNER:
      return 'Chủ sở hữu';
    default:
      return 'Không xác định';
  }
};

const formatDate = (dateStr: string): string => {
  try {
    return format(new Date(dateStr), 'dd/MM/yyyy HH:mm');
  } catch {
    return 'Invalid date';
  }
};

const GroupMembersList: React.FC<Props> = ({
  groupId,
  availablePercentage = 0,
  currentUserId,
  isGroupOwner,
  onSuccess
}) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [owner, setOwner] = useState<Member | undefined>();
  const [pendingMembers, setPendingMembers] = useState<Member[]>([]);
  const [approvedMembers, setApprovedMembers] = useState<Member[]>([]);
  const [rejectedMembers, setRejectedMembers] = useState<Member[]>([]);
  const [counterOfferModal, setCounterOfferModal] = useState<CounterOfferModalData | null>(null);
  const [processingId, setProcessingId] = useState<number>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);

  // Load members
  const loadMembers = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const response = await getMembers(groupId);
      if (response.members) {
        setMembers(response.members);
        
        // Filter members by status
        setOwner(response.members.find(m => m.joinStatus === JoinStatus.OWNER));
        setPendingMembers(response.members.filter(m => m.joinStatus === JoinStatus.PENDING));
        setApprovedMembers(response.members.filter(m => m.joinStatus === JoinStatus.APPROVED));
        setRejectedMembers(response.members.filter(m => m.joinStatus === JoinStatus.REJECTED));
      }
    } catch (err) {
      setError('Failed to load members');
      console.error('Error loading members:', err);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  // Load initial data
  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  // Handle member review
  const handleReview = useCallback(async (memberId: number, action: 'approve' | 'reject', reason?: string) => {
    setProcessingId(memberId);
    try {
      await reviewMemberRequest(groupId, memberId, { action, reason });
      await loadMembers();
      onSuccess?.();
    } catch (err) {
      setError('Failed to review member request');
      console.error('Error reviewing member:', err);
    } finally {
      setProcessingId(undefined);
    }
  }, [groupId, loadMembers, onSuccess]);

  // Handle member removal
  const handleRemove = useCallback(async (memberId: number) => {
    setProcessingId(memberId);
    try {
      await deleteMember(groupId, memberId);
      await loadMembers();
      onSuccess?.();
    } catch (err) {
      setError('Failed to remove member');
      console.error('Error removing member:', err);
    } finally {
      setProcessingId(undefined);
    }
  }, [groupId, loadMembers, onSuccess]);

  // Handle counter offer
  const handleCounterOffer = useCallback((memberId: number, memberName: string, proposedPercentage: number) => {
    setCounterOfferModal({ memberId, memberName, proposedPercentage });
  }, []);

  // Calculate total ownership
  const totalOwnership = members.reduce((sum, member) => {
    if (member.joinStatus === JoinStatus.APPROVED || member.joinStatus === JoinStatus.OWNER) {
      return sum + (member.ownershipPercentage || 0);
    }
    return sum;
  }, 0);

  if (loading) {
    return <div className="text-center py-4">Loading members...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center py-4">{error}</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Owner Section */}
      {owner && (
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold mb-4">Chủ sở hữu</h3>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">{owner.user.fullName}</span>
              <span className="text-gray-500 ml-2">{owner.user.email}</span>
              <div className="text-sm text-gray-500">
                Tham gia: {formatDate(owner.joinedAt)}
              </div>
            </div>
            <div className="text-right">
              <span className={getJoinStatusColor(owner.joinStatus)}>
                {getJoinStatusLabel(owner.joinStatus)}
              </span>
              <div className="font-medium">{owner.ownershipPercentage}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Approved Members Section */}
      {approvedMembers.length > 0 && (
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold mb-4">Thành viên</h3>
          {approvedMembers.map(member => (
            <div key={member.id} className="flex items-center justify-between mb-4 last:mb-0">
              <div>
                <span className="font-medium">{member.user.fullName}</span>
                <span className="text-gray-500 ml-2">{member.user.email}</span>
                <div className="text-sm text-gray-500">
                  Tham gia: {formatDate(member.joinedAt)}
                </div>
              </div>
              <div className="text-right flex items-center gap-4">
                <span className={getJoinStatusColor(member.joinStatus)}>
                  {getJoinStatusLabel(member.joinStatus)}
                </span>
                <div className="font-medium">{member.ownershipPercentage}%</div>
                {isGroupOwner && member.user.id.toString() !== currentUserId && (
                  <button
                    onClick={() => handleRemove(member.id)}
                    disabled={processingId === member.id}
                    className="text-red-600 hover:text-red-800"
                  >
                    <UserMinus size={20} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pending Members Section */}
      {pendingMembers.length > 0 && isGroupOwner && (
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold mb-4">Yêu cầu tham gia</h3>
          {pendingMembers.map(member => (
            <div key={member.id} className="flex items-center justify-between mb-4 last:mb-0">
              <div>
                <span className="font-medium">{member.user.fullName}</span>
                <span className="text-gray-500 ml-2">{member.user.email}</span>
                <div className="text-sm text-gray-500">
                  Yêu cầu: {formatDate(member.joinedAt)}
                </div>
                <div className="font-medium">Đề xuất: {member.ownershipPercentage}%</div>
              </div>
              <div className="flex items-center gap-2">
                {processingId === member.id ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    {member.ownershipPercentage <= availablePercentage ? (
                      <button
                        onClick={() => handleReview(member.id, 'approve')}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Chấp nhận
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCounterOffer(member.id, member.user.fullName, member.ownershipPercentage)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        <Send size={20} />
                      </button>
                    )}
                    <button
                      onClick={() => handleReview(member.id, 'reject')}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <X size={20} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejected Members Section */}
      {rejectedMembers.length > 0 && isGroupOwner && (
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">Yêu cầu bị từ chối</h3>
          {rejectedMembers.map(member => (
            <div key={member.id} className="flex items-center justify-between mb-4 last:mb-0">
              <div>
                <span className="font-medium">{member.user.fullName}</span>
                <span className="text-gray-500 ml-2">{member.user.email}</span>
                <div className="text-sm text-gray-500">
                  Ngày yêu cầu: {formatDate(member.joinedAt)}
                </div>
                <div className="font-medium">Đề xuất: {member.ownershipPercentage}%</div>
                {member.reason && (
                  <div className="text-sm text-red-600">
                    Lý do từ chối: {member.reason}
                  </div>
                )}
              </div>
              <div className="text-right">
                <span className={getJoinStatusColor(member.joinStatus)}>
                  {getJoinStatusLabel(member.joinStatus)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {counterOfferModal && (
        <SendCounterOfferModal
          memberId={counterOfferModal.memberId}
          memberName={counterOfferModal.memberName}
          proposedPercentage={counterOfferModal.proposedPercentage}
          availablePercentage={availablePercentage}
          onClose={() => setCounterOfferModal(null)}
          onSuccess={() => {
            setCounterOfferModal(null);
            loadMembers();
            onSuccess?.();
          }}
          groupId={groupId}
        />
      )}

      <div className="p-4 bg-gray-50 border-t">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Tổng tỷ lệ sở hữu:</span>
          <span className="font-medium">{totalOwnership}%</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-gray-600">Tỷ lệ còn lại:</span>
          <span className="font-medium">{100 - totalOwnership}%</span>
        </div>
      </div>
    </div>
  );
}
      setProcessingId(null);
    }
  };

  const handleRemoveMember = async (memberId: number, memberName: string) => {
    if (!confirm(`Bạn có chắc muốn xóa ${memberName} khỏi nhóm?`)) {
      return;
    }

    setProcessingId(memberId);
    try {
      const response = await deleteMember(memberId);
      
      if (response.success) {
        await fetchMembers(); // Refresh list
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xóa thành viên');
    } finally {
      setProcessingId(null);
    }
  };

  const handleSendCounterOffer = (memberId: number, memberName: string, proposedPercentage: number) => {
    setCounterOfferModal({
      memberId,
      memberName,
      proposedPercentage,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get badge for member based on counterOfferStatus
  const getMemberBadge = (member: Member) => {
    if (member.counterOfferStatus === CounterOfferStatus.PENDING) {
      return {
        color: 'bg-orange-100 text-orange-800 border-orange-300',
        text: `🟠 Chờ phản hồi ${member.counterOfferPercentage}%`,
      };
    }
    if (member.counterOfferStatus === CounterOfferStatus.REJECTED) {
      return {
        color: 'bg-red-100 text-red-800 border-red-300',
        text: `🔴 Đã từ chối offer`,
      };
    }
    // Default: new request
    return {
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      text: '🔵 Yêu cầu mới',
    };
  };

  // Separate owner and regular members
  const owner = members.find(m => m.user.id === group?.createdBy);
  const pendingMembers = members.filter(m => m.joinStatus === 'Pending');
  const approvedMembers = members.filter(m => m.joinStatus === 'Approved' && m.user.id !== group?.createdBy);
  const rejectedMembers = members.filter(m => m.joinStatus === 'Rejected');

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8 flex justify-center">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8 flex justify-center">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

export default function GroupMembersList({ 
  groupId, 
  availablePercentage = 0,
  currentUserId,
  isGroupOwner,
  onSuccess
}: Props): JSX.Element {
  // State declarations
  const [members, setMembers] = useState<Member[]>([]);
  const [owner, setOwner] = useState<Member | undefined>();
  const [pendingMembers, setPendingMembers] = useState<Member[]>([]);
  const [approvedMembers, setApprovedMembers] = useState<Member[]>([]);
  const [rejectedMembers, setRejectedMembers] = useState<Member[]>([]);
  const [counterOfferModal, setCounterOfferModal] = useState<CounterOfferModalData | null>(null);
  const [processingId, setProcessingId] = useState<number>();
  const [error, setError] = useState<string>();

  // Load members
  const loadMembers = useCallback(async () => {
    try {
      const response = await getMembers(groupId);
      if (response.members) {
        setMembers(response.members);
        
        // Filter members by status
        setOwner(response.members.find(m => m.joinStatus === JoinStatus.OWNER));
        setPendingMembers(response.members.filter(m => m.joinStatus === JoinStatus.PENDING));
        setApprovedMembers(response.members.filter(m => m.joinStatus === JoinStatus.APPROVED));
        setRejectedMembers(response.members.filter(m => m.joinStatus === JoinStatus.REJECTED));
      }
    } catch (err) {
      setError('Failed to load members');
      console.error('Error loading members:', err);
    }
  }, [groupId]);
  const [members, setMembers] = useState<Member[]>([]);
  const [owner, setOwner] = useState<Member | undefined>(undefined);
  const [pendingMembers, setPendingMembers] = useState<Member[]>([]);
  const [approvedMembers, setApprovedMembers] = useState<Member[]>([]);
  const [rejectedMembers, setRejectedMembers] = useState<Member[]>([]);
  const [counterOfferModal, setCounterOfferModal] = useState<CounterOfferModalData | null>(null);
  const [processingId, setProcessingId] = useState<number>();
  const [error, setError] = useState<string>();
  const [members, setMembers] = useState<Member[]>([]);
  const [pendingMembers, setPendingMembers] = useState<Member[]>([]);
  const [approvedMembers, setApprovedMembers] = useState<Member[]>([]);
  const [rejectedMembers, setRejectedMembers] = useState<Member[]>([]);
  const [owner, setOwner] = useState<Member | undefined>();
  const [processingId, setProcessingId] = useState<number>();
  const [counterOfferModal, setCounterOfferModal] = useState<CounterOfferModalData | null>(null);
  const [error, setError] = useState<string>();
  const [members, setMembers] = useState<Member[]>([]);
  const [pendingMembers, setPendingMembers] = useState<Member[]>([]);
  const [approvedMembers, setApprovedMembers] = useState<Member[]>([]);
  const [rejectedMembers, setRejectedMembers] = useState<Member[]>([]);
  const [owner, setOwner] = useState<Member | undefined>(undefined);
  const [processingId, setProcessingId] = useState<string | undefined>(undefined);
  const [counterOfferModal, setCounterOfferModal] = useState<CounterOfferModalData | null>(null);
  const [error, setError] = useState<string | undefined>(undefined);

  const fetchMembers = useCallback(async () => {
    try {
      const response = await getMembers(groupId);
      const allMembers = response.data;
      
      setMembers(allMembers);
      setOwner(allMembers.find(m => m.joinStatus === JoinStatus.OWNER));
      setPendingMembers(allMembers.filter(m => m.joinStatus === JoinStatus.PENDING));
      setApprovedMembers(allMembers.filter(m => m.joinStatus === JoinStatus.APPROVED));
      setRejectedMembers(allMembers.filter(m => m.joinStatus === JoinStatus.REJECTED));
    } catch (error) {
      setError('Failed to load members');
    }
  }, [groupId]);

  const handleApprove = async (memberId: string, ownershipPercentage: number) => {
    setProcessingId(memberId);
    try {
      await reviewMemberRequest(groupId, memberId, { status: 'approved', ownershipPercentage });
      await fetchMembers();
      onSuccess?.();
    } catch (error) {
      setError('Failed to approve member');
    } finally {
      setProcessingId(undefined);
    }
  };

  const handleReject = async (memberId: string, reason: string) => {
    setProcessingId(memberId);
    try {
      await reviewMemberRequest(groupId, memberId, { status: 'rejected', reason });
      await fetchMembers();
    } catch (error) {
      setError('Failed to reject member');
    } finally {
      setProcessingId(undefined);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from the group?`)) {
      return;
    }

    setProcessingId(memberId);
    try {
      await deleteMember(groupId, memberId);
      await fetchMembers();
    } catch (error) {
      setError('Failed to remove member');
    } finally {
      setProcessingId(undefined);
    }
  };

  const handleSendCounterOffer = (memberId: string, memberName: string, proposedPercentage: number) => {
    setCounterOfferModal({
      memberId,
      memberName,
      proposedPercentage
    });
  };

  const getMemberBadge = (member: Member): MemberBadge => {
    if (member.counterOfferStatus === CounterOfferStatus.PENDING) {
      return { text: 'Pending Counter Offer', color: 'border-yellow-500 text-yellow-800' };
    }
    if (member.counterOfferStatus === CounterOfferStatus.REJECTED) {
      return { text: 'Counter Offer Rejected', color: 'border-red-500 text-red-800' };
    }
    return { text: 'Pending', color: 'border-yellow-500 text-yellow-800' };
  };

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">✗ {error}</p>
        </div>
      )}

      {/* Pending Requests */}
      {isGroupOwner && pendingMembers.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            Yêu cầu chờ duyệt ({pendingMembers.length})
          </h3>
          <div className="space-y-4">
            {pendingMembers.map((member) => {
              const badge = getMemberBadge(member);
              const isPendingResponse = member.counterOfferStatus === CounterOfferStatus.PENDING;
              const wasRejected = member.counterOfferStatus === CounterOfferStatus.REJECTED;
              
              return (
                <div key={member.id} className="border border-yellow-200 bg-yellow-50 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{member.user.fullName}</h4>
                      <p className="text-sm text-gray-600">{member.user.email}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
                      {badge.text}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">% Sở hữu đề xuất</p>
                      <p className="text-lg font-bold text-emerald-600">{member.ownershipPercentage}%</p>
                    </div>
                    {member.counterOfferPercentage && (
                      <div>
                        <p className="text-xs text-gray-500">Counter offer</p>
                        <p className="text-lg font-bold text-blue-600">{member.counterOfferPercentage}%</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-500">Ngày yêu cầu</p>
                      <p className="text-sm font-semibold">
                        {member.joinedAt ? formatDate(member.joinedAt.toString()) : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {member.reason && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Lý do tham gia:</p>
                      <p className="text-sm text-gray-700 bg-white p-3 rounded-lg">{member.reason}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {isPendingResponse ? (
                    <div className="mt-4 pt-4 border-t border-yellow-200">
                      <p className="text-sm text-gray-500 italic text-center">
                        Đang chờ member phản hồi counter offer...
                      </p>
                    </div>
                  ) : (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-yellow-200">
                      {!wasRejected && (
                        <button
                          onClick={() => handleApprove(member.id, member.ownershipPercentage)}
                          disabled={processingId === member.id}
                          className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium text-sm flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {processingId === member.id ? 'Đang xử lý...' : 'Chấp nhận'}
                        </button>
                      )}
                      <button
                        onClick={() => handleSendCounterOffer(member.id, member.user.fullName, member.ownershipPercentage)}
                        disabled={processingId === member.id}
                        className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium text-sm flex items-center justify-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        {wasRejected ? 'Gửi offer mới' : 'Counter Offer'}
                      </button>
                      {wasRejected && (
                        <button
                          onClick={() => handleApprove(member.id, member.ownershipPercentage)}
                          disabled={processingId === member.id}
                          className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium text-sm flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Approve {member.ownershipPercentage}%
                        </button>
                      )}
                      <button
                        onClick={() => handleReject(member.id, 'Không đủ điều kiện')}
                        disabled={processingId === member.id}
                        className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-medium text-sm flex items-center justify-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Từ chối
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Owner and Approved Members */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Thành viên nhóm ({(owner ? 1 : 0) + approvedMembers.length}/5)
        </h3>
        <div className="space-y-3">
          {owner && (
            <div key={owner.id} className="border border-emerald-200 bg-emerald-50 rounded-xl p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">{owner.user.fullName}</h4>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
                      Chủ nhóm
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{owner.user.email}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Tham gia: {owner.joinedAt ? formatDate(owner.joinedAt.toString()) : 'N/A'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Sở hữu</p>
                  <p className="text-2xl font-bold text-emerald-600">{owner.ownershipPercentage}%</p>
                </div>
              </div>
            </div>
          )}

          {/* Other Approved Members */}
          {approvedMembers.map((member) => (
            <div key={member.id} className="border border-green-200 bg-green-50 rounded-xl p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{member.user.fullName}</h4>
                  <p className="text-sm text-gray-600">{member.user.email}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Tham gia: {member.joinedAt ? formatDate(member.joinedAt.toString()) : 'N/A'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Sở hữu</p>
                  <p className="text-2xl font-bold text-green-600">{member.ownershipPercentage}%</p>
                </div>
              </div>
              
              {/* Remove Member Button */}
              {isGroupOwner && currentUserId !== member.user.id && (
                <div className="mt-4 pt-4 border-t border-green-200">
                  <button
                    onClick={() => handleRemoveMember(member.id, member.user.fullName)}
                    disabled={processingId === member.id}
                    className="w-full px-4 py-2 bg-red-100 text-red-700 border border-red-300 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <UserMinus className="w-4 h-4" />
                    {processingId === member.id ? 'Đang xóa...' : 'Xóa khỏi nhóm'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Rejected Members */}
      {isGroupOwner && rejectedMembers.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Yêu cầu đã từ chối ({rejectedMembers.length})
          </h3>
          <div className="space-y-3">
            {rejectedMembers.map((member) => (
              <div key={member.id} className="border border-red-200 bg-red-50 rounded-xl p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{member.user.fullName}</h4>
                    <p className="text-sm text-gray-600">{member.user.email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getJoinStatusColor(member.joinStatus)}`}>
                    {getJoinStatusLabel(member.joinStatus)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Đề xuất: {member.ownershipPercentage}%</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {members.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <p className="text-gray-500">Chưa có thành viên nào trong nhóm</p>
        </div>
      )}

      {/* Counter Offer Modal */}
      {counterOfferModal && (
        <SendCounterOfferModal
          groupId={groupId}
          memberId={counterOfferModal.memberId}
          memberName={counterOfferModal.memberName}
          proposedPercentage={counterOfferModal.proposedPercentage}
          availablePercentage={availablePercentage}
          isOpen={true}
          onClose={() => setCounterOfferModal(null)}
          onSuccess={() => {
            fetchMembers();
            setCounterOfferModal(null);
          }}
        />
      )}
    </div>
  );
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">✗ {error}</p>
        </div>
      )}

      {/* Pending Requests (only for group owner) */}
      {isGroupOwner && pendingMembers.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
            Yêu cầu chờ duyệt ({pendingMembers.length})
          </h3>
          <div className="space-y-4">
            {pendingMembers.map((member) => {
              const badge = getMemberBadge(member);
              const isPendingResponse = member.counterOfferStatus === CounterOfferStatus.PENDING;
              const wasRejected = member.counterOfferStatus === CounterOfferStatus.REJECTED;
              
              return (
                <div key={member.id} className="border border-yellow-200 bg-yellow-50 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{member.user.fullName}</h4>
                      <p className="text-sm text-gray-600">{member.user.email}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
                      {badge.text}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">% Sở hữu đề xuất</p>
                      <p className="text-lg font-bold text-emerald-600">{member.ownershipPercentage}%</p>
                    </div>
                    {member.counterOfferPercentage && (
                      <div>
                        <p className="text-xs text-gray-500">Counter offer</p>
                        <p className="text-lg font-bold text-blue-600">{member.counterOfferPercentage}%</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-500">Ngày yêu cầu</p>
                      <p className="text-sm font-semibold">{member.joinedAt ? formatDate(member.joinedAt) : 'N/A'}</p>
                    </div>
                  </div>

                  {member.reason && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Lý do tham gia:</p>
                      <p className="text-sm text-gray-700 bg-white p-3 rounded-lg">{member.reason}</p>
                    </div>
                  )}

                  {/* Action Buttons for Group Owner */}
                  {isPendingResponse ? (
                    // Waiting for member to respond - no actions
                    <div className="mt-4 pt-4 border-t border-yellow-200">
                      <p className="text-sm text-gray-500 italic text-center">
                        Đang chờ member phản hồi counter offer...
                      </p>
                    </div>
                  ) : (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-yellow-200">
                      {!wasRejected && (
                        <button
                          onClick={() => handleApprove(member.id, member.ownershipPercentage)}
                          disabled={processingId === member.id}
                          className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium text-sm flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {processingId === member.id ? 'Đang xử lý...' : 'Chấp nhận'}
                        </button>
                      )}
                      <button
                        onClick={() => handleSendCounterOffer(member.id, member.user.fullName, member.ownershipPercentage)}
                        disabled={processingId === member.id}
                        className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium text-sm flex items-center justify-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        {wasRejected ? 'Gửi offer mới' : 'Counter Offer'}
                      </button>
                      {wasRejected && (
                        <button
                          onClick={() => handleApprove(member.id, member.ownershipPercentage)}
                          disabled={processingId === member.id}
                          className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium text-sm flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Approve {member.ownershipPercentage}%
                        </button>
                      )}
                      <button
                        onClick={() => handleReject(member.id, 'Không đủ điều kiện')}
                        disabled={processingId === member.id}
                        className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-medium text-sm flex items-center justify-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Từ chối
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Owner and Approved Members */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Thành viên nhóm ({(owner ? 1 : 0) + approvedMembers.length}/5)
        </h3>
        <div className="space-y-3">
          {/* Show Owner First */}
          {owner && (
            <div key={owner.id} className="border border-emerald-200 bg-emerald-50 rounded-xl p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">{owner.user.fullName}</h4>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
                      Chủ nhóm
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{owner.user.email}</p>
                  <p className="text-xs text-gray-500 mt-2">Tham gia: {owner.joinedAt ? formatDate(owner.joinedAt) : 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Sở hữu</p>
                  <p className="text-2xl font-bold text-emerald-600">{owner.ownershipPercentage}%</p>
                </div>
              </div>
            </div>
          )}

          {/* Other Approved Members */}
          {approvedMembers.map((member) => (
              <div key={member.id} className="border border-green-200 bg-green-50 rounded-xl p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{member.user.fullName}</h4>
                    <p className="text-sm text-gray-600">{member.user.email}</p>
                    <p className="text-xs text-gray-500 mt-2">Tham gia: {member.joinedAt ? formatDate(member.joinedAt) : 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Sở hữu</p>
                    <p className="text-2xl font-bold text-green-600">{member.ownershipPercentage}%</p>
                  </div>
                </div>
                
                {/* Remove Member Button (Only for group owner, not for themselves) */}
                {isGroupOwner && currentUserId !== member.user.id && (
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <button
                      onClick={() => handleRemoveMember(member.id, member.user.fullName)}
                      disabled={processingId === member.id}
                      className="w-full px-4 py-2 bg-red-100 text-red-700 border border-red-300 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 font-medium text-sm flex items-center justify-center gap-2"
                    >
                      <UserMinus className="w-4 h-4" />
                      {processingId === member.id ? 'Đang xóa...' : 'Xóa khỏi nhóm'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Owner and Approved Members */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Thành viên nhóm ({(owner ? 1 : 0) + approvedMembers.length}/5)
        </h3>
        <div className="space-y-3">
          {owner && (
            <div key={owner.id} className="border border-emerald-200 bg-emerald-50 rounded-xl p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">{owner.user.fullName}</h4>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
                      Chủ nhóm
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{owner.user.email}</p>
                  <p className="text-xs text-gray-500 mt-2">Tham gia: {owner.joinedAt ? formatDate(owner.joinedAt) : 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Sở hữu</p>
                  <p className="text-2xl font-bold text-emerald-600">{owner.ownershipPercentage}%</p>
                </div>
              </div>
            </div>
          )}

          {/* Other Approved Members */}
          {approvedMembers.map((member) => (
            <div key={member.id} className="border border-green-200 bg-green-50 rounded-xl p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{member.user.fullName}</h4>
                  <p className="text-sm text-gray-600">{member.user.email}</p>
                  <p className="text-xs text-gray-500 mt-2">Tham gia: {member.joinedAt ? formatDate(member.joinedAt) : 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Sở hữu</p>
                  <p className="text-2xl font-bold text-green-600">{member.ownershipPercentage}%</p>
                </div>
              </div>
              
              {/* Remove Member Button (Only for group owner, not for themselves) */}
              {isGroupOwner && currentUserId !== member.user.id && (
                <div className="mt-4 pt-4 border-t border-green-200">
                  <button
                    onClick={() => handleRemoveMember(member.id, member.user.fullName)}
                    disabled={processingId === member.id}
                    className="w-full px-4 py-2 bg-red-100 text-red-700 border border-red-300 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <UserMinus className="w-4 h-4" />
                    {processingId === member.id ? 'Đang xóa...' : 'Xóa khỏi nhóm'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Rejected Members (only visible to group owner) */}
      {isGroupOwner && rejectedMembers.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Yêu cầu đã từ chối ({rejectedMembers.length})
          </h3>
          <div className="space-y-3">
            {rejectedMembers.map((member) => (
              <div key={member.id} className="border border-red-200 bg-red-50 rounded-xl p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{member.user.fullName}</h4>
                    <p className="text-sm text-gray-600">{member.user.email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getJoinStatusColor(member.joinStatus)}`}>
                    {getJoinStatusLabel(member.joinStatus)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Đề xuất: {member.ownershipPercentage}%</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {members.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <p className="text-gray-500">Chưa có thành viên nào trong nhóm</p>
        </div>
      )}

      {/* Counter Offer Modal */}
      {counterOfferModal && (
        <SendCounterOfferModal
          groupId={groupId}
          memberId={counterOfferModal.memberId}
          memberName={counterOfferModal.memberName}
          proposedPercentage={counterOfferModal.proposedPercentage}
          availablePercentage={availablePercentage}
          isOpen={true}
          onClose={() => setCounterOfferModal(null)}
          onSuccess={() => {
            fetchMembers();
            setCounterOfferModal(null);
          }}
        />
      )}
    </div>
  );
    </div>
  );
}
