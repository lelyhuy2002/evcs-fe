'use client';

import { useState } from 'react';
import { respondToCounterOffer } from '@/lib/api';
import { X, TrendingDown, AlertCircle } from 'lucide-react';

interface CounterOfferModalProps {
  groupId: number;
  groupName: string;
  memberId: number;
  proposedPercentage: number;
  counterOfferPercentage: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CounterOfferModal({
  groupId,
  groupName,
  memberId,
  proposedPercentage,
  counterOfferPercentage,
  isOpen,
  onClose,
  onSuccess,
}: Readonly<CounterOfferModalProps>) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const difference = proposedPercentage - counterOfferPercentage;
  const percentageChange = ((difference / proposedPercentage) * 100).toFixed(1);

  const handleRespond = async (accept: boolean) => {
    setSubmitting(true);
    setError('');

    try {
      const response = await respondToCounterOffer(groupId, memberId, accept);
      
      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể phản hồi counter offer');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-linear-to-r from-blue-600 to-emerald-600 p-6 text-white">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-6 h-6" />
                <h2 className="text-2xl font-bold">Đề xuất ngược từ chủ nhóm</h2>
              </div>
              <p className="text-white/90">{groupName}</p>
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

        {/* Content */}
        <div className="p-6 space-y-6">
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
                <p className="font-semibold mb-1">Chủ nhóm đã xem xét yêu cầu của bạn</p>
                <p>Họ đề xuất một mức sở hữu khác phù hợp hơn với tình hình hiện tại của nhóm.</p>
              </div>
            </div>
          </div>

          {/* Comparison */}
          <div className="grid grid-cols-2 gap-4">
            {/* Your Proposal */}
            <div className="relative">
              <div className="absolute -top-3 left-4 px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                Đề xuất của bạn
              </div>
              <div className="border-2 border-gray-300 rounded-xl p-6 bg-gray-50">
                <div className="text-center">
                  <p className="text-5xl font-bold text-gray-900">{proposedPercentage}%</p>
                  <p className="text-sm text-gray-600 mt-2">Phần trăm sở hữu ban đầu</p>
                </div>
              </div>
            </div>

            {/* Counter Offer */}
            <div className="relative">
              <div className="absolute -top-3 left-4 px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-full shadow-md">
                Đề xuất từ chủ nhóm
              </div>
              <div className="border-2 border-emerald-500 rounded-xl p-6 bg-linear-to-br from-emerald-50 to-green-50 relative overflow-hidden">
                <div className="absolute top-2 right-2 bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  MỚI
                </div>
                <div className="text-center">
                  <p className="text-5xl font-bold text-emerald-900">{counterOfferPercentage}%</p>
                  <p className="text-sm text-emerald-700 mt-2">Phần trăm đề xuất mới</p>
                </div>
              </div>
            </div>
          </div>

          {/* Difference Indicator */}
          <div className="flex items-center justify-center gap-4 py-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <div className="px-6 py-3 bg-orange-50 border border-orange-200 rounded-full">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                <span className="text-orange-900 font-semibold">
                  Giảm {difference}% (-{percentageChange}%)
                </span>
              </div>
            </div>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Explanation */}
          <div className="bg-gray-50 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Lý do thay đổi
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 mt-1">•</span>
                <span>Đảm bảo phân bổ hợp lý giữa các thành viên trong nhóm</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 mt-1">•</span>
                <span>Phù hợp với tổng phần trăm sở hữu còn lại của nhóm</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 mt-1">•</span>
                <span>Tạo cơ hội cho nhiều thành viên khác tham gia</span>
              </li>
            </ul>
          </div>

          {/* Decision Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
            <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Quyết định của bạn
            </h3>
            <div className="text-sm text-yellow-800 space-y-1">
              <p><strong>✓ Chấp nhận:</strong> Bạn sẽ được duyệt vào nhóm với <strong>{counterOfferPercentage}%</strong> sở hữu</p>
              <p><strong>✗ Từ chối:</strong> Yêu cầu tham gia của bạn sẽ bị hủy hoàn toàn</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => handleRespond(false)}
              disabled={submitting}
              className="flex-1 px-6 py-4 border-2 border-red-300 text-red-700 rounded-xl hover:bg-red-50 transition-all disabled:opacity-50 font-semibold text-lg shadow-sm hover:shadow-md flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              {submitting ? 'Đang xử lý...' : 'Từ chối'}
            </button>
            <button
              onClick={() => handleRespond(true)}
              disabled={submitting}
              className="flex-1 px-6 py-4 bg-linear-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all disabled:opacity-50 font-semibold text-lg shadow-md hover:shadow-xl flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {submitting ? 'Đang xử lý...' : `Chấp nhận ${counterOfferPercentage}%`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
