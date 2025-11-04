'use client';

import { useState } from 'react';
import { checkOutSchedule, Schedule } from '@/lib/api';
import { X, Battery, FileText, LogOut, AlertCircle, Car } from 'lucide-react';

interface CheckOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  schedule: Schedule;
}

export default function CheckOutModal({
  isOpen,
  onClose,
  onSuccess,
  schedule,
}: Readonly<CheckOutModalProps>) {
  const [batteryLevelAfter, setBatteryLevelAfter] = useState<number>(60);
  const [vehicleCondition, setVehicleCondition] = useState<string>('good');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const conditionOptions = [
    { value: 'excellent', label: 'Xuất sắc', color: 'bg-green-500', description: 'Xe hoàn hảo, rất sạch sẽ' },
    { value: 'good', label: 'Tốt', color: 'bg-blue-500', description: 'Xe ổn định, không vấn đề' },
    { value: 'fair', label: 'Khá', color: 'bg-yellow-500', description: 'Xe hơi bẩn hoặc vấn đề nhỏ' },
    { value: 'poor', label: 'Kém', color: 'bg-red-500', description: 'Xe có vấn đề cần sửa chữa' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (batteryLevelAfter < 0 || batteryLevelAfter > 100) {
      setError('Mức pin phải từ 0-100%');
      return;
    }

    if (schedule.batteryLevelBefore && batteryLevelAfter > schedule.batteryLevelBefore) {
      setError(`Mức pin sau (${batteryLevelAfter}%) không thể cao hơn mức pin trước (${schedule.batteryLevelBefore}%)`);
      return;
    }

    setLoading(true);

    try {
      const response = await checkOutSchedule(schedule.scheduleId, {
        batteryLevelAfter,
        vehicleCondition,
        notes: notes.trim() || undefined,
      });

      if (response.success) {
        // Reset form
        setBatteryLevelAfter(60);
        setVehicleCondition('good');
        setNotes('');
        
        onSuccess();
        onClose();
      } else {
        setError(response.message || 'Không thể check-out');
      }
    } catch (err) {
      console.error('Error checking out:', err);
      setError('Đã xảy ra lỗi khi check-out');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setBatteryLevelAfter(60);
    setVehicleCondition('good');
    setNotes('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  const batteryUsed = schedule.batteryLevelBefore 
    ? schedule.batteryLevelBefore - batteryLevelAfter 
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-500 to-purple-500 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Check-out</h2>
              <p className="text-blue-100 text-sm mt-1">Hoàn tất sử dụng xe</p>
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
          <div className="bg-gray-50 rounded-xl p-4 border-l-4 border-blue-500">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-600 mb-1">Thời gian kết thúc</p>
                <p className="font-semibold text-gray-900">
                  {new Date(schedule.endTime).toLocaleString('vi-VN')}
                </p>
              </div>
              {schedule.batteryLevelBefore && (
                <div>
                  <p className="text-gray-600 mb-1">Pin ban đầu</p>
                  <p className="font-semibold text-gray-900">{schedule.batteryLevelBefore}%</p>
                </div>
              )}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Battery Level After */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Battery className="w-4 h-4 inline mr-1" />
              Mức pin sau khi sử dụng (%)
            </label>
            <div className="space-y-3">
              <input
                type="range"
                min="0"
                max={schedule.batteryLevelBefore || 100}
                step="5"
                value={batteryLevelAfter}
                onChange={(e) => setBatteryLevelAfter(Number(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, 
                    ${batteryLevelAfter < 20 ? '#ef4444' : batteryLevelAfter < 50 ? '#f59e0b' : '#10b981'} 0%, 
                    ${batteryLevelAfter < 20 ? '#ef4444' : batteryLevelAfter < 50 ? '#f59e0b' : '#10b981'} ${batteryLevelAfter}%, 
                    #e5e7eb ${batteryLevelAfter}%, 
                    #e5e7eb 100%)`
                }}
              />
              <div className="flex items-center justify-between">
                <input
                  type="number"
                  min="0"
                  max={schedule.batteryLevelBefore || 100}
                  value={batteryLevelAfter}
                  onChange={(e) => setBatteryLevelAfter(Number(e.target.value))}
                  className="w-24 px-4 py-2 border-2 border-gray-200 rounded-xl text-center font-bold text-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className={`text-4xl font-bold ${
                  batteryLevelAfter < 20 ? 'text-red-500' : 
                  batteryLevelAfter < 50 ? 'text-yellow-500' : 
                  'text-green-500'
                }`}>
                  {batteryLevelAfter}%
                </div>
              </div>
              
              {/* Battery Usage Info */}
              {schedule.batteryLevelBefore && batteryUsed > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                  <p className="text-blue-900 font-semibold">
                    ⚡ Đã sử dụng: <span className="text-2xl">{batteryUsed}%</span> pin
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Vehicle Condition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Car className="w-4 h-4 inline mr-1" />
              Tình trạng xe sau khi sử dụng
            </label>
            <div className="grid grid-cols-2 gap-3">
              {conditionOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setVehicleCondition(option.value)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    vehicleCondition === option.value
                      ? `${option.color} text-white border-transparent shadow-lg scale-105`
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="text-center">
                    <p className="font-bold text-lg mb-1">{option.label}</p>
                    <p className={`text-xs ${
                      vehicleCondition === option.value ? 'text-white opacity-90' : 'text-gray-500'
                    }`}>
                      {option.description}
                    </p>
                  </div>
                </button>
              ))}
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
              placeholder="Ví dụ: Xe bị trầy nhẹ ở cửa sau, cần rửa xe..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
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
              className="flex-1 px-6 py-3 bg-linear-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận Check-out'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
