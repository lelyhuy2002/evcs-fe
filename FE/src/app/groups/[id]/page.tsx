'use client';

import { useState, useEffect } from 'react';
import { getGroupDetail, getMyOwnership, leaveGroup, getSchedules, getGroupMembers, updateGroupStatus, Group, Member, Schedule } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import JoinGroupModal from '@/components/JoinGroupModal';
import CounterOfferModal from '@/components/CounterOfferModal';
import { Users, LogOut, AlertCircle, Calendar, Clock, ChevronRight, Lock } from 'lucide-react';

interface GroupWithStats extends Group {
  actualMembersCount?: number;
  actualOwnership?: number;
}

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const groupId = params.id as string;
  
  const [group, setGroup] = useState<GroupWithStats | null>(null);
  const [myMembership, setMyMembership] = useState<Member | null>(null);
  const [upcomingSchedules, setUpcomingSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCounterOfferModal, setShowCounterOfferModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [leavingGroup, setLeavingGroup] = useState(false);
  const [pendingMembersCount, setPendingMembersCount] = useState(0);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchGroupDetail = async () => {
    setLoading(true);
    setError('');
    let isGroupLoaded = false;
    
    try {
      // Try to get full group details (works if user is member)
      const response = await getGroupDetail(Number(groupId));
      
      if (response.success && response.data) {
        setGroup(response.data);
        isGroupLoaded = true;
      }
    } catch (err) {
      // If error is "not a member", try to fetch from groups list API
      console.warn('Cannot fetch full group details, fetching from groups list...', err);
      
      try {
        // Fetch all groups and find this one (public info)
        const { getAllGroups } = await import('@/lib/api');
        const allGroupsResponse = await getAllGroups();
        
        if (allGroupsResponse.success && allGroupsResponse.data) {
          const foundGroup = allGroupsResponse.data.find(g => g.id === Number(groupId));
          if (foundGroup) {
            setGroup(foundGroup);
            isGroupLoaded = true;
          }
        }
      } catch (fallbackErr) {
        console.error('Error fetching group from list:', fallbackErr);
      }
    }

    // If we still can't load the group, show error
    if (!isGroupLoaded) {
      setError('Không thể tải thông tin nhóm. Nhóm có thể không tồn tại hoặc đã bị xóa.');
      setLoading(false);
      return;
    }

    // Fetch members to get accurate stats
    try {
      const membersResponse = await getGroupMembers(Number(groupId));
      if (membersResponse.success && membersResponse.data) {
        // Calculate actual members count (approved members only)
        const approvedMembers = membersResponse.data.filter(
          (m: Member) => m.joinStatus === 'Approved'
        );
        const actualMembersCount = approvedMembers.length;
        
        // Calculate actual ownership (sum of approved members' ownership)
        const actualOwnership = approvedMembers.reduce(
          (sum: number, m: Member) => sum + (m.ownershipPercentage || 0),
          0
        );
        
        // Update group with actual stats
        setGroup(prev => prev ? {
          ...prev,
          actualMembersCount,
          actualOwnership
        } : null);
        
        // Count pending members for owner
        const groupWithId = group as GroupWithStats & { createdById?: number };
        if (user && user.userId === (groupWithId.createdById || group?.createdBy)) {
          const pendingCount = membersResponse.data.filter(
            m => m.joinStatus === 'Pending' || m.counterOfferStatus === 'pending_user_response'
          ).length;
          setPendingMembersCount(pendingCount);
        }
      }
    } catch (err) {
      console.log('Cannot fetch members:', err);
    }

    // Fetch my membership status (optional)
    if (user) {
      try {
        const membershipResponse = await getMyOwnership(Number(groupId));
        if (membershipResponse.success && membershipResponse.data) {
          setMyMembership(membershipResponse.data);
        }
      } catch {
        // User is not a member, which is fine
        console.log('User is not a member of this group');
      }
    }

    // Fetch upcoming schedules (only if user is member)
    if (user) {
      try {
        const schedulesResponse = await getSchedules(Number(groupId));
        if (schedulesResponse.success && schedulesResponse.data) {
          const now = new Date();
          const upcoming = schedulesResponse.data
            .filter(s => new Date(s.startTime) > now && s.status !== 'cancelled')
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
            .slice(0, 3); // Get next 3 bookings
          setUpcomingSchedules(upcoming);
        }
      } catch (err) {
        // User is not a member, cannot see schedules
        console.log('Cannot fetch schedules - user is not a member');
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    if (groupId) {
      fetchGroupDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const handleLeaveGroup = async () => {
    if (!confirm('Bạn có chắc muốn rời khỏi nhóm này?')) return;
    
    setLeavingGroup(true);
    try {
      const response = await leaveGroup(Number(groupId));
      if (response.success) {
        setSuccessMessage('Đã rời nhóm thành công!');
        setTimeout(() => {
          router.push('/groups');
        }, 2000);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể rời nhóm');
    } finally {
      setLeavingGroup(false);
    }
  };

  const handleCounterOfferResponse = async () => {
    // Refresh data after counter offer response
    await fetchGroupDetail();
    setShowCounterOfferModal(false);
    setSuccessMessage('Đã phản hồi counter offer thành công!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleJoinSuccess = () => {
    setSuccessMessage('Yêu cầu tham gia đã được gửi! Chờ chủ nhóm phê duyệt.');
    setTimeout(() => {
      setSuccessMessage('');
      fetchGroupDetail(); // Refresh group data
    }, 3000);
  };

  const handleToggleStatus = async () => {
    if (!group) return;
    
    setUpdatingStatus(true);
    try {
      // Toggle between "locked" and "recruiting"
      const newStatus = group.status?.toLowerCase() === 'locked' ? 'recruiting' : 'locked';
      const response = await updateGroupStatus(Number(groupId), {
        status: newStatus
      });
      
      if (response.success && response.data) {
        setGroup(prev => prev ? { ...prev, status: response.data.status } : null);
        setSuccessMessage(`Trạng thái đã được đổi thành ${newStatus === 'locked' ? 'Locked' : 'Recruiting'}!`);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể cập nhật trạng thái');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const canJoinGroup = () => {
    if (!user) {
      console.log('canJoinGroup: No user logged in');
      return false;
    }
    if (!group) {
      console.log('canJoinGroup: No group data');
      return false;
    }
    
    // Check if user is the owner - cannot join own group
    const creatorId = (group as GroupWithStats & { createdById?: number }).createdById || group.createdBy;
    console.log('canJoinGroup - Owner check:', { 
      userId: user.userId, 
      createdById: (group as GroupWithStats & { createdById?: number }).createdById,
      createdBy: group.createdBy, 
      creatorId,
      isOwner: user.userId === creatorId 
    });
    
    if (user.userId === creatorId) {
      console.log('canJoinGroup: User is the owner, cannot join own group');
      return false;
    }
    
    // Check approval status (case-insensitive)
    if (group.approvalStatus?.toLowerCase() !== 'approved') {
      console.log('canJoinGroup: Group not approved, status:', group.approvalStatus);
      return false;
    }
    
    // Check if group is locked
    if (group.status?.toLowerCase() === 'locked') {
      console.log('canJoinGroup: Group is locked');
      return false;
    }
    
    const currentOwnership = group.actualOwnership ?? group.currentOwnership;
    if (currentOwnership >= 100) {
      console.log('canJoinGroup: Group is full, ownership:', currentOwnership);
      return false;
    }
    
    // Check if user already has membership (even pending)
    if (myMembership) {
      console.log('canJoinGroup: User already has membership, status:', myMembership.joinStatus);
      return false;
    }
    
    console.log('canJoinGroup: User CAN join!');
    return true;
  };

  const getStatusColor = (status: string, isLocked?: boolean) => {
    // If locked, always show red
    if (isLocked) {
      return 'bg-red-100 text-red-700';
    }
    
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'closed':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  const getApprovalColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-emerald-100 text-emerald-700';
      case 'pending':
        return 'bg-orange-100 text-orange-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md text-center">
          <p className="text-red-800 font-medium mb-4">{error || 'Không tìm thấy nhóm'}</p>
          <button
            onClick={() => router.push('/groups')}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/groups')}
          className="mb-6 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
        >
          ← Quay lại danh sách nhóm
        </button>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl animate-fadeIn">
            <p className="text-green-800 font-medium">✓ {successMessage}</p>
          </div>
        )}

        {/* Counter Offer Alert for Member */}
        {myMembership && myMembership.counterOfferStatus === 'pending_user_response' && (
          <div className="mb-6 p-6 bg-orange-50 border-2 border-orange-300 rounded-2xl animate-fadeIn shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-orange-900 mb-2">
                  Bạn có đề xuất ngược từ chủ nhóm!
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white rounded-lg p-4 border border-orange-200">
                    <p className="text-xs text-gray-600 mb-1">Bạn đề xuất</p>
                    <p className="text-3xl font-bold text-gray-900">{myMembership.proposedOwnershipPercentage}%</p>
                  </div>
                  <div className="bg-orange-100 rounded-lg p-4 border-2 border-orange-400">
                    <p className="text-xs text-orange-700 mb-1 font-semibold">Chủ nhóm đề xuất</p>
                    <p className="text-3xl font-bold text-orange-900">{myMembership.counterOfferPercentage}%</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCounterOfferModal(true)}
                  className="w-full px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-semibold shadow-md hover:shadow-xl flex items-center justify-center gap-2"
                >
                  Phản hồi ngay
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Member Status Banner */}
        {myMembership && (
          <div className="mb-6">
            {myMembership.joinStatus === 'Approved' && (
              <div className="bg-green-50 border border-green-300 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-green-900">Bạn là thành viên của nhóm</h3>
                      <p className="text-sm text-green-700">
                        Sở hữu: <strong>{myMembership.ownershipPercentage}%</strong>
                        {myMembership.counterOfferStatus === 'accepted' && myMembership.counterOfferPercentage && (
                          <span className="ml-2 text-xs">
                            (Đàm phán: {myMembership.proposedOwnershipPercentage}% → {myMembership.counterOfferPercentage}%)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => router.push(`/groups/${groupId}/members`)}
                      className="px-4 py-2 bg-white border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-colors font-semibold flex items-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      Xem thành viên
                    </button>
                    {user?.userId !== group?.createdBy && (
                      <button
                        onClick={handleLeaveGroup}
                        disabled={leavingGroup}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center gap-2 disabled:opacity-50"
                      >
                        <LogOut className="w-4 h-4" />
                        {leavingGroup ? 'Đang rời...' : 'Rời nhóm'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {myMembership.joinStatus === 'Pending' && !myMembership.counterOfferStatus && (
              <div className="bg-blue-50 border border-blue-300 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-blue-900">Yêu cầu đang chờ xét duyệt</h3>
                    <p className="text-sm text-blue-700">
                      Bạn đã đề xuất sở hữu <strong>{myMembership.proposedOwnershipPercentage}%</strong>. Chờ chủ nhóm phê duyệt.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {myMembership.counterOfferStatus === 'rejected_by_member' && (
              <div className="bg-yellow-50 border border-yellow-300 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-yellow-900">Đang chờ xét duyệt lại</h3>
                    <p className="text-sm text-yellow-700">
                      Bạn đã từ chối counter offer. Chờ chủ nhóm xem xét lại yêu cầu của bạn.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Header */}
        <div className="bg-linear-to-r from-emerald-500 to-blue-500 rounded-2xl shadow-lg p-8 text-white mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{group.name}</h1>
              <p className="text-lg text-white/90">{group.description}</p>
            </div>
            <div className="flex gap-3">
              {/* View Schedules Button - Show for approved members */}
              {myMembership && myMembership.joinStatus === 'Approved' && (
                <button
                  onClick={() => router.push(`/groups/${groupId}/schedules`)}
                  className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all font-semibold shadow-md hover:shadow-lg flex items-center gap-2 border border-white/30"
                >
                  <Calendar className="w-5 h-5" />
                  Lịch đặt xe
                </button>
              )}
              
              {/* Join Button - Show only if user can join */}
              {(() => {
                const shouldShowJoinButton = canJoinGroup();
                console.log('Rendering Join Button?', shouldShowJoinButton);
                return shouldShowJoinButton ? (
                  <button
                    onClick={() => setShowJoinModal(true)}
                    className="px-6 py-3 bg-white text-emerald-600 rounded-xl hover:bg-gray-50 transition-colors font-semibold shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Tham gia nhóm
                  </button>
                ) : null;
              })()}
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(group.status, group.isLocked)} bg-white/90`}>
              {group.isLocked ? 'Locked' : group.status}
            </span>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getApprovalColor(group.approvalStatus)} bg-white/90`}>
              {group.approvalStatus}
            </span>
          </div>
        </div>

        {/* Owner Controls - Toggle Status */}
        {(() => {
          // API returns createdById, not createdBy
          const creatorId = (group as GroupWithStats & { createdById?: number }).createdById || group.createdBy;
          const isOwner = user?.userId === creatorId;
          
          if (!isOwner) return null;
          
          return (
            <div className="mb-6 bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quản lý trạng thái nhóm</h3>
              
              {/* Single Toggle for Status (locked <-> recruiting) */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                <div className="flex items-center gap-3">
                  {group.status?.toLowerCase() === 'locked' ? (
                    <Lock className="w-6 h-6 text-red-600" />
                  ) : (
                    <Users className="w-6 h-6 text-green-600" />
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">
                      {group.status?.toLowerCase() === 'locked' ? 'Nhóm đã khóa' : 'Đang tuyển thành viên'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {group.status?.toLowerCase() === 'locked'
                        ? 'Không ai có thể tham gia nhóm'
                        : 'Nhóm đang mở để tuyển thành viên mới'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleToggleStatus}
                  disabled={updatingStatus}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    group.status?.toLowerCase() === 'locked'
                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
                      : 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg'
                  } disabled:opacity-50`}
                >
                  {updatingStatus ? 'Đang xử lý...' : group.status?.toLowerCase() === 'locked' ? 'Mở tuyển thành viên' : 'Khóa nhóm'}
                </button>
              </div>
              
              <p className="mt-4 text-sm text-gray-600">
                💡 <strong>Lưu ý:</strong> Khi khóa nhóm, các thành viên mới sẽ không thể gửi yêu cầu tham gia.
              </p>
            </div>
          );
        })()}

        {/* Info Banner for Non-Members */}
        {!myMembership && user && user.userId !== group.createdBy && group.approvalStatus?.toLowerCase() === 'approved' && !group.isLocked && (group.actualOwnership ?? group.currentOwnership) < 100 && (
          <div className="mb-6 bg-blue-50 border-2 border-blue-300 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-blue-900 mb-2">
                  Bạn chưa phải là thành viên của nhóm này
                </h3>
                <p className="text-sm text-blue-700 mb-4">
                  Nhóm này đang mở cho thành viên mới! Còn <strong>{100 - (group.actualOwnership ?? group.currentOwnership)}%</strong> quyền sở hữu khả dụng.
                  Tham gia ngay để đồng sở hữu xe điện này.
                </p>
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Gửi yêu cầu tham gia
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vehicle Information */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin phương tiện</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Hãng xe</label>
                    <p className="text-lg font-semibold text-gray-900">{group.vehicleBrand}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Model</label>
                    <p className="text-lg font-semibold text-gray-900">{group.vehicleModel}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Biển số xe</label>
                    <p className="text-lg font-semibold text-gray-900 font-mono bg-gray-50 px-4 py-2 rounded-lg inline-block">
                      {group.vehicleLicensePlate}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">ID Phương tiện</label>
                    <p className="text-lg font-semibold text-gray-900">#{group.vehicleId}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ownership Details */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin sở hữu</h2>
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-emerald-50 rounded-xl p-4">
                    <p className="text-sm text-emerald-700 mb-1">Thành viên</p>
                    <p className="text-3xl font-bold text-emerald-900">
                      {group.actualMembersCount ?? group.currentMembers} / {group.maxMembers}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-sm text-blue-700 mb-1">Sở hữu tối thiểu</p>
                    <p className="text-3xl font-bold text-blue-900">{group.minOwnershipPercentage}%</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4">
                    <p className="text-sm text-purple-700 mb-1">Đã sở hữu</p>
                    <p className="text-3xl font-bold text-purple-900">{group.actualOwnership ?? group.currentOwnership}%</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Tiến độ sở hữu</span>
                    <span className="font-semibold">{group.actualOwnership ?? group.currentOwnership}% / 100%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-linear-to-r from-emerald-500 to-blue-500 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${group.actualOwnership ?? group.currentOwnership}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Còn lại {100 - (group.actualOwnership ?? group.currentOwnership)}% chưa được sở hữu
                  </p>
                </div>
              </div>
            </div>

            {/* Rejection Reason */}
            {group.rejectReason && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-red-900 mb-2">Lý do từ chối</h2>
                <p className="text-red-800">{group.rejectReason}</p>
              </div>
            )}
          </div>

          {/* Right Column - Financial & Meta */}
          <div className="lg:col-span-1 space-y-6">
            {/* Estimated Value */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="bg-linear-to-br from-emerald-50 to-emerald-100 rounded-xl p-6">
                <p className="text-sm text-emerald-700 mb-2">Giá trị ước tính</p>
                <p className="text-3xl font-bold text-emerald-900">
                  {formatCurrency(group.estimatedValue)}
                </p>
              </div>
            </div>

            {/* Contract */}
            {group.contractUrl && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <a
                  href={group.contractUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-semibold shadow-md hover:shadow-lg"
                >
                  📄 Xem hợp đồng
                </a>
              </div>
            )}

            {/* Group Metadata */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Thông tin khác</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">ID Nhóm</p>
                  <p className="font-semibold text-gray-900">#{group.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Người tạo</p>
                  <p className="font-semibold text-gray-900">{group.createdByName}</p>
                  <p className="text-xs text-gray-500">ID: {group.createdBy}</p>
                </div>
                {group.approvedBy > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Người phê duyệt</p>
                    <p className="font-semibold text-gray-900">{group.approvedByName}</p>
                    <p className="text-xs text-gray-500">ID: {group.approvedBy}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Ngày tạo</p>
                  <p className="font-semibold text-gray-900">{formatDate(group.createdAt)}</p>
                </div>
                
                {/* Owner: Link to Members Management */}
                {user?.userId === group.createdBy && (
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => router.push(`/groups/${groupId}/members`)}
                      className="w-full px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg relative"
                    >
                      <Users className="w-5 h-5" />
                      Quản lý thành viên
                      {pendingMembersCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center font-bold animate-pulse">
                          {pendingMembersCount}
                        </span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Schedule/Booking Section - Only for members */}
            {myMembership && myMembership.joinStatus === 'Approved' && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Lịch đặt xe</h2>
                  {upcomingSchedules.length > 0 && (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
                      {upcomingSchedules.length} sắp tới
                    </span>
                  )}
                </div>

                {/* Upcoming Schedules Preview */}
                {upcomingSchedules.length > 0 ? (
                  <div className="space-y-3 mb-4">
                    {upcomingSchedules.map((schedule) => (
                      <div
                        key={schedule.scheduleId}
                        className="bg-gray-50 rounded-xl p-3 border-l-4"
                        style={{ borderLeftColor: schedule.userColor || '#10b981' }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{schedule.userName}</p>
                            <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(schedule.startTime).toLocaleDateString('vi-VN', { 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</span>
                            </div>
                            {schedule.purpose && (
                              <p className="text-xs text-gray-500 mt-1 truncate">{schedule.purpose}</p>
                            )}
                          </div>
                          <span className={`px-2 py-1 rounded-md text-xs font-medium shrink-0 ${
                            schedule.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                            schedule.status === 'in_progress' ? 'bg-green-100 text-green-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {schedule.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Chưa có lịch đặt xe sắp tới</p>
                  </div>
                )}

                {/* View All Schedules Button */}
                <button
                  onClick={() => router.push(`/groups/${groupId}/schedules`)}
                  className="w-full px-4 py-3 bg-linear-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  <Calendar className="w-5 h-5" />
                  Xem lịch đặt xe
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Join Group Modal */}
        <JoinGroupModal
          groupId={Number(groupId)}
          groupName={group.name}
          minOwnershipPercentage={group.minOwnershipPercentage}
          availableOwnership={100 - (group.actualOwnership ?? group.currentOwnership ?? 0)}
          isOpen={showJoinModal}
          onClose={() => setShowJoinModal(false)}
          onSuccess={handleJoinSuccess}
        />

        {/* Counter Offer Modal for Member */}
        {myMembership && myMembership.counterOfferStatus === 'pending_user_response' && (
          <CounterOfferModal
            groupId={Number(groupId)}
            groupName={group.name}
            memberId={myMembership.id}
            proposedPercentage={myMembership.proposedOwnershipPercentage}
            counterOfferPercentage={myMembership.counterOfferPercentage || 0}
            isOpen={showCounterOfferModal}
            onClose={() => setShowCounterOfferModal(false)}
            onSuccess={handleCounterOfferResponse}
          />
        )}
      </div>
    </div>
  );
}
