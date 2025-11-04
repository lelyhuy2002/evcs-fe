'use client';

import { useState, useEffect } from 'react';
import { getGroupDetail, updateGroup, deleteGroup, Group } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';

export default function AdminGroupDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user: currentUser } = useAuth();
  
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'pending',
    estimatedValue: 0,
    maxMembers: 5,
    minOwnershipPercentage: 15,
    approvalStatus: 'pending',
    contractUrl: '',
  });

  useEffect(() => {
    if (currentUser && currentUser.role === 'admin' && params.id) {
      fetchGroupDetail();
    }
  }, [currentUser, params.id]);

  const fetchGroupDetail = async () => {
    setLoading(true);
    setError('');
    try {
      const groupId = Number(params.id);
      const response = await getGroupDetail(groupId);
      
      if (response.success) {
        setGroup(response.data);
        setFormData({
          name: response.data.name,
          description: response.data.description,
          status: response.data.status,
          estimatedValue: response.data.estimatedValue,
          maxMembers: response.data.maxMembers,
          minOwnershipPercentage: response.data.minOwnershipPercentage,
          approvalStatus: response.data.approvalStatus,
          contractUrl: response.data.contractUrl || '',
        });
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Không thể tải thông tin nhóm');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'estimatedValue' || name === 'maxMembers' || name === 'minOwnershipPercentage'
        ? Number(value)
        : value,
    }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const groupId = Number(params.id);
      const response = await updateGroup(groupId, formData);
      
      if (response.success) {
        setSuccess('Cập nhật thông tin nhóm thành công');
        setIsEditing(false);
        fetchGroupDetail();
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Không thể cập nhật thông tin nhóm');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const groupId = Number(params.id);
      const response = await deleteGroup(groupId);
      
      if (response.success) {
        setSuccess('Xóa nhóm thành công');
        setTimeout(() => {
          router.push('/admin/groups');
        }, 1500);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Không thể xóa nhóm');
    } finally {
      setSubmitting(false);
      setShowDeleteModal(false);
    }
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
      month: 'long',
      day: 'numeric',
    });
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md text-center">
          <p className="text-red-800 font-medium mb-4">Bạn không có quyền truy cập</p>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải thông tin nhóm...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !group) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-24 h-24 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <div className="w-16 h-16 bg-red-500 rounded-lg"></div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy nhóm</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/admin/groups')}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/groups')}
            className="mb-4 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
          >
            ← Quay lại danh sách
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Chi tiết nhóm</h1>
              <p className="text-gray-600">ID: #{group?.id}</p>
            </div>
            <div className="flex gap-3">
              {isEditing ? (
                <button
                  onClick={() => {
                    setIsEditing(false);
                    if (group) {
                      setFormData({
                        name: group.name,
                        description: group.description,
                        status: group.status,
                        estimatedValue: group.estimatedValue,
                        maxMembers: group.maxMembers,
                        minOwnershipPercentage: group.minOwnershipPercentage,
                        approvalStatus: group.approvalStatus,
                        contractUrl: group.contractUrl || '',
                      });
                    }
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Hủy
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-md"
                  >
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium shadow-md"
                  >
                    Xóa
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">✓ {success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">✗ {error}</p>
          </div>
        )}

        {group && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Vehicle Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Vehicle Card */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin xe</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Xe</p>
                    <p className="font-medium text-gray-900">{group.vehicleBrand} {group.vehicleModel}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Biển số</p>
                    <p className="font-medium text-gray-900">{group.vehicleLicensePlate}</p>
                  </div>
                </div>
              </div>

              {/* Creator Info */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Người tạo</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Họ và tên</p>
                    <p className="font-medium text-gray-900">{group.createdByName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ngày tạo</p>
                    <p className="font-medium text-gray-900">{formatDate(group.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Approver Info */}
              {group.approvedByName && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Người duyệt</h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Họ và tên</p>
                      <p className="font-medium text-gray-900">{group.approvedByName}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Group Details */}
            <div className="lg:col-span-2">
              <form onSubmit={handleUpdate} className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin nhóm</h2>

                {/* Group Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Tên nhóm
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    disabled={!isEditing}
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    disabled={!isEditing}
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600 resize-none"
                  />
                </div>

                {/* Estimated Value */}
                <div>
                  <label htmlFor="estimatedValue" className="block text-sm font-medium text-gray-700 mb-2">
                    Giá trị ước tính (VND)
                  </label>
                  <input
                    type="number"
                    id="estimatedValue"
                    name="estimatedValue"
                    disabled={!isEditing}
                    value={formData.estimatedValue}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                  />
                  {!isEditing && (
                    <p className="mt-1 text-sm text-gray-500">{formatCurrency(formData.estimatedValue)}</p>
                  )}
                </div>

                {/* Max Members */}
                <div>
                  <label htmlFor="maxMembers" className="block text-sm font-medium text-gray-700 mb-2">
                    Số thành viên tối đa
                  </label>
                  <input
                    type="number"
                    id="maxMembers"
                    name="maxMembers"
                    disabled={!isEditing}
                    min={2}
                    max={10}
                    value={formData.maxMembers}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>

                {/* Min Ownership Percentage */}
                <div>
                  <label htmlFor="minOwnershipPercentage" className="block text-sm font-medium text-gray-700 mb-2">
                    Phần trăm sở hữu tối thiểu (%)
                  </label>
                  <input
                    type="number"
                    id="minOwnershipPercentage"
                    name="minOwnershipPercentage"
                    disabled={!isEditing}
                    min={1}
                    max={100}
                    step={0.1}
                    value={formData.minOwnershipPercentage}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái
                  </label>
                  <select
                    id="status"
                    name="status"
                    disabled={!isEditing}
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                  >
                    <option value="pending">Chờ xử lý</option>
                    <option value="active">Hoạt động</option>
                    <option value="closed">Đã đóng</option>
                  </select>
                </div>

                {/* Approval Status */}
                <div>
                  <label htmlFor="approvalStatus" className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái phê duyệt
                  </label>
                  <select
                    id="approvalStatus"
                    name="approvalStatus"
                    disabled={!isEditing}
                    value={formData.approvalStatus}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                  >
                    <option value="pending">Chờ duyệt</option>
                    <option value="approved">Đã duyệt</option>
                    <option value="rejected">Từ chối</option>
                  </select>
                </div>

                {/* Contract URL */}
                <div>
                  <label htmlFor="contractUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    URL hợp đồng
                  </label>
                  <input
                    type="url"
                    id="contractUrl"
                    name="contractUrl"
                    disabled={!isEditing}
                    value={formData.contractUrl}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                    placeholder="https://..."
                  />
                </div>

                {/* Current Stats (Read-only) */}
                <div className="pt-6 border-t border-gray-200 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thành viên hiện tại
                    </label>
                    <input
                      type="text"
                      disabled
                      value={`${group.currentMembers} / ${group.maxMembers}`}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sở hữu hiện tại
                    </label>
                    <input
                      type="text"
                      disabled
                      value={`${(group.currentOwnership || 0).toFixed(1)}%`}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                </div>

                {/* Reject Reason */}
                {group.rejectReason && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-medium text-red-900 mb-1">Lý do từ chối:</p>
                    <p className="text-sm text-red-700">{group.rejectReason}</p>
                  </div>
                )}

                {/* Submit Button */}
                {isEditing && (
                  <div className="pt-6 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 font-medium"
                    >
                      {submitting ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Xác nhận xóa</h3>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn xóa nhóm <span className="font-medium text-gray-900">{group?.name}</span>? 
                Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDelete}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-medium"
                >
                  {submitting ? 'Đang xóa...' : 'Xóa'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
