'use client';

import { useState } from 'react';
import { checkInSchedule, Schedule } from '@/lib/api';
import { X, Battery, FileText, LogIn, AlertCircle } from 'lucide-react';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  schedule: Schedule;
}

export default function CheckInModal({
  isOpen,
  onClose,
  onSuccess,
  schedule,
}: Readonly<CheckInModalProps>) {
  const [batteryLevelBefore, setBatteryLevelBefore] = useState<number>(80);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (batteryLevelBefore < 0 || batteryLevelBefore > 100) {
      setError('Mức pin phải từ 0-100%');
      return;
    }

    setLoading(true);

    try {
      const response = await checkInSchedule(schedule.scheduleId, {
        batteryLevelBefore,
        notes: notes.trim() || undefined,
      });

      if (response.success) {
        // Reset form
        setBatteryLevelBefore(80);
        setNotes('');
        
        onSuccess();
        onClose();
      } else {
        setError(response.message || 'Không thể check-in');
      }
    } catch (err) {
      console.error('Error checking in:', err);
      setError('Đã xảy ra lỗi khi check-in');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setBatteryLevelBefore(80);
    setNotes('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
        {/* Header */}
        <div className="bg-linear-to-r from-green-500 to-emerald-500 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <LogIn className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Check-in</h2>
              <p className="text-green-100 text-sm mt-1">Bắt đầu sử dụng xe</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Schedule Info */}
          <div className="bg-gray-50 rounded-xl p-4 border-l-4 border-green-500">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-600 mb-1">Thời gian bắt đầu</p>
                <p className="font-semibold text-gray-900">
                  {new Date(schedule.startTime).toLocaleString('vi-VN')}
                </p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Mục đích</p>
                <p className="font-semibold text-gray-900">{schedule.purpose || 'Không rõ'}</p>
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Battery Level Before */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Battery className="w-4 h-4 inline mr-1" />
              Mức pin trước khi sử dụng (%)
            </label>
            <div className="space-y-3">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={batteryLevelBefore}
                onChange={(e) => setBatteryLevelBefore(Number(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, 
                    ${batteryLevelBefore < 20 ? '#ef4444' : batteryLevelBefore < 50 ? '#f59e0b' : '#10b981'} 0%, 
                    ${batteryLevelBefore < 20 ? '#ef4444' : batteryLevelBefore < 50 ? '#f59e0b' : '#10b981'} ${batteryLevelBefore}%, 
                    #e5e7eb ${batteryLevelBefore}%, 
                    #e5e7eb 100%)`
                }}
              />
              <div className="flex items-center justify-between">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={batteryLevelBefore}
                  onChange={(e) => setBatteryLevelBefore(Number(e.target.value))}
                  className="w-24 px-4 py-2 border-2 border-gray-200 rounded-xl text-center font-bold text-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <div className={`text-4xl font-bold ${
                  batteryLevelBefore < 20 ? 'text-red-500' : 
                  batteryLevelBefore < 50 ? 'text-yellow-500' : 
                  'text-green-500'
                }`}>
                  {batteryLevelBefore}%
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Ghi chú (tùy chọn)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ví dụ: Xe sạch sẽ, không có vấn đề gì..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all resize-none"
            />
          </div>

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
              disabled={loading}
              className="flex-1 px-6 py-3 bg-linear-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận Check-in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
