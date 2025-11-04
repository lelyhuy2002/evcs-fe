'use client';

import { useState, useEffect } from 'react';
import { getAllGroups, Group, getGroupMembers, Member } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface GroupWithMembers extends Group {
  actualMembersCount?: number;
  actualOwnership?: number;
}

export default function AdminGroupsPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [groups, setGroups] = useState<GroupWithMembers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [approvalFilter, setApprovalFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      if (user.role !== 'admin') {
        router.push('/');
        return;
      }
      fetchGroups();
    } else {
      setLoading(false);
    }
  }, [user, router]);

  const fetchGroups = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getAllGroups();
      if (response.success) {
        // Fetch member data for each group
        const groupsWithMembers = await Promise.all(
          response.data.map(async (group) => {
            try {
              const membersResponse = await getGroupMembers(group.id);
              if (membersResponse.success) {
                const approvedMembers = membersResponse.data.filter(
                  (m: Member) => m.joinStatus === 'Approved'
                );
                const actualMembersCount = approvedMembers.length;
                const actualOwnership = approvedMembers.reduce(
                  (sum: number, m: Member) => sum + (m.ownershipPercentage || 0),
                  0
                );
                return {
                  ...group,
                  actualMembersCount,
                  actualOwnership,
                };
              }
            } catch (err) {
              console.error(`Failed to fetch members for group ${group.id}:`, err);
            }
            return group;
          })
        );
        setGroups(groupsWithMembers);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Không thể tải danh sách nhóm');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      active: { label: 'Hoạt động', className: 'bg-green-100 text-green-700' },
      pending: { label: 'Chờ xử lý', className: 'bg-yellow-100 text-yellow-700' },
      closed: { label: 'Đã đóng', className: 'bg-gray-100 text-gray-700' },
    };
    
    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-700' };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getApprovalBadge = (approvalStatus: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      approved: { label: 'Đã duyệt', className: 'bg-green-100 text-green-700' },
      pending: { label: 'Chờ duyệt', className: 'bg-yellow-100 text-yellow-700' },
      rejected: { label: 'Từ chối', className: 'bg-red-100 text-red-700' },
    };
    
    const config = statusConfig[approvalStatus] || { label: approvalStatus, className: 'bg-gray-100 text-gray-700' };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // Filter groups
  const filteredGroups = groups.filter(g => {
    const matchesSearch = 
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.vehicleBrand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.vehicleModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.vehicleLicensePlate.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || g.status === statusFilter;
    const matchesApproval = approvalFilter === 'all' || g.approvalStatus === approvalFilter;
    
    return matchesSearch && matchesStatus && matchesApproval;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 max-w-md text-center">
          <p className="text-yellow-800 font-medium mb-4">Vui lòng đăng nhập</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md text-center">
          <p className="text-red-800 font-medium mb-4">Bạn không có quyền truy cập trang này</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Quản lý nhóm</h1>
          <p className="text-gray-600">Quản lý tất cả nhóm đồng sở hữu trong hệ thống</p>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-xl shadow-sm p-4 space-y-4">
          {/* Search Bar */}
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên nhóm, xe, biển số..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <button
              onClick={fetchGroups}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Làm mới
            </button>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="pending">Chờ xử lý</option>
              <option value="closed">Đã đóng</option>
            </select>

            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="all">Tất cả phê duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="pending">Chờ duyệt</option>
              <option value="rejected">Từ chối</option>
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">✗ {error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải danh sách nhóm...</p>
          </div>
        ) : filteredGroups.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <div className="w-16 h-16 bg-emerald-500 rounded-lg"></div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {searchQuery || statusFilter !== 'all' || approvalFilter !== 'all' 
                ? 'Không tìm thấy nhóm' 
                : 'Chưa có nhóm'}
            </h3>
            <p className="text-gray-600">
              {searchQuery || statusFilter !== 'all' || approvalFilter !== 'all'
                ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                : 'Danh sách nhóm trống'}
            </p>
          </div>
        ) : (
          /* Groups Table */
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên nhóm
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Xe
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giá trị
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thành viên
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phê duyệt
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredGroups.map((g) => (
                    <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{g.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{g.name}</div>
                        <div className="text-xs text-gray-500">Tạo bởi: {g.createdByName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{g.vehicleBrand} {g.vehicleModel}</div>
                        <div className="text-xs text-gray-500">{g.vehicleLicensePlate}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(g.estimatedValue)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {g.actualMembersCount ?? g.currentMembers}/{g.maxMembers}
                        </div>
                        <div className="text-xs text-gray-500">
                          {((g.actualOwnership ?? g.currentOwnership) || 0).toFixed(1)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(g.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getApprovalBadge(g.approvalStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(g.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/admin/groups/${g.id}`}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium inline-block"
                        >
                          Chi tiết
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Info */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Hiển thị <span className="font-medium">{filteredGroups.length}</span> / <span className="font-medium">{groups.length}</span> nhóm
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
