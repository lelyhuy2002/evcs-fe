'use client';

import { useState, useEffect } from 'react';
import { getVehicleDetail, updateVehicle, deleteVehicle, updateVehicleVerificationStatus, approveVehicle, Vehicle } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';

export default function AdminVehicleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const vehicleId = params.id as string;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingVerification, setUpdatingVerification] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    yearOfManufacture: 0,
    licensePlate: '',
    batteryCapacity: 0,
    location: '',
    status: '',
    registrationInfo: '',
    imageUrl1: '',
    imageUrl2: '',
    imageUrl3: '',
    ownerId: 0,
  });

  useEffect(() => {
    if (user) {
      if (user.role !== 'admin') {
        router.push('/');
        return;
      }
      fetchVehicleDetail();
    } else {
      setLoading(false);
    }
  }, [user, vehicleId, router]);

  const fetchVehicleDetail = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getVehicleDetail(Number(vehicleId));
      if (response.success && response.data) {
        setVehicle(response.data);
        // Initialize form data
        setFormData({
          brand: response.data.brand,
          model: response.data.model,
          yearOfManufacture: response.data.yearOfManufacture,
          licensePlate: response.data.licensePlate,
          batteryCapacity: response.data.batteryCapacity,
          location: response.data.location,
          status: response.data.status,
          registrationInfo: response.data.registrationInfo,
          imageUrl1: response.data.imageUrl1,
          imageUrl2: response.data.imageUrl2,
          imageUrl3: response.data.imageUrl3,
          ownerId: response.data.ownerId,
        });
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Không thể tải thông tin xe');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'yearOfManufacture' || name === 'batteryCapacity' ? Number(value) : value,
    }));
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    try {
      const response = await updateVehicle(Number(vehicleId), formData);
      if (response.success) {
        setSuccess('Cập nhật thông tin xe thành công!');
        setIsEditing(false);
        await fetchVehicleDetail();
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Không thể cập nhật thông tin xe');
    }
  };

  const handleUpdateVerificationStatus = async (newStatus: string) => {
    setUpdatingVerification(true);
    setError('');
    setSuccess('');
    try {
      const response = await updateVehicleVerificationStatus(Number(vehicleId), newStatus);
      if (response.success) {
        setSuccess(`Đã cập nhật trạng thái xác minh thành: ${newStatus === 'approved' ? 'Đã xác minh' : newStatus === 'rejected' ? 'Từ chối' : 'Chờ xác minh'}`);
        await fetchVehicleDetail();
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Không thể cập nhật trạng thái xác minh');
    } finally {
      setUpdatingVerification(false);
    }
  };

  const handleApproveVehicle = async (approved: boolean, reason?: string) => {
    setUpdatingStatus(true);
    setError('');
    setSuccess('');
    console.log('Approving vehicle:', { approved, reason });
    try {
      const response = await approveVehicle(Number(vehicleId), approved, reason);
      console.log('Approve vehicle response:', response);
      if (response.success) {
        setSuccess(approved ? 'Đã phê duyệt xe thành công!' : 'Đã từ chối xe!');
        await fetchVehicleDetail();
      } else {
        setError(response.message);
      }
    } catch (error) {
      console.error('Approve vehicle error:', error);
      setError(error instanceof Error ? error.message : 'Không thể cập nhật trạng thái xe');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    // For direct status changes (not approval flow)
    setUpdatingStatus(true);
    setError('');
    setSuccess('');
    console.log('Updating vehicle status to:', newStatus);
    try {
      const response = await updateVehicle(Number(vehicleId), { ...formData, status: newStatus });
      console.log('Update status response:', response);
      if (response.success) {
        setSuccess(`Đã cập nhật trạng thái xe thành: ${newStatus === 'available' ? 'Sẵn sàng' : newStatus === 'pending_approval' ? 'Chờ phê duyệt' : newStatus}`);
        await fetchVehicleDetail();
      } else {
        setError(response.message);
      }
    } catch (error) {
      console.error('Update status error:', error);
      setError(error instanceof Error ? error.message : 'Không thể cập nhật trạng thái xe');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      const response = await deleteVehicle(Number(vehicleId));
      if (response.success) {
        router.push('/admin/vehicles');
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Không thể xóa xe');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      available: { label: 'Sẵn sàng', className: 'bg-green-100 text-green-700' },
      'in-use': { label: 'Đang dùng', className: 'bg-blue-100 text-blue-700' },
      maintenance: { label: 'Bảo trì', className: 'bg-yellow-100 text-yellow-700' },
      pending_approval: { label: 'Chờ phê duyệt', className: 'bg-orange-100 text-orange-700' },
    };
    
    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-700' };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getVerificationBadge = (verificationStatus: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      verified: { label: 'Đã xác minh', className: 'bg-green-100 text-green-700' },
      approved: { label: 'Đã xác minh', className: 'bg-green-100 text-green-700' },
      pending: { label: 'Chờ xác minh', className: 'bg-yellow-100 text-yellow-700' },
      rejected: { label: 'Từ chối', className: 'bg-red-100 text-red-700' },
    };
    
    const config = statusConfig[verificationStatus] || { label: verificationStatus, className: 'bg-gray-100 text-gray-700' };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin xe...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md text-center">
          <p className="text-red-800 font-medium mb-4">Không tìm thấy thông tin xe</p>
          <button
            onClick={() => router.push('/admin/vehicles')}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={() => router.push('/admin/vehicles')}
              className="text-gray-600 hover:text-gray-900 mb-2 flex items-center gap-2 transition-colors"
            >
              ← Quay lại danh sách
            </button>
            <h1 className="text-4xl font-bold text-gray-900">Chi tiết xe #{vehicle.vehicleId}</h1>
            <p className="text-gray-600 mt-1">{vehicle.brand} {vehicle.model}</p>
          </div>
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    // Reset form data
                    setFormData({
                      brand: vehicle.brand,
                      model: vehicle.model,
                      yearOfManufacture: vehicle.yearOfManufacture,
                      licensePlate: vehicle.licensePlate,
                      batteryCapacity: vehicle.batteryCapacity,
                      location: vehicle.location,
                      status: vehicle.status,
                      registrationInfo: vehicle.registrationInfo,
                      imageUrl1: vehicle.imageUrl1,
                      imageUrl2: vehicle.imageUrl2,
                      imageUrl3: vehicle.imageUrl3,
                      ownerId: vehicle.ownerId,
                    });
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Lưu thay đổi
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Chỉnh sửa
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Xóa xe
                </button>
              </>
            )}
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">✓ {success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">✗ {error}</p>
          </div>
        )}

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Images */}
          <div className="lg:col-span-1 space-y-6">
            {/* Vehicle Image 1 */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Ảnh xe 1</h3>
              {vehicle.imageUrl1 ? (
                <img
                  src={vehicle.imageUrl1}
                  alt="Ảnh xe 1"
                  className="w-full h-auto rounded-lg object-cover border border-gray-200"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-lg"></div>
                </div>
              )}
            </div>

            {/* Vehicle Image 2 */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Ảnh xe 2</h3>
              {vehicle.imageUrl2 ? (
                <img
                  src={vehicle.imageUrl2}
                  alt="Ảnh xe 2"
                  className="w-full h-auto rounded-lg object-cover border border-gray-200"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="w-16 h-16 bg-gray-400 rounded-lg"></div>
                </div>
              )}
            </div>

            {/* Vehicle Image 3 */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Ảnh xe 3</h3>
              {vehicle.imageUrl3 ? (
                <img
                  src={vehicle.imageUrl3}
                  alt="Ảnh xe 3"
                  className="w-full h-auto rounded-lg object-cover border border-gray-200"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="w-16 h-16 bg-gray-300 rounded-lg"></div>
                </div>
              )}
            </div>

            {/* Owner Info */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Thông tin chủ xe</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Chủ xe</p>
                  <p className="font-medium text-gray-900">{vehicle.ownerName || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Owner ID</p>
                  <p className="font-medium text-gray-900">#{vehicle.ownerId}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Vehicle Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h3 className="font-bold text-xl text-gray-900 mb-6">Thông tin xe</h3>
              
              <div className="space-y-6">
                {/* Brand */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hãng xe</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{vehicle.brand}</p>
                  )}
                </div>

                {/* Model */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{vehicle.model}</p>
                  )}
                </div>

                {/* License Plate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Biển số xe</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="licensePlate"
                      value={formData.licensePlate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{vehicle.licensePlate}</p>
                  )}
                </div>

                {/* Year of Manufacture */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Năm sản xuất</label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="yearOfManufacture"
                      value={formData.yearOfManufacture}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{vehicle.yearOfManufacture}</p>
                  )}
                </div>

                {/* Battery Capacity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dung lượng pin (kWh)</label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="batteryCapacity"
                      value={formData.batteryCapacity}
                      onChange={handleInputChange}
                      step="0.1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{vehicle.batteryCapacity} kWh</p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Khu vực</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{vehicle.location}</p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái hoạt động</label>
                  {isEditing ? (
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="pending_approval">Chờ phê duyệt</option>
                      <option value="available">Sẵn sàng</option>
                      <option value="in-use">Đang dùng</option>
                      <option value="maintenance">Bảo trì</option>
                    </select>
                  ) : (
                    <div className="space-y-3">
                      <div>{getStatusBadge(vehicle.status)}</div>
                      {/* Admin Actions for Status */}
                      {vehicle.status === 'pending_approval' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveVehicle(true)}
                            disabled={updatingStatus}
                            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 shadow-sm"
                          >
                            ✓ Phê duyệt
                          </button>
                          <button
                            onClick={() => handleApproveVehicle(false, 'Không đạt yêu cầu')}
                            disabled={updatingStatus}
                            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 shadow-sm"
                          >
                            ✗ Từ chối
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Verification Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái xác minh</label>
                  <div className="space-y-3">
                    <div>{getVerificationBadge(vehicle.verificationStatus)}</div>
                    {/* Admin Actions for Verification */}
                    {!isEditing && (
                      <div className="flex gap-2 flex-wrap">
                        {vehicle.verificationStatus !== 'approved' && vehicle.verificationStatus !== 'verified' && (
                          <button
                            onClick={() => handleUpdateVerificationStatus('approved')}
                            disabled={updatingVerification}
                            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 shadow-sm"
                          >
                            ✓ Xác minh
                          </button>
                        )}
                        {vehicle.verificationStatus !== 'rejected' && (
                          <button
                            onClick={() => handleUpdateVerificationStatus('rejected')}
                            disabled={updatingVerification}
                            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 shadow-sm"
                          >
                            ✗ Từ chối xác minh
                          </button>
                        )}
                        {vehicle.verificationStatus !== 'pending' && (
                          <button
                            onClick={() => handleUpdateVerificationStatus('pending')}
                            disabled={updatingVerification}
                            className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 shadow-sm"
                          >
                            ⟳ Đặt lại chờ xác minh
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Registration Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Thông tin đăng ký</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="registrationInfo"
                      value={formData.registrationInfo}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{vehicle.registrationInfo}</p>
                  )}
                </div>

                {/* Image URLs - Only in edit mode */}
                {isEditing && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">URL ảnh 1</label>
                      <input
                        type="text"
                        name="imageUrl1"
                        value={formData.imageUrl1}
                        onChange={handleInputChange}
                        placeholder="https://example.com/image1.jpg"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">URL ảnh 2</label>
                      <input
                        type="text"
                        name="imageUrl2"
                        value={formData.imageUrl2}
                        onChange={handleInputChange}
                        placeholder="https://example.com/image2.jpg"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">URL ảnh 3</label>
                      <input
                        type="text"
                        name="imageUrl3"
                        value={formData.imageUrl3}
                        onChange={handleInputChange}
                        placeholder="https://example.com/image3.jpg"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Xác nhận xóa xe</h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa xe <span className="font-bold">{vehicle.brand} {vehicle.model}</span> (#{vehicle.vehicleId})? 
              Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang xóa...
                  </>
                ) : (
                  'Xóa xe'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
