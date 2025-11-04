'use client';

import { useState, useEffect } from 'react';
import { createSchedule, getSchedules, Schedule } from '@/lib/api';
import { X, Calendar, Clock, AlertTriangle } from 'lucide-react';

interface CreateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  groupId: number;
  groupName: string;
  userId: number;
  preSelectedDate?: Date;
}

export default function CreateBookingModal({
  isOpen,
  onClose,
  onSuccess,
  groupId,
  groupName,
  userId,
  preSelectedDate,
}: Readonly<CreateBookingModalProps>) {
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [conflicts, setConflicts] = useState<Schedule[]>([]);

  // Initialize with pre-selected date if provided
  useEffect(() => {
    if (preSelectedDate && isOpen) {
      const dateStr = preSelectedDate.toISOString().split('T')[0];
      setStartDate(dateStr);
      setEndDate(dateStr);
    }
  }, [preSelectedDate, isOpen]);

  // Check for conflicts when dates change
  useEffect(() => {
    if (startDate && startTime && endDate && endTime) {
      checkConflicts();
    }
  }, [startDate, startTime, endDate, endTime]);

  const checkConflicts = async () => {
    try {
      const response = await getSchedules(groupId);
      if (response.success && response.data) {
        const proposed = {
          start: new Date(`${startDate}T${startTime}`),
          end: new Date(`${endDate}T${endTime}`)
        };

        const conflicting = response.data.filter(schedule => {
          // Skip cancelled schedules
          if (schedule.status === 'cancelled') return false;

          const scheduleStart = new Date(schedule.startTime);
          const scheduleEnd = new Date(schedule.endTime);

          // Check for overlap
          return (proposed.start < scheduleEnd && proposed.end > scheduleStart);
        });

        setConflicts(conflicting);
      }
    } catch (err) {
      console.error('Error checking conflicts:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!startDate || !startTime || !endDate || !endTime) {
      setError('Vui lòng điền đầy đủ thời gian');
      return;
    }

    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);

    if (endDateTime <= startDateTime) {
      setError('Thời gian kết thúc phải sau thời gian bắt đầu');
      return;
    }

    if (startDateTime < new Date()) {
      setError('Không thể đặt lịch trong quá khứ');
      return;
    }

    if (!purpose.trim()) {
      setError('Vui lòng nhập mục đích sử dụng');
      return;
    }

    setLoading(true);

    try {
      const response = await createSchedule({
        groupId,
        userId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        purpose: purpose.trim(),
      });

      if (response.success) {
        // Reset form
        setStartDate('');
        setStartTime('');
        setEndDate('');
        setEndTime('');
        setPurpose('');
        setConflicts([]);
        
        onSuccess();
        onClose();
      } else {
        setError(response.message || 'Không thể tạo lịch đặt xe');
      }
    } catch (err) {
      console.error('Error creating schedule:', err);
      setError('Đã xảy ra lỗi khi tạo lịch');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStartDate('');
    setStartTime('');
    setEndDate('');
    setEndTime('');
    setPurpose('');
    setError('');
    setConflicts([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-linear-to-r from-emerald-500 to-blue-500 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Đặt lịch sử dụng xe</h2>
            <p className="text-emerald-100 mt-1">Nhóm: {groupName}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Start Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Ngày bắt đầu
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Giờ bắt đầu
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                required
              />
            </div>
          </div>

          {/* End Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Ngày kết thúc
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Giờ kết thúc
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                required
              />
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mục đích sử dụng
            </label>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Ví dụ: Đi làm, đưa con đi học, mua sắm..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
              required
            />
          </div>

          {/* Conflict Warning */}
          {conflicts.length > 0 && (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
              <div className="flex items-center gap-2 text-yellow-800 font-semibold mb-3">
                <AlertTriangle className="w-5 h-5" />
                <span>Cảnh báo: Trùng lịch với {conflicts.length} lịch đặt khác</span>
              </div>
              <div className="space-y-2">
                {conflicts.map((conflict) => (
                  <div key={conflict.scheduleId} className="bg-white rounded-lg p-3 text-sm">
                    <div className="font-semibold text-gray-900">{conflict.userName}</div>
                    <div className="text-gray-600">
                      {new Date(conflict.startTime).toLocaleString('vi-VN')} - {' '}
                      {new Date(conflict.endTime).toLocaleString('vi-VN')}
                    </div>
                    <div className="text-gray-500 text-xs">Mục đích: {conflict.purpose}</div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-yellow-700 mt-3">
                ⚠️ Vui lòng cân nhắc chọn thời gian khác hoặc liên hệ với các thành viên trên để điều phối.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || conflicts.length > 0}
              className="flex-1 px-6 py-3 bg-linear-to-r from-emerald-500 to-blue-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? 'Đang xử lý...' : conflicts.length > 0 ? 'Có trùng lịch' : 'Đặt lịch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
