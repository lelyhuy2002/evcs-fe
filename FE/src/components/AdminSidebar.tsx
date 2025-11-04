'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, UsersRound, Car, FileText, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const menuItems = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      href: '/admin/users',
      label: 'Quản lý người dùng',
      icon: Users,
    },
    {
      href: '/admin/group-requests',
      label: 'Yêu cầu tạo nhóm',
      icon: FileText,
    },
    {
      href: '/admin/groups',
      label: 'Quản lý nhóm',
      icon: UsersRound,
    },
    {
      href: '/admin/vehicles',
      label: 'Quản lý xe',
      icon: Car,
    },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div>
            <span className="text-lg font-bold">EV Share</span>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-emerald-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
        <button 
          onClick={() => logout()}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
