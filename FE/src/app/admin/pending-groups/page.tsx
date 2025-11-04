'use client';

import { useState, useEffect } from 'react';
import { getPendingGroups, approveGroup, PendingGroup } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function AdminPendingGroupsPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [groups, setGroups] = useState<PendingGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState<{[key: number]: string}>({});
  const [showRejectModal, setShowRejectModal] = useState<number | null>(null);

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchPendingGroups();
  }, [user, router]);

  const fetchPendingGroups = async () => {
    setLoading(true);
    setError('');
    const toastId = toast.loading('Đang tải danh sách nhóm chờ duyệt...');
    
    try {
      const response = await getPendingGroups();
      if (response.success) {
        setGroups(response.data);
        toast.update(toastId, {
          render: 'Đã tải danh sách nhóm chờ duyệt',
          type: 'success',
          isLoading: false,
          autoClose: 2000,
        });
      } else {
        setError(response.message);
        toast.update(toastId, {
          render: response.message || 'Có lỗi khi tải danh sách nhóm',
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (err) {
      const errorMessage = 'Không thể tải danh sách nhóm chờ duyệt';
      setError(errorMessage);
      toast.update(toastId, {
        render: errorMessage,
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (groupId: number) => {
    setProcessingId(groupId);
    setError('');
    const toastId = toast.loading('Đang xử lý yêu cầu...');
    
    try {
      const response = await approveGroup(groupId, true);
      if (response.success) {
        setGroups(prev => prev.filter(g => g.id !== groupId));
        toast.update(toastId, {
          render: 'Đã duyệt nhóm thành công',
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        });
      } else {
        setError(response.message);
        toast.update(toastId, {
          render: response.message || 'Có lỗi xảy ra khi duyệt nhóm',
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể duyệt nhóm';
      setError(errorMessage);
      toast.update(toastId, {
        render: errorMessage,
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (groupId: number) => {
    const reason = rejectReason[groupId];
    if (!reason || reason.trim().length === 0) {
      setError('Vui lòng nhập lý do từ chối');
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }

    setProcessingId(groupId);
    setError('');
    const toastId = toast.loading('Đang từ chối yêu cầu...');
    
    try {
      const response = await approveGroup(groupId, false, reason);
      if (response.success) {
        setGroups(prev => prev.filter(g => g.id !== groupId));
        setShowRejectModal(null);
        setRejectReason(prev => {
          const newState = { ...prev };
          delete newState[groupId];
          return newState;
        });
        toast.update(toastId, {
          render: 'Đã từ chối yêu cầu tạo nhóm',
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        });
      } else {
        setError(response.message);
        toast.update(toastId, {
          render: response.message || 'Có lỗi xảy ra khi từ chối nhóm',
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể từ chối nhóm';
      setError(errorMessage);
      toast.update(toastId, {
        render: errorMessage,
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setProcessingId(null);
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

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="mb-4 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
          >
            ← Quay lại Admin Panel
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Duyệt nhóm mới</h1>
          <p className="text-gray-600">Kiểm tra và phê duyệt các nhóm chờ duyệt</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">✗ {error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && groups.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-4xl">✓</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Không có nhóm chờ duyệt</h3>
            <p className="text-gray-600">Tất cả nhóm đã được xử lý</p>
          </div>
        )}

        {/* Groups List */}
        {!loading && groups.length > 0 && (
          <div className="space-y-6">
            {groups.map((group) => (
              <div key={group.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">{group.name}</h3>
                      <p className="text-gray-600">{group.description}</p>
                    </div>
                    <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                      Chờ duyệt
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* Vehicle Info */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 mb-2">Thông tin xe</p>
                      <p className="font-bold text-lg text-gray-900">
                        {group.vehicle.brand} {group.vehicle.model}
                      </p>
                      <p className="text-sm text-gray-600 font-mono">{group.vehicle.licensePlate}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Pin: {group.vehicle.batteryCapacity} kWh | Năm SX: {group.vehicle.yearOfManufacture}
                      </p>
                    </div>

                    {/* Creator Info */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 mb-2">Người tạo</p>
                      <p className="font-bold text-lg text-gray-900">{group.createdBy.fullName}</p>
                      <p className="text-sm text-gray-600">{group.createdBy.email}</p>
                      <p className="text-xs text-gray-500 mt-2">CCCD: {group.createdBy.cccd}</p>
                    </div>
                  </div>

                  {/* Group Details */}
                  <div className="grid md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-emerald-50 rounded-lg p-3">
                      <p className="text-xs text-emerald-700 mb-1">Giá trị ước tính</p>
                      <p className="font-bold text-emerald-900 text-sm">
                        {formatCurrency(group.estimatedValue)}
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-blue-700 mb-1">Thành viên tối đa</p>
                      <p className="font-bold text-blue-900 text-lg">{group.maxMembers}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-xs text-purple-700 mb-1">Sở hữu tối thiểu</p>
                      <p className="font-bold text-purple-900 text-lg">{group.minOwnershipPercentage}%</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3">
                      <p className="text-xs text-orange-700 mb-1">Ngày tạo</p>
                      <p className="font-bold text-orange-900 text-xs">{formatDate(group.createdAt)}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleApprove(group.id)}
                      disabled={processingId === group.id}
                      className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 font-medium"
                    >
                      {processingId === group.id ? 'Đang xử lý...' : '✓ Phê duyệt'}
                    </button>
                    <button
                      onClick={() => setShowRejectModal(group.id)}
                      disabled={processingId === group.id}
                      className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-medium"
                    >
                      ✗ Từ chối
                    </button>
                  </div>
                </div>

                {/* Reject Modal */}
                {showRejectModal === group.id && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Từ chối nhóm</h3>
                      <p className="text-gray-600 mb-4">Vui lòng nhập lý do từ chối:</p>
                      <textarea
                        rows={4}
                        value={rejectReason[group.id] || ''}
                        onChange={(e) => setRejectReason(prev => ({ ...prev, [group.id]: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none mb-4"
                        placeholder="VD: Thông tin xe không hợp lệ..."
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowRejectModal(null)}
                          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={() => handleReject(group.id)}
                          disabled={processingId === group.id}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          {processingId === group.id ? 'Đang xử lý...' : 'Xác nhận từ chối'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
