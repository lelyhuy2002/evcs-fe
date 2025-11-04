'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { getVehicles, vehicleKeys } from '@/lib/services/vehicleService';
import { getFullImageUrl } from '@/lib/api';
import type { Vehicle, VehicleQuery } from '@/types/vehicle';
import { getVerificationStatusColor, getVehicleStatusColor, getVehicleDisplayName } from '@/types/vehicle';

// ============================================================================
// VEHICLE LIST COMPONENT
// ============================================================================

interface VehicleListProps {
  /** Optional filter by owner ID */
  ownerId?: number;
  /** Show create button */
  showCreateButton?: boolean;
  /** Custom empty state message */
  emptyMessage?: string;
}

export function VehicleList({ ownerId, showCreateButton = true, emptyMessage }: VehicleListProps) {
  const query: VehicleQuery | undefined = ownerId ? { ownerId } : undefined;

  const { data: vehicles, isLoading, error } = useQuery({
    queryKey: vehicleKeys.list(query),
    queryFn: () => getVehicles(query),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 text-sm">
          {error instanceof Error ? error.message : 'Không thể tải danh sách xe'}
        </p>
      </div>
    );
  }

  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0h.01" />
          </svg>
        </div>
        <p className="text-gray-500 mb-4">
          {emptyMessage || 'Chưa có xe nào. Hãy thêm xe đầu tiên của bạn!'}
        </p>
        {showCreateButton && (
          <Link
            href="/vehicles/create"
            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm xe mới
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      {showCreateButton && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Danh sách xe của tôi</h2>
          <Link
            href="/vehicles/create"
            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm xe mới
          </Link>
        </div>
      )}

      {/* Vehicle Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((vehicle) => (
          <VehicleCard key={vehicle.vehicleId} vehicle={vehicle} />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// VEHICLE CARD COMPONENT
// ============================================================================

interface VehicleCardProps {
  vehicle: Vehicle;
}

function VehicleCard({ vehicle }: VehicleCardProps) {
  const displayName = getVehicleDisplayName(vehicle);
  const verificationColor = getVerificationStatusColor(vehicle.verificationStatus);
  const statusColor = getVehicleStatusColor(vehicle.status);

  return (
    <Link href={`/vehicles/${vehicle.vehicleId}`} className="block group">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:border-green-500 hover:shadow-md transition-all overflow-hidden">
        {/* Vehicle Image */}
        <div className="relative h-48 bg-gray-100">
          {vehicle.imageUrl1 ? (
            <img
              src={getFullImageUrl(vehicle.imageUrl1)}
              alt={displayName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0h.01" />
              </svg>
            </div>
          )}
        </div>

        {/* Vehicle Info */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
            {vehicle.brand} {vehicle.model}
          </h3>

          {/* License Plate */}
          <p className="text-sm font-mono font-bold text-gray-700 bg-gray-100 inline-block px-3 py-1 rounded mb-3">
            {vehicle.licensePlate}
          </p>

          {/* Details */}
          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>{vehicle.batteryCapacity} kWh</span>
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Năm {vehicle.yearOfManufacture}</span>
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{vehicle.location}</span>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex gap-2">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${verificationColor}`}>
              {vehicle.verificationStatus}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor}`}>
              {vehicle.status}
            </span>
          </div>

          {/* Rejection Reason */}
          {vehicle.verificationStatus === 'Rejected' && vehicle.rejectReason && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              <span className="font-medium">Lý do từ chối:</span> {vehicle.rejectReason}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
