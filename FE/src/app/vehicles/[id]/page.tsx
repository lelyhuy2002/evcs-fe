'use client';

import { useState, useEffect } from 'react';
import { getVehicleDetail, Vehicle, getFullImageUrl } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function VehicleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0); // Track selected image index

  useEffect(() => {
    if (params.id) {
      fetchVehicleDetail();
    }
  }, [params.id]);

  const fetchVehicleDetail = async () => {
    setLoading(true);
    setError('');
    try {
      const vehicleId = Number(params.id);
      const response = await getVehicleDetail(vehicleId);
      
      if (response.success) {
        setVehicle(response.data);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Không thể tải thông tin xe');
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
      <span className={`px-4 py-2 rounded-full text-sm font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải thông tin xe...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-24 h-24 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <div className="w-16 h-16 bg-red-500 rounded-lg"></div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy thông tin xe</h3>
            <p className="text-gray-600 mb-6">{error || 'Xe không tồn tại hoặc đã bị xóa'}</p>
            <button
              onClick={() => router.push('/vehicles')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if current user is the owner
  const isOwner = user && user.userId === vehicle.ownerId;

  // Collect all images
  const images = [
    vehicle.imageUrl1,
    vehicle.imageUrl2,
    vehicle.imageUrl3
  ].filter(Boolean); // Remove null/undefined

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/vehicles')}
            className="text-gray-600 hover:text-blue-600 mb-4 transition-colors font-medium"
          >
            ← Quay lại
          </button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-emerald-600">
                {vehicle.brand} {vehicle.model}
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Biển số: <span className="font-semibold text-gray-900">{vehicle.licensePlate}</span></p>
            </div>
            <div className="flex gap-3 items-center">
              {getStatusBadge(vehicle.verificationStatus)}
              {isOwner && vehicle.verificationStatus === 'verified' && (
                <Link
                  href="/groups/create"
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-medium shadow-md hover:shadow-lg hover:scale-105"
                >
                  Tạo nhóm
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Image Gallery (Reduced size) */}
          <div className="lg:col-span-1 space-y-4">
            {/* Main Image Display */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="relative h-[400px] bg-gradient-to-br from-blue-100 to-emerald-100">
                {images.length > 0 ? (
                  <img
                    src={getFullImageUrl(images[selectedImage])}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-32 h-32 bg-blue-500 rounded-2xl"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="grid grid-cols-3 gap-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-20 rounded-lg overflow-hidden transition-all ${
                      selectedImage === index 
                        ? 'ring-4 ring-blue-500 shadow-lg scale-105' 
                        : 'ring-2 ring-gray-200 hover:ring-gray-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={getFullImageUrl(img)}
                      alt={`Ảnh ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Specs & Info (Expanded) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vehicle Specs Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Thông số kỹ thuật
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
                  <span className="text-gray-600 font-medium">Hãng xe</span>
                  <span className="font-semibold text-gray-900">{vehicle.brand}</span>
                </div>
                <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
                  <span className="text-gray-600 font-medium">Model</span>
                  <span className="font-semibold text-gray-900">{vehicle.model}</span>
                </div>
                <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
                  <span className="text-gray-600 font-medium">Biển số</span>
                  <span className="font-semibold text-gray-900 font-mono">{vehicle.licensePlate}</span>
                </div>
                <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
                  <span className="text-gray-600 font-medium">Năm SX</span>
                  <span className="font-semibold text-gray-900">{vehicle.yearOfManufacture}</span>
                </div>
                <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg">
                  <span className="text-gray-600 font-medium">Dung lượng pin</span>
                  <span className="font-bold text-emerald-600">{vehicle.batteryCapacity} kWh</span>
                </div>
                <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
                  <span className="text-gray-600 font-medium">Vị trí</span>
                  <span className="font-semibold text-gray-900">{vehicle.location}</span>
                </div>
                <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg md:col-span-2">
                  <span className="text-gray-600 font-medium">Trạng thái</span>
                  <span className={`font-semibold px-3 py-1 rounded-full text-sm ${
                    vehicle.status === 'APPROVED' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {vehicle.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Registration Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Thông tin đăng ký
              </h2>
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-4 border border-gray-200">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{vehicle.registrationInfo}</p>
              </div>
            </div>

            {/* Owner Info and Status Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Owner Info Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Chủ xe
                </h2>
                <div className="space-y-3">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-emerald-50 rounded-lg border border-blue-100">
                    <p className="text-sm text-gray-600 mb-1">Họ và tên</p>
                    <p className="font-bold text-gray-900 text-lg">{vehicle.ownerName || 'N/A'}</p>
                  </div>
                  {isOwner && (
                    <div className="p-4 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg shadow-md">
                      <p className="text-white font-semibold">
                        Đây là xe của bạn
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Verification Info */}
              {vehicle.verificationStatus === 'verified' && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Xác minh
                  </h2>
                  <div className="space-y-3">
                    <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                      <div className="flex items-center mb-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                        <span className="font-bold text-green-900">Đã xác minh</span>
                      </div>
                      {vehicle.verifiedAt && (
                        <p className="text-sm text-green-700 mb-2">
                          <span className="font-semibold">{formatDate(vehicle.verifiedAt)}</span>
                        </p>
                      )}
                      {vehicle.verifiedByName && (
                        <p className="text-sm text-green-700">
                          Người duyệt: <span className="font-semibold">{vehicle.verifiedByName}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Pending Status */}
              {vehicle.verificationStatus === 'pending' && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Trạng thái
                  </h2>
                  <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center mb-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
                      <span className="font-bold text-yellow-900">Đang chờ duyệt</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Xe của bạn đang được xem xét. Chúng tôi sẽ thông báo kết quả sớm nhất.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Rejection Reason */}
            {vehicle.verificationStatus === 'rejected' && vehicle.rejectReason && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-red-900 mb-4">
                  Lý do từ chối
                </h2>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700">{vehicle.rejectReason}</p>
                </div>
              </div>
            )}

            {/* Actions - Only for owner */}
            {isOwner && vehicle.verificationStatus === 'verified' && (
              <div className="bg-gradient-to-br from-emerald-500 to-blue-500 rounded-2xl shadow-lg p-6">
                <div className="text-center">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white mb-2">Xe đã được xác minh!</h3>
                    <p className="text-emerald-50 text-sm">Sẵn sàng tạo nhóm đồng sở hữu</p>
                  </div>
                  <Link
                    href="/groups/create"
                    className="block w-full px-6 py-4 bg-white text-emerald-600 rounded-xl hover:bg-emerald-50 transition-all font-bold shadow-lg hover:shadow-xl hover:scale-105 transform"
                  >
                    Tạo nhóm đồng sở hữu
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
