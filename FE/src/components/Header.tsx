'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Menu, X, Zap, User, LogOut, UserCircle, ChevronDown, Bell, Clock, Users as UsersIcon, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getSchedules, Member, Schedule } from '@/lib/api';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [counterOffers, setCounterOffers] = useState<Member[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<Schedule[]>([]);
  const { user, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch counter offers (members with pending_user_response status)
      const groupsWithCounterOffers: Member[] = [];
      
      // This is a simplified version - in production, you'd have a dedicated endpoint
      // For now, we'll just set empty arrays as we don't have group memberships readily available
      setCounterOffers(groupsWithCounterOffers);

      // Fetch upcoming bookings (next 24 hours)
      const schedulesRes = await getSchedules();
      if (schedulesRes.success && schedulesRes.data) {
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        
        const upcoming = schedulesRes.data.filter(s => {
          const start = new Date(s.startTime);
          return s.userId === user.userId && 
                 start > now && 
                 start < tomorrow && 
                 s.status !== 'cancelled';
        });
        
        setUpcomingBookings(upcoming);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Refresh every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user, fetchNotifications]);

  const handleLogout = async () => {
    await logout();
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">EV Share</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors">
              Trang chủ
            </Link>
            <Link href="/groups" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors">
              Nhóm sở hữu
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors">
              Giới thiệu
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors">
              Liên hệ
            </Link>
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {/* Notification Bell */}
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Bell className="w-6 h-6 text-gray-700" />
                    {/* Badge */}
                    {(counterOffers.length + upcomingBookings.length) > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {counterOffers.length + upcomingBookings.length}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {isNotificationOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto">
                      {/* Header */}
                      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-sm font-bold text-gray-900">Thông báo</h3>
                      </div>

                      {/* Notifications List */}
                      <div className="divide-y divide-gray-100">
                        {/* Counter Offers */}
                        {counterOffers.map((member) => (
                          <Link
                            key={member.id}
                            href={`/groups/${member.groupId}`}
                            onClick={() => setIsNotificationOpen(false)}
                            className="block px-4 py-3 hover:bg-orange-50 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shrink-0">
                                <UsersIcon className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900">Counter Offer mới</p>
                                <p className="text-xs text-gray-600 mt-0.5">
                                  Bạn có counter offer chờ phản hồi
                                </p>
                                <p className="text-xs text-orange-600 mt-1 font-medium">
                                  {member.counterOfferPercentage}% ownership
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}

                        {/* Upcoming Bookings */}
                        {upcomingBookings.map((booking) => (
                          <Link
                            key={booking.scheduleId}
                            href={`/groups/${booking.groupId}/schedules`}
                            onClick={() => setIsNotificationOpen(false)}
                            className="block px-4 py-3 hover:bg-blue-50 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                                <Calendar className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900">Lịch đặt sắp tới</p>
                                <p className="text-xs text-gray-600 mt-0.5 truncate">
                                  {booking.groupName}
                                </p>
                                <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{new Date(booking.startTime).toLocaleString('vi-VN', { 
                                    month: 'short', 
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}</span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}

                        {/* Empty State */}
                        {counterOffers.length === 0 && upcomingBookings.length === 0 && (
                          <div className="px-4 py-8 text-center">
                            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Không có thông báo mới</p>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      {(counterOffers.length > 0 || upcomingBookings.length > 0) && (
                        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                          <Link
                            href="/profile/bookings"
                            onClick={() => setIsNotificationOpen(false)}
                            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                          >
                            Xem tất cả lịch đặt →
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user.fullName ? getInitials(user.fullName) : <User className="w-5 h-5" />}
                    </span>
                  </div>
                  {/* User Name */}
                  <span className="text-gray-700 font-medium">{user.fullName || user.email}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.fullName || user.email}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                      <div className="mt-1">
                        <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                          user.verificationStatus === 'verified' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {user.verificationStatus === 'verified' ? 'Đã xác minh' : 'Chờ xác minh'}
                        </span>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <Link
                      href="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <UserCircle className="w-4 h-4 mr-3" />
                      Trang cá nhân
                    </Link>
                    <Link
                      href="/vehicles"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-4 h-4 mr-3 bg-blue-500 rounded"></div>
                      Xe của tôi
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-emerald-600 font-medium">
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <Link href="/" className="text-gray-700 hover:text-emerald-600 font-medium">
                Trang chủ
              </Link>
              <Link href="/groups" className="text-gray-700 hover:text-emerald-600 font-medium">
                Nhóm sở hữu
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-emerald-600 font-medium">
                Giới thiệu
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-emerald-600 font-medium">
                Liên hệ
              </Link>
              <div className="pt-4 border-t border-gray-200 space-y-4">
                {user ? (
                  <>
                    {/* Mobile User Info */}
                    <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
                      <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {user.fullName ? getInitials(user.fullName) : <User className="w-5 h-5" />}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.fullName || user.email}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <Link 
                      href="/profile" 
                      className="block text-gray-700 hover:text-emerald-600 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Trang cá nhân
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block text-center text-gray-700 hover:text-emerald-600 font-medium"
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      href="/register"
                      className="block text-center bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      Đăng ký
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
