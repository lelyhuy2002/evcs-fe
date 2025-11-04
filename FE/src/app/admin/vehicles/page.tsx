'use client';

import { useState, useEffect } from 'react';
import { getVehicles, Vehicle } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminVehiclesPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      if (user.role !== 'admin') {
        router.push('/');
        return;
      }
      fetchVehicles();
    } else {
      setLoading(false);
    }
  }, [user, router]);

  const fetchVehicles = async () => {
    setLoading(true);
    setError('');
    try {
      // Get all vehicles (no ownerId filter)
      const response = await getVehicles();
      if (response.success) {
        setVehicles(response.data);
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
      available: { label: 'Sẵn sàng', className: 'bg-green-100 text-green-700' },
      'in-use': { label: 'Đang dùng', className: 'bg-blue-100 text-blue-700' },
      maintenance: { label: 'Bảo trì', className: 'bg-yellow-100 text-yellow-700' },
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
      verified: { label: 'Đã duyệt', className: 'bg-green-100 text-green-700' },
      approved: { label: 'Đã duyệt', className: 'bg-green-100 text-green-700' },
      pending: { label: 'Chờ duyệt', className: 'bg-yellow-100 text-yellow-700' },
      rejected: { label: 'Từ chối', className: 'bg-red-100 text-red-700' },
    };
    
    const config = statusConfig[verificationStatus] || { label: verificationStatus, className: 'bg-gray-100 text-gray-700' };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  // Filter vehicles
  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = 
      v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.licensePlate.includes(searchQuery) ||
      v.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    const matchesVerification = verificationFilter === 'all' || v.verificationStatus === verificationFilter;
    
    return matchesSearch && matchesStatus && matchesVerification;
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Quản lý xe</h1>
          <p className="text-gray-600">Quản lý tất cả xe điện trong hệ thống</p>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-xl shadow-sm p-4 space-y-4">
          {/* Search Bar */}
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Tìm kiếm theo hãng, model, biển số, chủ xe..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={fetchVehicles}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Làm mới
            </button>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="available">Sẵn sàng</option>
              <option value="in-use">Đang dùng</option>
              <option value="maintenance">Bảo trì</option>
            </select>

            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả xác minh</option>
              <option value="verified">Đã duyệt</option>
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
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải danh sách xe...</p>
          </div>
        ) : filteredVehicles.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <div className="w-16 h-16 bg-blue-500 rounded-lg"></div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {searchQuery || statusFilter !== 'all' || verificationFilter !== 'all' 
                ? 'Không tìm thấy xe' 
                : 'Chưa có xe'}
            </h3>
            <p className="text-gray-600">
              {searchQuery || statusFilter !== 'all' || verificationFilter !== 'all'
                ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                : 'Danh sách xe trống'}
            </p>
          </div>
        ) : (
          /* Vehicles Table */
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Xe
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Biển số
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chủ xe
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Năm SX
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pin (kWh)
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Xác minh
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVehicles.map((v) => (
                    <tr key={v.vehicleId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{v.vehicleId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{v.brand} {v.model}</div>
                        <div className="text-xs text-gray-500">{v.location}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{v.licensePlate}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{v.ownerName || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {v.yearOfManufacture}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {v.batteryCapacity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(v.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getVerificationBadge(v.verificationStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/admin/vehicles/${v.vehicleId}`}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium inline-block"
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
                Hiển thị <span className="font-medium">{filteredVehicles.length}</span> / <span className="font-medium">{vehicles.length}</span> xe
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
