'use client';

import { useState, useEffect } from 'react';
import { getVehicles, createGroup, Vehicle } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function CreateGroupPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    vehicleId: 0,
    groupName: '',
    description: '',
    estimatedValue: 0,
    maxMembers: 5,
    minOwnershipPercentage: 15,
  });

  useEffect(() => {
    if (user) {
      fetchMyVehicles();
    }
  }, [user]);

  const fetchMyVehicles = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await getVehicles(user.userId);
      if (response.success) {
        // Double-check: Filter by ownerId AND verified status
        // (Backend should filter by ownerId, but we add extra safety check here)
        const myActiveVehicles = response.data.filter(
          v => v.ownerId === user.userId && (v.verificationStatus === 'verified' || v.verificationStatus === 'approved')
        );
        setVehicles(myActiveVehicles);
        
        if (myActiveVehicles.length === 0) {
          setError('Bạn chưa có xe nào được duyệt. Vui lòng thêm xe trước khi tạo nhóm.');
        }
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Không thể tải danh sách xe');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'vehicleId' || name === 'maxMembers' || name === 'estimatedValue' || name === 'minOwnershipPercentage'
        ? Number(value)
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validation
    if (!formData.vehicleId) {
      setError('Vui lòng chọn xe');
      return;
    }
    
    if (formData.minOwnershipPercentage < 1 || formData.minOwnershipPercentage > 100) {
      setError('Phần trăm sở hữu tối thiểu phải từ 1-100%');
      return;
    }
    
    if (formData.maxMembers < 2 || formData.maxMembers > 10) {
      setError('Số thành viên tối đa phải từ 2-10');
      return;
    }

    setSubmitting(true);
    try {
      const response = await createGroup(formData);
      if (response.success) {
        setSuccess('Tạo nhóm thành công! Đang chờ admin phê duyệt...');
        setTimeout(() => {
          router.push('/groups');
        }, 2000);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo nhóm');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 max-w-md text-center">
          <p className="text-yellow-800 font-medium mb-4">Vui lòng đăng nhập để tạo nhóm</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/groups')}
            className="mb-4 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
          >
            ← Quay lại
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Tạo nhóm mới</h1>
          <p className="text-gray-600">Tạo nhóm đồng sở hữu xe điện của bạn</p>
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
            {vehicles.length === 0 && (
              <button
                onClick={() => router.push('/vehicles/create')}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Thêm xe ngay
              </button>
            )}
          </div>
        )}

        {/* Quick Add Vehicle Button - Always visible */}
        {!loading && vehicles.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">Muốn thêm xe mới?</p>
                <p className="text-xs text-blue-700 mt-0.5">Bạn có thể thêm xe trước khi tạo nhóm</p>
              </div>
              <button
                onClick={() => router.push('/vehicles/create')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Thêm xe
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải danh sách xe...</p>
          </div>
        ) : vehicles.length > 0 ? (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
            {/* Vehicle Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn xe <span className="text-red-500">*</span>
              </label>
              <select
                name="vehicleId"
                required
                value={formData.vehicleId}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value={0}>-- Chọn xe --</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle.vehicleId} value={vehicle.vehicleId}>
                    {vehicle.brand} {vehicle.model} - {vehicle.licensePlate}
                  </option>
                ))}
              </select>
            </div>

            {/* Group Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên nhóm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="groupName"
                required
                value={formData.groupName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="VD: Nhóm VF8 Hà Nội"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                placeholder="Mô tả về nhóm, mục đích sử dụng xe..."
              />
            </div>

            {/* Estimated Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá trị ước tính (VND) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="estimatedValue"
                required
                min={0}
                step={1000000}
                value={formData.estimatedValue}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="850000000"
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.estimatedValue > 0 && (
                  <>Giá trị: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(formData.estimatedValue)}</>
                )}
              </p>
            </div>

            {/* Max Members */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số thành viên tối đa <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="maxMembers"
                required
                min={2}
                max={10}
                value={formData.maxMembers}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">Từ 2-10 thành viên</p>
            </div>

            {/* Min Ownership Percentage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phần trăm sở hữu tối thiểu (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="minOwnershipPercentage"
                required
                min={1}
                max={100}
                step={0.1}
                value={formData.minOwnershipPercentage}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">Mỗi thành viên phải sở hữu tối thiểu bao nhiêu %</p>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push('/groups')}
                disabled={submitting}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting || vehicles.length === 0}
                className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 font-medium"
              >
                {submitting ? 'Đang tạo...' : 'Tạo nhóm'}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-4xl">🚗</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có xe nào</h3>
            <p className="text-gray-600 mb-6">Bạn cần thêm xe và được duyệt trước khi tạo nhóm</p>
            <button
              onClick={() => router.push('/vehicles/create')}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Thêm xe ngay
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
