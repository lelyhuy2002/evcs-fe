'use client';

import { useState, useEffect } from 'react';
import { getUserDetail, updateUser, deleteUser, User } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user: currentUser } = useAuth();
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    cccd: '',
    driverLicense: '',
    birthday: '',
    role: 'user',
    verificationStatus: 'pending',
    location: '',
  });

  useEffect(() => {
    if (currentUser && currentUser.role === 'admin' && params.id) {
      fetchUserDetail();
    }
  }, [currentUser, params.id]);

  const fetchUserDetail = async () => {
    setLoading(true);
    setError('');
    try {
      const userId = Number(params.id);
      const response = await getUserDetail(userId);
      
      if (response.success) {
        setUser(response.data);
        setFormData({
          fullName: response.data.fullName,
          email: response.data.email,
          cccd: response.data.cccd,
          driverLicense: response.data.driverLicense,
          birthday: response.data.birthday,
          role: response.data.role,
          verificationStatus: response.data.verificationStatus,
          location: response.data.location,
        });
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const userId = Number(params.id);
      const response = await updateUser(userId, formData);
      
      if (response.success) {
        setSuccess('Cập nhật thông tin thành công');
        setIsEditing(false);
        fetchUserDetail();
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Không thể cập nhật thông tin');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const userId = Number(params.id);
      const response = await deleteUser(userId);
      
      if (response.success) {
        setSuccess('Xóa người dùng thành công');
        setTimeout(() => {
          router.push('/admin/users');
        }, 1500);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Không thể xóa người dùng');
    } finally {
      setSubmitting(false);
      setShowDeleteModal(false);
    }
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
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-24 h-24 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <div className="w-16 h-16 bg-red-500 rounded-lg"></div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy người dùng</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/admin/users')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
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
            onClick={() => router.push('/admin/users')}
            className="mb-4 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
          >
            ← Quay lại danh sách
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Chi tiết người dùng</h1>
              <p className="text-gray-600">ID: #{user?.id}</p>
            </div>
            <div className="flex gap-3">
              {!isEditing ? (
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
              ) : (
                <button
                  onClick={() => {
                    setIsEditing(false);
                    if (user) {
                      setFormData({
                        fullName: user.fullName,
                        email: user.email,
                        cccd: user.cccd,
                        driverLicense: user.driverLicense,
                        birthday: user.birthday,
                        role: user.role,
                        verificationStatus: user.verificationStatus,
                        location: user.location,
                      });
                    }
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Hủy
                </button>
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

        {user && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Images */}
            <div className="lg:col-span-1 space-y-6">
              {/* CCCD Front */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="font-medium text-gray-900">CCCD mặt trước</h3>
                </div>
                <div className="relative h-48 bg-gradient-to-br from-purple-100 to-blue-100">
                  {user.cccdFrontUrl ? (
                    <img
                      src={user.cccdFrontUrl}
                      alt="CCCD mặt trước"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-16 h-16 bg-purple-500 rounded-lg"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* CCCD Back */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="font-medium text-gray-900">CCCD mặt sau</h3>
                </div>
                <div className="relative h-48 bg-gradient-to-br from-purple-100 to-blue-100">
                  {user.cccdBackUrl ? (
                    <img
                      src={user.cccdBackUrl}
                      alt="CCCD mặt sau"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-16 h-16 bg-purple-500 rounded-lg"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Driver License */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="font-medium text-gray-900">Bằng lái xe</h3>
                </div>
                <div className="relative h-48 bg-gradient-to-br from-purple-100 to-blue-100">
                  {user.driverLicenseUrl ? (
                    <img
                      src={user.driverLicenseUrl}
                      alt="Bằng lái xe"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-16 h-16 bg-purple-500 rounded-lg"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Information */}
            <div className="lg:col-span-2">
              <form onSubmit={handleUpdate} className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin cá nhân</h2>

                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    disabled={!isEditing}
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    disabled={!isEditing}
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>

                {/* CCCD */}
                <div>
                  <label htmlFor="cccd" className="block text-sm font-medium text-gray-700 mb-2">
                    Số CCCD
                  </label>
                  <input
                    type="text"
                    id="cccd"
                    name="cccd"
                    disabled={!isEditing}
                    value={formData.cccd}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>

                {/* Driver License */}
                <div>
                  <label htmlFor="driverLicense" className="block text-sm font-medium text-gray-700 mb-2">
                    Số GPLX
                  </label>
                  <input
                    type="text"
                    id="driverLicense"
                    name="driverLicense"
                    disabled={!isEditing}
                    value={formData.driverLicense}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>

                {/* Birthday */}
                <div>
                  <label htmlFor="birthday" className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    id="birthday"
                    name="birthday"
                    disabled={!isEditing}
                    value={formData.birthday}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>

                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    disabled={!isEditing}
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>

                {/* Role */}
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                    Vai trò
                  </label>
                  <select
                    id="role"
                    name="role"
                    disabled={!isEditing}
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {/* Verification Status */}
                <div>
                  <label htmlFor="verificationStatus" className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái xác minh
                  </label>
                  <select
                    id="verificationStatus"
                    name="verificationStatus"
                    disabled={!isEditing}
                    value={formData.verificationStatus}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                  >
                    <option value="pending">Chờ xác minh</option>
                    <option value="verified">Đã xác minh</option>
                    <option value="rejected">Từ chối</option>
                  </select>
                </div>

                {/* Created At */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày tạo
                  </label>
                  <input
                    type="text"
                    disabled
                    value={formatDate(user.createdAt)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>

                {/* Submit Button */}
                {isEditing && (
                  <div className="pt-6 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 font-medium"
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
                Bạn có chắc chắn muốn xóa người dùng <span className="font-medium text-gray-900">{user?.fullName}</span>? 
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
