import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
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
              <span className="text-lg font-bold text-white">EV Share</span>
            </div>
            <p className="text-sm leading-relaxed">
              Nền tảng kết nối những người yêu thích xe điện, tạo nhóm đồng sở hữu và chia sẻ
              trải nghiệm xanh, bền vững cho môi trường.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-emerald-400 transition-colors text-sm">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link href="/groups" className="hover:text-emerald-400 transition-colors text-sm">
                  Nhóm
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-emerald-400 transition-colors text-sm">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-emerald-400 transition-colors text-sm">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Thông tin liên hệ</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <MapPin className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm">
                  123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-sm">+84 123 456 789</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-sm">contact@evshare.vn</span>
              </li>
            </ul>
          </div>

          {/* Social Media & Newsletter */}
          <div>
            <h3 className="text-white font-semibold mb-4">Kết nối với chúng tôi</h3>
            <div className="flex space-x-4 mb-6">
              <a
                href="#"
                className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-emerald-500 transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-emerald-500 transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-emerald-500 transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-emerald-500 transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
            <div>
              <p className="text-sm mb-2">Nhận tin tức mới nhất</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="flex-1 px-3 py-2 bg-gray-800 rounded-l-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button className="bg-emerald-500 px-4 py-2 rounded-r-lg hover:bg-emerald-600 transition-colors text-sm font-medium">
                  Gửi
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            © 2025 EV Share. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
              Chính sách bảo mật
            </Link>
            <Link href="/terms" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
              Điều khoản sử dụng
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
