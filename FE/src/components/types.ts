// Common Enums
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

// User related interfaces
export interface User {
  id: number;
  fullName: string;
  email: string;
}

// Member related interfaces
export interface Member {
  id: number;
  user: User;
  joinedAt: string;
  ownershipPercentage: number;
  counterOfferPercentage?: number;
  counterOfferStatus?: CounterOfferStatus;
  reason?: string;
  joinStatus: JoinStatus;
}

// Modal related interfaces
export interface CounterOfferModalData {
  memberId: number;
  memberName: string;
  proposedPercentage: number;
}

// Component Props interfaces
export interface GroupMemberListProps {
  groupId: string;
  availablePercentage: number;
  currentUserId: string;
  isGroupOwner: boolean;
  onSuccess?: () => void;
}

export interface SendCounterOfferModalProps {
  groupId: string;
  modalData: CounterOfferModalData | null;
  onClose: () => void;
  onSuccess?: () => void;
}