'use client';

import { useState } from 'react';
import { Search, Check, X, Eye } from 'lucide-react';

export default function GroupRequestsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const requests = [
    { id: 1, groupName: 'Tesla Model 3 Hà Nội', creator: 'Nguyễn Văn A', email: 'nguyenvana@email.com', members: 5, description: 'Nhóm chia sẻ xe Tesla Model 3 khu vực Hà Nội', status: 'pending', date: '28/01/2025' },
    { id: 2, groupName: 'VinFast VF9 Đà Nẵng', creator: 'Trần Thị B', email: 'tranthib@email.com', members: 3, description: 'Cùng sở hữu VinFast VF9 tại Đà Nẵng', status: 'pending', date: '27/01/2025' },
    { id: 3, groupName: 'Hyundai Ioniq 6 Sài Gòn', creator: 'Lê Văn C', email: 'levanc@email.com', members: 4, description: 'Nhóm đồng sở hữu Hyundai Ioniq 6', status: 'approved', date: '26/01/2025' },
    { id: 4, groupName: 'BYD Atto 3 Hải Phòng', creator: 'Phạm Thị D', email: 'phamthid@email.com', members: 6, description: 'Chia sẻ BYD Atto 3 tại Hải Phòng', status: 'rejected', date: '25/01/2025' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Chờ duyệt</span>;
      case 'approved':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Đã duyệt</span>;
      case 'rejected':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Từ chối</span>;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Yêu cầu tạo nhóm</h1>
        <p className="text-gray-600 mt-1">Quản lý các yêu cầu tạo nhóm mới từ người dùng</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-sm">Chờ duyệt</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {requests.filter(r => r.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-sm">Đã duyệt</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {requests.filter(r => r.status === 'approved').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-sm">Từ chối</p>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {requests.filter(r => r.status === 'rejected').length}
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên nhóm, người tạo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên nhóm
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Người tạo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số thành viên
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày yêu cầu
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map((request) => (
              <tr key={request.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{request.groupName}</p>
                    <p className="text-sm text-gray-500">{request.description}</p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{request.creator}</p>
                    <p className="text-sm text-gray-500">{request.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {request.members} người
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(request.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {request.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button className="text-blue-600 hover:text-blue-900" title="Xem chi tiết">
                      <Eye className="w-4 h-4" />
                    </button>
                    {request.status === 'pending' && (
                      <>
                        <button className="text-green-600 hover:text-green-900" title="Phê duyệt">
                          <Check className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900" title="Từ chối">
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-gray-700">
          Hiển thị <span className="font-medium">1</span> đến <span className="font-medium">4</span> trong tổng số{' '}
          <span className="font-medium">20</span> yêu cầu
        </p>
        <div className="flex gap-2">
          <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            Trước
          </button>
          <button className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-sm">
            1
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            Sau
          </button>
        </div>
      </div>
    </div>
  );
}
