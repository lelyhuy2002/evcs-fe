'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getGroupDetail, getMembers, getAvailableOwnership, Member, Group } from '@/lib/api';
import { Users, TrendingUp, UserCheck, UserX, Clock, ArrowLeft } from 'lucide-react';
import GroupMembersList from '@/components/GroupMembersList';
import { useAuth } from '@/contexts/AuthContext';

export default function GroupMembersPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const groupId = Number(params.id);

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [availablePercentage, setAvailablePercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    const fetchData = async () => {
      // Validate groupId
      if (isNaN(groupId) || groupId <= 0) {
        setError('ID nhóm không hợp lệ');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const [groupRes, membersRes, availableRes] = await Promise.all([
          getGroupDetail(groupId),
          getMembers(groupId),
          getAvailableOwnership(groupId),
        ]);

        if (!groupRes.success) {
          setError(groupRes.message);
          return;
        }
        setGroup(groupRes.data);

        if (membersRes.success) {
          setMembers(membersRes.data);
        }

        if (availableRes.success) {
          setAvailablePercentage(availableRes.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải thông tin nhóm');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [groupId]);

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
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserX className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Lỗi</h1>
          <p className="text-gray-600 mb-6">{error || 'Không tìm thấy nhóm'}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-semibold"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const isGroupOwner = user?.userId === group.createdBy;
  const pendingCount = members.filter((m) => m.joinStatus === 'Pending').length;
  const approvedCount = members.filter((m) => m.joinStatus === 'Approved').length;
  const rejectedCount = members.filter((m) => m.joinStatus === 'Rejected').length;
  const counterOfferCount = members.filter((m) => m.joinStatus === 'CounterOffer').length;
  const totalOwnership = members
    .filter((m) => m.joinStatus === 'Approved')
    .reduce((sum, m) => sum + (m.ownershipPercentage || 0), 0);

  const filteredMembers = members.filter((m) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return m.joinStatus === 'Pending' || m.joinStatus === 'CounterOffer';
    if (activeTab === 'approved') return m.joinStatus === 'Approved';
    if (activeTab === 'rejected') return m.joinStatus === 'Rejected';
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <button
            onClick={() => router.push(`/groups/${groupId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Quay lại chi tiết nhóm</span>
          </button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-linear-to-r from-emerald-600 to-green-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Quản lý thành viên</h1>
                  <p className="text-gray-600">{group.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng thành viên</p>
                <p className="text-3xl font-bold text-gray-900">{members.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Đã duyệt</p>
                <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Chờ xử lý</p>
                <p className="text-3xl font-bold text-yellow-600">{pendingCount + counterOfferCount}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Từ chối</p>
                <p className="text-3xl font-bold text-red-600">{rejectedCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <UserX className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Ownership Chart */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-bold text-gray-900">Phân bổ sở hữu</h2>
          </div>

          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="relative">
              <div className="w-full h-8 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-emerald-600 to-green-600 transition-all duration-500 flex items-center justify-center text-white text-sm font-semibold"
                  style={{ width: `${totalOwnership}%` }}
                >
                  {totalOwnership > 10 && `${totalOwnership.toFixed(1)}%`}
                </div>
              </div>
              {totalOwnership <= 10 && (
                <span className="absolute left-2 top-1 text-xs font-semibold text-gray-700">
                  {totalOwnership.toFixed(1)}%
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-emerald-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Đã phân bổ</p>
                <p className="text-2xl font-bold text-emerald-600">{totalOwnership.toFixed(1)}%</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Còn lại</p>
                <p className="text-2xl font-bold text-blue-600">{availablePercentage.toFixed(1)}%</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Tổng cộng</p>
                <p className="text-2xl font-bold text-gray-900">100%</p>
              </div>
            </div>

            {/* Lock Status */}
            {totalOwnership >= 100 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div className="text-sm text-red-800">
                  <p className="font-semibold mb-1">Nhóm đã khóa</p>
                  <p>Tổng % sở hữu đã đạt 100%. Không thể thêm thành viên mới.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm p-2">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Tất cả ({members.length})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'pending'
                  ? 'bg-yellow-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Chờ xử lý ({pendingCount + counterOfferCount})
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'approved'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Đã duyệt ({approvedCount})
            </button>
            {isGroupOwner && (
              <button
                onClick={() => setActiveTab('rejected')}
                className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'rejected'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Từ chối ({rejectedCount})
              </button>
            )}
          </div>
        </div>

        {/* Members List */}
        <GroupMembersList
          groupId={groupId}
          group={group}
          isGroupOwner={isGroupOwner}
          availablePercentage={availablePercentage}
          currentUserId={user?.userId}
        />

        {/* Empty State */}
        {filteredMembers.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có thành viên</h3>
            <p className="text-gray-600">
              {activeTab === 'all' && 'Chưa có thành viên nào trong nhóm này'}
              {activeTab === 'pending' && 'Không có yêu cầu nào đang chờ xử lý'}
              {activeTab === 'approved' && 'Chưa có thành viên nào được duyệt'}
              {activeTab === 'rejected' && 'Chưa có yêu cầu nào bị từ chối'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
