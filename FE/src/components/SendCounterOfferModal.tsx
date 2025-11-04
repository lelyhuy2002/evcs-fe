'use client';

import { useState } from 'react';
import { reviewMemberRequest } from '@/lib/api';
import { X, Send, AlertCircle } from 'lucide-react';

interface SendCounterOfferModalProps {
  groupId: number;
  memberId: number;
  memberName: string;
  proposedPercentage: number;
  availablePercentage: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SendCounterOfferModal({
  groupId,
  memberId,
  memberName,
  proposedPercentage,
  availablePercentage,
  isOpen,
  onClose,
  onSuccess,
}: Readonly<SendCounterOfferModalProps>) {
  const [counterPercentage, setCounterPercentage] = useState(
    Math.min(proposedPercentage, availablePercentage)
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    // Validation
    if (counterPercentage <= 0) {
      setError('Phần trăm sở hữu phải lớn hơn 0%');
      setSubmitting(false);
      return;
    }

    if (counterPercentage > availablePercentage) {
      setError(`Chỉ còn ${availablePercentage}% khả dụng trong nhóm`);
      setSubmitting(false);
      return;
    }

    if (counterPercentage >= proposedPercentage) {
      setError('Counter offer phải nhỏ hơn % đề xuất ban đầu');
      setSubmitting(false);
      return;
    }

    try {
      const response = await reviewMemberRequest(groupId, memberId, {
        action: 'counter_offer',
        counterOfferPercentage: counterPercentage,
      });

      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể gửi counter offer');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const difference = proposedPercentage - counterPercentage;
  const percentageChange = ((difference / proposedPercentage) * 100).toFixed(1);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-linear-to-r from-emerald-600 to-blue-600 p-6 text-white">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Send className="w-6 h-6" />
                <h2 className="text-2xl font-bold">Gửi Counter Offer</h2>
              </div>
              <p className="text-white/90">Đề xuất ngược cho {memberName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              disabled={submitting}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}

          {/* Info Banner */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Thông tin yêu cầu</p>
                <p><strong>{memberName}</strong> đề xuất sở hữu <strong>{proposedPercentage}%</strong></p>
                <p className="mt-1">Nhóm hiện còn <strong className="text-emerald-600">{availablePercentage}%</strong> khả dụng</p>
              </div>
            </div>
          </div>

          {/* Counter Offer Input */}
          <div>
            <label htmlFor="counterPercentage" className="block text-sm font-semibold text-gray-900 mb-3">
              Phần trăm sở hữu đề xuất ngược
            </label>
            <div className="relative">
              <input
                id="counterPercentage"
                type="number"
                min="0.01"
                max={Math.min(proposedPercentage - 0.01, availablePercentage)}
                step="0.01"
                value={counterPercentage}
                onChange={(e) => setCounterPercentage(Number.parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-4 pr-12 border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all text-2xl font-bold text-center"
                required
                disabled={submitting}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">%</span>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Tối thiểu: 0.01%</span>
              <span>Tối đa: {Math.min(proposedPercentage - 0.01, availablePercentage).toFixed(2)}%</span>
            </div>
          </div>

          {/* Comparison */}
          {counterPercentage > 0 && counterPercentage < proposedPercentage && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
              <h3 className="font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                So sánh
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Đề xuất ban đầu</p>
                  <p className="text-3xl font-bold text-gray-700">{proposedPercentage}%</p>
                </div>
                <div className="bg-white rounded-lg p-4 border-2 border-emerald-500">
                  <p className="text-xs text-emerald-600 mb-1 font-semibold">Counter offer của bạn</p>
                  <p className="text-3xl font-bold text-emerald-600">{counterPercentage}%</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 py-2 px-4 bg-orange-100 rounded-lg">
                <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                <span className="text-orange-900 font-semibold text-sm">
                  Giảm {difference.toFixed(2)}% (-{percentageChange}%)
                </span>
              </div>
            </div>
          )}

          {/* Guidelines */}
          <div className="bg-gray-50 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Lưu ý khi gửi counter offer
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 mt-1">•</span>
                <span>Counter offer phải <strong>nhỏ hơn</strong> % đề xuất ban đầu</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 mt-1">•</span>
                <span>Không được vượt quá % khả dụng trong nhóm</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 mt-1">•</span>
                <span>Thành viên có thể chấp nhận hoặc từ chối counter offer của bạn</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 mt-1">•</span>
                <span>Nếu từ chối, yêu cầu tham gia sẽ bị hủy</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 font-semibold"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || counterPercentage <= 0 || counterPercentage >= proposedPercentage}
              className="flex-1 px-6 py-3 bg-linear-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all disabled:opacity-50 font-semibold shadow-md hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              {submitting ? 'Đang gửi...' : 'Gửi Counter Offer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
