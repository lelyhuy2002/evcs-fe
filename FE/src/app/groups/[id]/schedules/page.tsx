'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getSchedules, getGroupDetail, Schedule, Group, deleteSchedule } from '@/lib/api';
import ScheduleCalendar from '@/components/ScheduleCalendar';
import CreateBookingModal from '@/components/CreateBookingModal';
import CheckInModal from '@/components/CheckInModal';
import CheckOutModal from '@/components/CheckOutModal';
import { Plus, Calendar, Clock, TrendingUp, AlertCircle, Trash2, LogIn, LogOut } from 'lucide-react';

export default function GroupSchedulesPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const groupId = params.id as string;

  const [group, setGroup] = useState<Group | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'in_progress' | 'completed'>('all');
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);

  useEffect(() => {
    if (groupId) {
      fetchData();
    }
  }, [groupId]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [groupRes, schedulesRes] = await Promise.all([
        getGroupDetail(Number(groupId)),
        getSchedules(Number(groupId))
      ]);

      if (groupRes.success && groupRes.data) {
        setGroup(groupRes.data);
      }

      if (schedulesRes.success && schedulesRes.data) {
        setSchedules(schedulesRes.data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    fetchData();
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowCreateModal(true);
  };

  const handleScheduleClick = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    if (!confirm('Bạn có chắc muốn hủy lịch đặt này?')) return;

    try {
      const response = await deleteSchedule(scheduleId);
      if (response.success) {
        fetchData();
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
      case 'in_progress':
        return schedule.status === 'in_progress';
      case 'completed':
        return schedule.status === 'completed';
      default:
        return true;
    }
  });

  // Calculate stats
  const stats = {
    total: schedules.filter(s => s.status !== 'cancelled').length,
    upcoming: schedules.filter(s => new Date(s.startTime) > new Date() && s.status !== 'cancelled').length,
    inProgress: schedules.filter(s => s.status === 'in_progress').length,
    completed: schedules.filter(s => s.status === 'completed').length,
    totalHours: schedules
      .filter(s => s.status === 'completed')
      .reduce((acc, s) => {
        const hours = (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / (1000 * 60 * 60);
        return acc + hours;
      }, 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Có lỗi xảy ra</h2>
          <p className="text-gray-600 mb-6">{error || 'Không tìm thấy nhóm'}</p>
          <button
            onClick={() => router.push('/groups')}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
          >
            Quay lại danh sách nhóm
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
          <button
            onClick={() => router.push(`/groups/${groupId}`)}
            className="text-emerald-600 hover:text-emerald-700 font-medium mb-4 inline-flex items-center gap-2"
          >
            ← Quay lại nhóm
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Lịch đặt xe - {group.name}
              </h1>
              <p className="text-gray-600">Quản lý và theo dõi lịch sử dụng xe của nhóm</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-linear-to-r from-emerald-500 to-blue-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Đặt lịch mới
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng lịch đặt</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Calendar className="w-10 h-10 text-blue-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Sắp tới</p>
                <p className="text-3xl font-bold text-gray-900">{stats.upcoming}</p>
              </div>
              <Clock className="w-10 h-10 text-yellow-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Đang dùng</p>
                <p className="text-3xl font-bold text-gray-900">{stats.inProgress}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-gray-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Hoàn thành</p>
                <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
              </div>
              <Calendar className="w-10 h-10 text-gray-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng giờ</p>
                <p className="text-3xl font-bold text-gray-900">{Math.round(stats.totalHours)}</p>
              </div>
              <Clock className="w-10 h-10 text-emerald-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-md p-2 mb-8 inline-flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
              filter === 'all'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Tất cả ({schedules.length})
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
              filter === 'upcoming'
                ? 'bg-yellow-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Sắp tới ({stats.upcoming})
          </button>
          <button
            onClick={() => setFilter('in_progress')}
            className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
              filter === 'in_progress'
                ? 'bg-green-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Đang dùng ({stats.inProgress})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
              filter === 'completed'
                ? 'bg-gray-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Hoàn thành ({stats.completed})
          </button>
        </div>

        {/* Calendar */}
        <ScheduleCalendar
          schedules={filteredSchedules}
          onScheduleClick={handleScheduleClick}
          onDateClick={handleDateClick}
        />

        {/* Create Booking Modal */}
        {user && (
          <CreateBookingModal
            isOpen={showCreateModal}
            onClose={() => {
              setShowCreateModal(false);
              setSelectedDate(undefined);
            }}
            onSuccess={handleCreateSuccess}
            groupId={Number(groupId)}
            groupName={group.name}
            userId={user.userId}
            preSelectedDate={selectedDate}
          />
        )}

        {/* Schedule Detail Sidebar */}
        {selectedSchedule && (
          <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl z-40 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Chi tiết lịch đặt</h3>
                <button
                  onClick={() => setSelectedSchedule(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Người đặt</p>
                  <p className="text-lg font-bold text-gray-900">{selectedSchedule.userName}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Thời gian</p>
                  <p className="text-gray-900 font-semibold">
                    {new Date(selectedSchedule.startTime).toLocaleString('vi-VN')}
                  </p>
                  <p className="text-gray-600 text-sm">đến</p>
                  <p className="text-gray-900 font-semibold">
                    {new Date(selectedSchedule.endTime).toLocaleString('vi-VN')}
                  </p>
                </div>

                {selectedSchedule.purpose && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-1">Mục đích</p>
                    <p className="text-gray-900">{selectedSchedule.purpose}</p>
                  </div>
                )}

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Trạng thái</p>
                  <p className="text-lg font-bold text-gray-900 capitalize">{selectedSchedule.status}</p>
                </div>

                {/* Battery levels if checked in/out */}
                {selectedSchedule.batteryLevelBefore !== undefined && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-1">Mức pin ban đầu</p>
                    <p className="text-2xl font-bold text-green-600">{selectedSchedule.batteryLevelBefore}%</p>
                  </div>
                )}

                {selectedSchedule.batteryLevelAfter !== undefined && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-1">Mức pin cuối</p>
                    <p className="text-2xl font-bold text-blue-600">{selectedSchedule.batteryLevelAfter}%</p>
                    {selectedSchedule.batteryLevelBefore && (
                      <p className="text-sm text-gray-600 mt-2">
                        Đã dùng: <span className="font-semibold">{selectedSchedule.batteryLevelBefore - selectedSchedule.batteryLevelAfter}%</span>
                      </p>
                    )}
                  </div>
                )}

                {selectedSchedule.vehicleCondition && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-1">Tình trạng xe</p>
                    <p className="text-lg font-bold text-gray-900 capitalize">{selectedSchedule.vehicleCondition}</p>
                  </div>
                )}

                {selectedSchedule.notes && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-1">Ghi chú</p>
                    <p className="text-gray-900">{selectedSchedule.notes}</p>
                  </div>
                )}

                {/* Action Buttons */}
                {user?.userId === selectedSchedule.userId && (
                  <div className="pt-4 space-y-3">
                    {/* Check-in: Only for approved schedules that haven't started */}
                    {selectedSchedule.status === 'approved' && !selectedSchedule.batteryLevelBefore && (
                      <button
                        onClick={() => setShowCheckInModal(true)}
                        className="w-full px-4 py-3 bg-linear-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                      >
                        <LogIn className="w-5 h-5" />
                        Check-in (Bắt đầu sử dụng)
                      </button>
                    )}

                    {/* Check-out: Only for in_progress schedules */}
                    {selectedSchedule.status === 'in_progress' && !selectedSchedule.batteryLevelAfter && (
                      <button
                        onClick={() => setShowCheckOutModal(true)}
                        className="w-full px-4 py-3 bg-linear-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                      >
                        <LogOut className="w-5 h-5" />
                        Check-out (Hoàn tất)
                      </button>
                    )}

                    {/* Cancel: Only for pending schedules */}
                    {selectedSchedule.status === 'pending' && (
                      <button
                        onClick={() => handleDeleteSchedule(selectedSchedule.scheduleId)}
                        className="w-full px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Hủy lịch
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Check-in Modal */}
        {selectedSchedule && showCheckInModal && (
          <CheckInModal
            isOpen={showCheckInModal}
            onClose={() => setShowCheckInModal(false)}
            onSuccess={() => {
              fetchData();
              setShowCheckInModal(false);
            }}
            schedule={selectedSchedule}
          />
        )}

        {/* Check-out Modal */}
        {selectedSchedule && showCheckOutModal && (
          <CheckOutModal
            isOpen={showCheckOutModal}
            onClose={() => setShowCheckOutModal(false)}
            onSuccess={() => {
              fetchData();
              setShowCheckOutModal(false);
            }}
            schedule={selectedSchedule}
          />
        )}
      </div>
    </div>
  );
}
