'use client';

import { useState, useEffect } from 'react';
import { getPendingVehicles, approveVehicle, PendingVehicle } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminPendingVehiclesPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [vehicles, setVehicles] = useState<PendingVehicle[]>([]);
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
    fetchPendingVehicles();
  }, [user, router]);

  const fetchPendingVehicles = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getPendingVehicles();
      if (response.success) {
        setVehicles(response.data);
      } else {
        setError(response.message);
      }
    } catch {
      setError('Không thể tải danh sách xe chờ duyệt');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (vehicleId: number) => {
    setProcessingId(vehicleId);
    setError('');
    
    try {
      const response = await approveVehicle(vehicleId, true);
      if (response.success) {
        setVehicles(prev => prev.filter(v => v.id !== vehicleId));
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể duyệt xe');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (vehicleId: number) => {
    const reason = rejectReason[vehicleId];
    if (!reason || reason.trim().length === 0) {
      setError('Vui lòng nhập lý do từ chối');
      return;
    }

    setProcessingId(vehicleId);
    setError('');
    
    try {
      const response = await approveVehicle(vehicleId, false, reason);
      if (response.success) {
        setVehicles(prev => prev.filter(v => v.id !== vehicleId));
        setShowRejectModal(null);
        setRejectReason(prev => {
          const newState = { ...prev };
          delete newState[vehicleId];
          return newState;
        });
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể từ chối xe');
    } finally {
      setProcessingId(null);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="mb-4 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
          >
            ← Quay lại Admin Panel
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Duyệt xe mới</h1>
          <p className="text-gray-600">Kiểm tra và phê duyệt các xe chờ duyệt</p>
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
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && vehicles.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-4xl">✓</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Không có xe chờ duyệt</h3>
            <p className="text-gray-600">Tất cả xe đã được xử lý</p>
          </div>
        )}

        {/* Vehicles Grid */}
        {!loading && vehicles.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Vehicle Images */}
                <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1">
                  {[vehicle.imageUrl1, vehicle.imageUrl2, vehicle.imageUrl3].map((url, idx) => (
                    <div key={idx} className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                      {url ? (
                        <img src={url} alt={`Vehicle ${idx + 1}`} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <span className="text-2xl text-gray-400">🚗</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-6">
                  {/* Vehicle Info */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">
                        {vehicle.brand} {vehicle.model}
                      </h3>
                      <p className="text-lg text-gray-600 font-mono">{vehicle.licensePlate}</p>
                    </div>
                    <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                      Chờ duyệt
                    </span>
                  </div>

                  {/* Owner Info */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <p className="text-xs text-gray-500 mb-2">Chủ sở hữu</p>
                    <p className="font-bold text-lg text-gray-900">{vehicle.owner.fullName}</p>
                    <p className="text-sm text-gray-600">{vehicle.owner.email}</p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <p className="text-xs text-gray-500">CCCD</p>
                        <p className="text-sm font-semibold">{vehicle.owner.cccd}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">GPLX</p>
                        <p className="text-sm font-semibold">{vehicle.owner.driverLicense}</p>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Details */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-blue-700 mb-1">Dung lượng pin</p>
                      <p className="font-bold text-blue-900 text-lg">{vehicle.batteryCapacity} kWh</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs text-green-700 mb-1">Năm sản xuất</p>
                      <p className="font-bold text-green-900 text-lg">{vehicle.yearOfManufacture}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-xs text-purple-700 mb-1">Vị trí</p>
                      <p className="font-bold text-purple-900 text-sm">{vehicle.location}</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3">
                      <p className="text-xs text-orange-700 mb-1">Trạng thái</p>
                      <p className="font-bold text-orange-900 text-sm">{vehicle.status}</p>
                    </div>
                  </div>

                  {/* Registration Info */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-xs text-gray-500 mb-1">Thông tin đăng ký</p>
                    <p className="text-sm text-gray-900">{vehicle.registrationInfo}</p>
                  </div>

                  {/* Meta Info */}
                  <div className="text-xs text-gray-500 mb-4">
                    <p>ID: #{vehicle.id}</p>
                    <p>Ngày tạo: {formatDate(vehicle.createdAt)}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleApprove(vehicle.id)}
                      disabled={processingId === vehicle.id}
                      className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 font-medium"
                    >
                      {processingId === vehicle.id ? 'Đang xử lý...' : '✓ Phê duyệt'}
                    </button>
                    <button
                      onClick={() => setShowRejectModal(vehicle.id)}
                      disabled={processingId === vehicle.id}
                      className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-medium"
                    >
                      ✗ Từ chối
                    </button>
                  </div>
                </div>

                {/* Reject Modal */}
                {showRejectModal === vehicle.id && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Từ chối xe</h3>
                      <p className="text-gray-600 mb-4">Vui lòng nhập lý do từ chối:</p>
                      <textarea
                        rows={4}
                        value={rejectReason[vehicle.id] || ''}
                        onChange={(e) => setRejectReason(prev => ({ ...prev, [vehicle.id]: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none mb-4"
                        placeholder="VD: Giấy tờ không rõ ràng, thiếu thông tin..."
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowRejectModal(null)}
                          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={() => handleReject(vehicle.id)}
                          disabled={processingId === vehicle.id}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          {processingId === vehicle.id ? 'Đang xử lý...' : 'Xác nhận từ chối'}
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
