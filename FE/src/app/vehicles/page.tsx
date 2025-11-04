'use client';

import { useState, useEffect } from 'react';
import { getVehicles, Vehicle, getFullImageUrl } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MyVehiclesPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchMyVehicles();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchMyVehicles = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    try {
      const response = await getVehicles(user.userId);
      if (response.success) {
        // Filter to ensure only user's vehicles
        const myVehicles = response.data.filter(v => v.ownerId === user.userId);
        setVehicles(myVehicles);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Không thể tải danh sách xe');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      verified: { label: 'Đã duyệt', className: 'bg-green-100 text-green-700' },
      approved: { label: 'Đã duyệt', className: 'bg-green-100 text-green-700' },
      pending: { label: 'Chờ duyệt', className: 'bg-yellow-100 text-yellow-700' },
      rejected: { label: 'Từ chối', className: 'bg-red-100 text-red-700' },
    };
    
    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-700' };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 max-w-md text-center">
          <p className="text-yellow-800 font-medium mb-4">Vui lòng đăng nhập để xem danh sách xe</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Xe của tôi</h1>
              <p className="text-gray-600">Quản lý danh sách xe điện của bạn</p>
            </div>
            <Link
              href="/vehicles/create"
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
            >
              Thêm xe mới
            </Link>
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
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải danh sách xe...</p>
          </div>
        ) : vehicles.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <div className="w-16 h-16 bg-blue-500 rounded-lg"></div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có xe nào</h3>
            <p className="text-gray-600 mb-6">Bắt đầu bằng cách thêm xe điện đầu tiên của bạn</p>
            <Link
              href="/vehicles/create"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Thêm xe ngay
            </Link>
          </div>
        ) : (
          /* Vehicle Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.vehicleId}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden"
              >
                {/* Vehicle Image */}
                <div className="relative h-48 bg-gradient-to-br from-blue-100 to-emerald-100">
                  {vehicle.imageUrl1 ? (
                    <img
                      src={getFullImageUrl(vehicle.imageUrl1)}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-20 h-20 bg-blue-500 rounded-xl"></div>
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    {getStatusBadge(vehicle.verificationStatus)}
                  </div>
                </div>

                {/* Vehicle Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {vehicle.brand} {vehicle.model}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex justify-between">
                      <span>Biển số:</span>
                      <span className="font-medium text-gray-900">{vehicle.licensePlate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Năm sản xuất:</span>
                      <span className="font-medium text-gray-900">{vehicle.yearOfManufacture}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pin:</span>
                      <span className="font-medium text-gray-900">{vehicle.batteryCapacity} kWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vị trí:</span>
                      <span className="font-medium text-gray-900">{vehicle.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Trạng thái:</span>
                      <span className="font-medium text-gray-900">{vehicle.status}</span>
                    </div>
                  </div>

                  {/* Rejection Reason */}
                  {vehicle.verificationStatus === 'rejected' && vehicle.rejectReason && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-xs font-medium text-red-900 mb-1">Lý do từ chối:</p>
                      <p className="text-xs text-red-700">{vehicle.rejectReason}</p>
                    </div>
                  )}

                  {/* Verified Info */}
                  {vehicle.verificationStatus === 'verified' && vehicle.verifiedAt && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-xs text-green-700">
                        Đã duyệt: {formatDate(vehicle.verifiedAt)}
                        {vehicle.verifiedByName && ` bởi ${vehicle.verifiedByName}`}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <Link
                      href={`/vehicles/${vehicle.vehicleId}`}
                      className="flex-1 px-4 py-2 text-center bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      Chi tiết
                    </Link>
                    {vehicle.verificationStatus === 'verified' && (
                      <Link
                        href="/groups/create"
                        className="flex-1 px-4 py-2 text-center bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                      >
                        Tạo nhóm
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
