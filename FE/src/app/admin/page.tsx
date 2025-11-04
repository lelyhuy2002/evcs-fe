import { Users, UsersRound, Car, FileText, TrendingUp, TrendingDown } from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    {
      title: 'Tổng người dùng',
      value: '1,234',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Yêu cầu chờ duyệt',
      value: '23',
      change: '+5',
      trend: 'up',
      icon: FileText,
      color: 'bg-yellow-500',
    },
    {
      title: 'Tổng nhóm',
      value: '156',
      change: '+8.2%',
      trend: 'up',
      icon: UsersRound,
      color: 'bg-emerald-500',
    },
    {
      title: 'Tổng xe',
      value: '89',
      change: '-2.1%',
      trend: 'down',
      icon: Car,
      color: 'bg-purple-500',
    },
  ];

  const recentActivities = [
    { id: 1, user: 'Nguyễn Văn A', action: 'đã tạo yêu cầu thành lập nhóm', time: '5 phút trước' },
    { id: 2, user: 'Trần Thị B', action: 'đã đăng ký tài khoản mới', time: '10 phút trước' },
    { id: 3, user: 'Lê Văn C', action: 'đã thêm xe mới vào hệ thống', time: '15 phút trước' },
    { id: 4, user: 'Phạm Thị D', action: 'đã tham gia nhóm VinFast VF8', time: '30 phút trước' },
    { id: 5, user: 'Hoàng Văn E', action: 'đã cập nhật thông tin cá nhân', time: '1 giờ trước' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Tổng quan hệ thống EV Share</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
          
          return (
            <div key={stat.title} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center space-x-1 text-sm ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendIcon className="w-4 h-4" />
                  <span className="font-medium">{stat.change}</span>
                </div>
              </div>
              <h3 className="text-gray-600 text-sm">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Hoạt động gần đây</h2>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-emerald-600 text-xs font-semibold">
                    {activity.user.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Thống kê nhanh</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Người dùng đăng ký hôm nay</span>
              <span className="text-2xl font-bold text-gray-900">45</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-600">Nhóm hoạt động</span>
              <span className="text-2xl font-bold text-gray-900">142/156</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '91%' }}></div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-600">Xe đang sử dụng</span>
              <span className="text-2xl font-bold text-gray-900">67/89</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
