'use client';

import { useState } from 'react';
import { joinGroup } from '@/lib/api';
import { X } from 'lucide-react';

interface JoinGroupModalProps {
  groupId: number;
  groupName: string;
  minOwnershipPercentage: number;
  availableOwnership: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function JoinGroupModal({
  groupId,
  groupName,
  minOwnershipPercentage,
  availableOwnership,
  isOpen,
  onClose,
  onSuccess,
}: JoinGroupModalProps) {
  const [formData, setFormData] = useState({
    proposedOwnershipPercentage: minOwnershipPercentage,
    reason: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'proposedOwnershipPercentage' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.proposedOwnershipPercentage < minOwnershipPercentage) {
      setError(`Phần trăm sở hữu tối thiểu là ${minOwnershipPercentage}%`);
      return;
    }

    if (formData.proposedOwnershipPercentage > availableOwnership) {
      setError(`Chỉ còn ${availableOwnership.toFixed(1)}% sở hữu khả dụng`);
      return;
    }

    if (formData.reason.trim().length < 10) {
      setError('Lý do tham gia phải có ít nhất 10 ký tự');
      return;
    }

    setSubmitting(true);
    try {
      const response = await joinGroup({
        groupId,
        proposedOwnershipPercentage: formData.proposedOwnershipPercentage,
        reason: formData.reason,
      });

      if (response.success) {
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          proposedOwnershipPercentage: minOwnershipPercentage,
          reason: '',
        });
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể gửi yêu cầu tham gia');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-emerald-500 to-blue-500 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Tham gia nhóm</h2>
            <p className="text-white/90 mt-1">{groupName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            disabled={submitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">✗ {error}</p>
            </div>
          )}

          {/* Available Ownership Info */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Thông tin quan trọng:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>Sở hữu tối thiểu: <strong>{minOwnershipPercentage}%</strong></li>
                  <li>Sở hữu khả dụng: <strong>{availableOwnership.toFixed(1)}%</strong></li>
                  <li>Yêu cầu sẽ được chủ nhóm xem xét và phê duyệt</li>
                  <li>Chủ nhóm có thể đồng ý, từ chối hoặc đề xuất % khác</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Ownership Percentage Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phần trăm sở hữu đề xuất (%) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="proposedOwnershipPercentage"
              required
              min={minOwnershipPercentage}
              max={availableOwnership}
              step={0.1}
              value={formData.proposedOwnershipPercentage}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder={`Từ ${minOwnershipPercentage}% đến ${availableOwnership.toFixed(1)}%`}
            />
            <p className="mt-1 text-sm text-gray-500">
              Bạn có thể đề xuất bất kỳ % nào trong phạm vi cho phép
            </p>
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lý do tham gia <span className="text-red-500">*</span>
            </label>
            <textarea
              name="reason"
              required
              rows={4}
              value={formData.reason}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              placeholder="Ví dụ: Tôi sống gần khu vực xe hoạt động và muốn tham gia chia sẻ chi phí sở hữu..."
            />
            <p className="mt-1 text-sm text-gray-500">
              Tối thiểu 10 ký tự ({formData.reason.length}/10)
            </p>
          </div>

          {/* Summary */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <h3 className="font-semibold text-gray-900">Tóm tắt yêu cầu:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Nhóm:</p>
                <p className="font-semibold text-gray-900">{groupName}</p>
              </div>
              <div>
                <p className="text-gray-600">% Sở hữu đề xuất:</p>
                <p className="font-semibold text-emerald-600">{formData.proposedOwnershipPercentage}%</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-lg hover:from-emerald-700 hover:to-blue-700 transition-all disabled:opacity-50 font-medium shadow-md hover:shadow-lg"
            >
              {submitting ? 'Đang gửi...' : '✓ Gửi yêu cầu tham gia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
