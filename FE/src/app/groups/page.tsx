'use client';

import { useState, useEffect } from 'react';
import { getAllGroups, getMyGroups, getGroupMembers, Group, Member } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type TabType = 'explore' | 'my-groups';

interface GroupWithMembers extends Group {
  actualMembersCount?: number;
  actualOwnership?: number;
}

export default function GroupsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('explore');
  const [groups, setGroups] = useState<GroupWithMembers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGroups();
  }, [activeTab]);

  const fetchGroups = async () => {
    setLoading(true);
    setError('');
    try {
      const response = activeTab === 'explore' 
        ? await getAllGroups() 
        : await getMyGroups();
      
      if (response.success) {
        // Fetch member details for each group
        const groupsWithMembers = await Promise.all(
          response.data.map(async (group) => {
            try {
              const membersResponse = await getGroupMembers(group.id);
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
                
                return {
                  ...group,
                  actualMembersCount,
                  actualOwnership
                };
              }
            } catch (err) {
              console.log(`Cannot fetch members for group ${group.id}:`, err);
            }
            return group;
          })
        );
        
        setGroups(groupsWithMembers);
      } else {
        setError(response.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải danh sách nhóm';
      setError(errorMessage);
      
      // Redirect to login if unauthorized
      if (errorMessage.includes('đăng nhập') || errorMessage.includes('Unauthorized')) {
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
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
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Nhóm sở hữu xe</h1>
              <p className="text-gray-600">Khám phá và quản lý các nhóm sở hữu xe điện</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/vehicles/create"
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
              >
                Thêm xe
              </Link>
              <Link
                href="/groups/create"
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium shadow-md hover:shadow-lg"
              >
                Tạo nhóm mới
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm mb-6 p-2 inline-flex gap-2">
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-8 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'explore'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Khám phá nhóm
          </button>
          <button
            onClick={() => setActiveTab('my-groups')}
            className={`px-8 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'my-groups'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Nhóm của tôi
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-800 font-medium">{error}</p>
            <button
              onClick={fetchGroups}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && groups.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-4xl text-gray-400">🚗</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {activeTab === 'explore' ? 'Chưa có nhóm nào' : 'Bạn chưa tham gia nhóm nào'}
            </h3>
            <p className="text-gray-600">
              {activeTab === 'explore'
                ? 'Hiện tại chưa có nhóm sở hữu nào được tạo'
                : 'Khám phá các nhóm để tham gia ngay'}
            </p>
          </div>
        )}

        {/* Groups Grid */}
        {!loading && !error && groups.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <Link
                key={group.id}
                href={`/groups/${group.id}`}
                className="group"
              >
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full border border-gray-100 hover:border-emerald-200">
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-emerald-500 to-blue-500 p-6 text-white">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold line-clamp-1 flex-1">
                        {group.name}
                      </h3>
                    </div>
                    <p className="text-sm text-white/90 line-clamp-2 mb-3">
                      {group.description}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(group.status, group.isLocked)} bg-white/90`}>
                        {group.isLocked ? 'locked' : group.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getApprovalColor(group.approvalStatus)} bg-white/90`}>
                        {group.approvalStatus}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-4">
                    {/* Vehicle Info */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 mb-1">Phương tiện</p>
                      <p className="font-bold text-gray-900 text-lg">
                        {group.vehicleBrand} {group.vehicleModel}
                      </p>
                      <p className="text-sm text-gray-600 font-mono">
                        {group.vehicleLicensePlate}
                      </p>
                    </div>

                    {/* Financial Info */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-emerald-50 rounded-lg p-3">
                        <p className="text-xs text-emerald-700 mb-1">Giá trị ước tính</p>
                        <p className="font-bold text-emerald-900 text-sm">
                          {formatCurrency(group.estimatedValue)}
                        </p>
                      </div>
                    </div>

                    {/* Ownership Info */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Thành viên</span>
                        <span className="font-semibold text-gray-900">
                          {group.actualMembersCount ?? group.currentMembers} / {group.maxMembers}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Sở hữu tối thiểu</span>
                        <span className="font-semibold text-gray-900">
                          {group.minOwnershipPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-emerald-600 h-2.5 rounded-full transition-all"
                          style={{ width: `${group.actualOwnership ?? group.currentOwnership}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600 text-right">
                        Đã sở hữu: {group.actualOwnership ?? group.currentOwnership}%
                      </p>
                    </div>

                    {/* Footer Info */}
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Tạo bởi {group.createdByName}</span>
                        <span>{formatDate(group.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-emerald-600 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none"></div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
