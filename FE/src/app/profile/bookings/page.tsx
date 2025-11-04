'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getSchedules, deleteSchedule, Schedule } from '@/lib/api';
import CheckInModal from '@/components/CheckInModal';
import CheckOutModal from '@/components/CheckOutModal';
import { Calendar, Clock, Users, Battery, Car, Trash2, LogIn, LogOut, AlertCircle, Filter } from 'lucide-react';

export default function MyBookingsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMyBookings();
    }
  }, [user]);

  const fetchMyBookings = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch all schedules (backend should filter by current user)
      const response = await getSchedules();
      
      if (response.success && response.data) {
        // Filter only current user's schedules
        const mySchedules = response.data.filter(s => s.userId === user?.userId);
        setSchedules(mySchedules);
      } else {
        setError(response.message || 'Không thể tải lịch đặt');
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Đã xảy ra lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    if (!confirm('Bạn có chắc muốn hủy lịch đặt này?')) return;

    try {
      const response = await deleteSchedule(scheduleId);
      if (response.success) {
        fetchMyBookings();
        setSelectedSchedule(null);
      }
    } catch (err) {
      console.error('Error deleting schedule:', err);
    }
  };

  // Filter schedules
  const filteredSchedules = schedules.filter(schedule => {
    const now = new Date();
    const start = new Date(schedule.startTime);
    const end = new Date(schedule.endTime);

    switch (filter) {
      case 'upcoming':
        return start > now && schedule.status !== 'cancelled';
      case 'past':
        return end < now && schedule.status !== 'cancelled';
      case 'cancelled':
        return schedule.status === 'cancelled';
      default:
        return true;
    }
  }).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  // Calculate stats
  const stats = {
    total: schedules.length,
    upcoming: schedules.filter(s => new Date(s.startTime) > new Date() && s.status !== 'cancelled').length,
    past: schedules.filter(s => new Date(s.endTime) < new Date() && s.status !== 'cancelled').length,
    cancelled: schedules.filter(s => s.status === 'cancelled').length,
    totalBatteryUsed: schedules
      .filter(s => s.batteryLevelBefore && s.batteryLevelAfter)
      .reduce((acc, s) => acc + (s.batteryLevelBefore! - s.batteryLevelAfter!), 0),
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'approved': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'in_progress': return 'bg-green-100 border-green-300 text-green-800';
      case 'completed': return 'bg-gray-100 border-gray-300 text-gray-600';
      case 'cancelled': return 'bg-red-100 border-red-300 text-red-600';
      default: return 'bg-gray-100 border-gray-300 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải lịch đặt...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Có lỗi xảy ra</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchMyBookings}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Lịch đặt xe của tôi</h1>
          <p className="text-gray-600">Quản lý và theo dõi tất cả lịch đặt xe của bạn</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng lịch</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Calendar className="w-10 h-10 text-blue-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Sắp tới</p>
                <p className="text-3xl font-bold text-gray-900">{stats.upcoming}</p>
              </div>
              <Clock className="w-10 h-10 text-green-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-gray-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Đã qua</p>
                <p className="text-3xl font-bold text-gray-900">{stats.past}</p>
              </div>
              <Calendar className="w-10 h-10 text-gray-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Đã hủy</p>
                <p className="text-3xl font-bold text-gray-900">{stats.cancelled}</p>
              </div>
              <Trash2 className="w-10 h-10 text-red-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng pin dùng</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalBatteryUsed}%</p>
              </div>
              <Battery className="w-10 h-10 text-emerald-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-md p-2 mb-8 inline-flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              filter === 'all'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Filter className="w-4 h-4" />
            Tất cả ({schedules.length})
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
              filter === 'upcoming'
                ? 'bg-green-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Sắp tới ({stats.upcoming})
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
              filter === 'past'
                ? 'bg-gray-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Đã qua ({stats.past})
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
              filter === 'cancelled'
                ? 'bg-red-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Đã hủy ({stats.cancelled})
          </button>
        </div>

        {/* Bookings List */}
        {filteredSchedules.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <Calendar className="w-20 h-20 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Không có lịch đặt</h3>
            <p className="text-gray-600">
              {filter === 'all' && 'Bạn chưa có lịch đặt xe nào'}
              {filter === 'upcoming' && 'Bạn không có lịch đặt sắp tới'}
              {filter === 'past' && 'Bạn không có lịch đặt trong quá khứ'}
              {filter === 'cancelled' && 'Bạn không có lịch đặt đã hủy'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredSchedules.map((schedule) => (
              <div
                key={schedule.scheduleId}
                className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all p-6 border-l-4"
                style={{ borderLeftColor: schedule.userColor || '#3b82f6' }}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Schedule Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Users className="w-5 h-5 text-gray-500" />
                      <h3 className="text-lg font-bold text-gray-900">{schedule.groupName}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${getStatusColor(schedule.status)}`}>
                        {schedule.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="w-4 h-4" />
                        <div>
                          <p className="text-sm font-medium">Thời gian</p>
                          <p className="text-xs text-gray-600">
                            {new Date(schedule.startTime).toLocaleString('vi-VN')} - {new Date(schedule.endTime).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      </div>

                      {schedule.purpose && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar className="w-4 h-4" />
                          <div>
                            <p className="text-sm font-medium">Mục đích</p>
                            <p className="text-xs text-gray-600">{schedule.purpose}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Battery & Vehicle Info */}
                    {(schedule.batteryLevelBefore || schedule.vehicleCondition) && (
                      <div className="flex gap-4 mt-3 pt-3 border-t border-gray-200">
                        {schedule.batteryLevelBefore !== undefined && (
                          <div className="flex items-center gap-2">
                            <Battery className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-gray-700">
                              Pin: <span className="font-semibold">{schedule.batteryLevelBefore}%</span>
                              {schedule.batteryLevelAfter !== undefined && (
                                <span className="text-gray-500">
                                  {' '}→ {schedule.batteryLevelAfter}% 
                                  <span className="text-red-600"> (-{schedule.batteryLevelBefore - schedule.batteryLevelAfter}%)</span>
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                        {schedule.vehicleCondition && (
                          <div className="flex items-center gap-2">
                            <Car className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-gray-700">
                              Tình trạng: <span className="font-semibold capitalize">{schedule.vehicleCondition}</span>
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {schedule.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold">Ghi chú:</span> {schedule.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col gap-2">
                    {/* Check-in */}
                    {schedule.status === 'approved' && !schedule.batteryLevelBefore && (
                      <button
                        onClick={() => {
                          setSelectedSchedule(schedule);
                          setShowCheckInModal(true);
                        }}
                        className="px-4 py-2 bg-linear-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all flex items-center gap-2 whitespace-nowrap"
                      >
                        <LogIn className="w-4 h-4" />
                        Check-in
                      </button>
                    )}

                    {/* Check-out */}
                    {schedule.status === 'in_progress' && !schedule.batteryLevelAfter && (
                      <button
                        onClick={() => {
                          setSelectedSchedule(schedule);
                          setShowCheckOutModal(true);
                        }}
                        className="px-4 py-2 bg-linear-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all flex items-center gap-2 whitespace-nowrap"
                      >
                        <LogOut className="w-4 h-4" />
                        Check-out
                      </button>
                    )}

                    {/* View Group */}
                    <button
                      onClick={() => router.push(`/groups/${schedule.groupId}`)}
                      className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2 whitespace-nowrap"
                    >
                      <Users className="w-4 h-4" />
                      Xem nhóm
                    </button>

                    {/* Cancel */}
                    {schedule.status === 'pending' && (
                      <button
                        onClick={() => handleDeleteSchedule(schedule.scheduleId)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                      >
                        <Trash2 className="w-4 h-4" />
                        Hủy lịch
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Check-in Modal */}
        {selectedSchedule && showCheckInModal && (
          <CheckInModal
            isOpen={showCheckInModal}
            onClose={() => {
              setShowCheckInModal(false);
              setSelectedSchedule(null);
            }}
            onSuccess={() => {
              fetchMyBookings();
              setShowCheckInModal(false);
              setSelectedSchedule(null);
            }}
            schedule={selectedSchedule}
          />
        )}

        {/* Check-out Modal */}
        {selectedSchedule && showCheckOutModal && (
          <CheckOutModal
            isOpen={showCheckOutModal}
            onClose={() => {
              setShowCheckOutModal(false);
              setSelectedSchedule(null);
            }}
            onSuccess={() => {
              fetchMyBookings();
              setShowCheckOutModal(false);
              setSelectedSchedule(null);
            }}
            schedule={selectedSchedule}
          />
        )}
      </div>
    </div>
  );
}
