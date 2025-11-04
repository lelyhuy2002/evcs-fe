import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Users, Car, Shield } from 'lucide-react';

export default function HeroSection() {
  return (
    <div className="relative bg-gradient-to-br from-emerald-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Chia sẻ xe điện,
              <span className="text-emerald-600"> Chia sẻ tương lai</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
              Tham gia cùng cộng đồng EV Share - nơi kết nối những người yêu thích xe điện,
              tạo nhóm đồng sở hữu và cùng nhau xây dựng tương lai xanh, bền vững.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-xl group"
              >
                Bắt đầu ngay
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-emerald-600 font-semibold rounded-lg border-2 border-emerald-600 hover:bg-emerald-50 transition-colors"
              >
                Tìm hiểu thêm
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/car.jpeg"
                alt="Electric Vehicle"
                fill
                className="object-cover"
                priority
              />
            </div>
            {/* Floating Stats Card */}
            <div className="absolute -bottom-8 left-8 right-8 bg-white rounded-xl shadow-xl p-6 grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">500+</div>
                <div className="text-sm text-gray-600">Thành viên</div>
              </div>
              <div className="text-center border-l border-r border-gray-200">
                <div className="text-2xl font-bold text-emerald-600">50+</div>
                <div className="text-sm text-gray-600">Nhóm</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">100+</div>
                <div className="text-sm text-gray-600">Xe điện</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 mt-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Tại sao chọn EV Share?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Chúng tôi mang đến giải pháp hoàn hảo cho những ai muốn trải nghiệm xe điện
            mà không cần đầu tư quá lớn
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
              <Users className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Cộng đồng sôi động</h3>
            <p className="text-gray-600 leading-relaxed">
              Kết nối với hàng trăm người cùng đam mê xe điện, chia sẻ kinh nghiệm và
              tạo nhóm đồng sở hữu dễ dàng
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
              <Car className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Chi phí hợp lý</h3>
            <p className="text-gray-600 leading-relaxed">
              Chia sẻ chi phí mua xe và bảo dưỡng, giúp bạn tiết kiệm đáng kể
              và vẫn sở hữu xe điện cao cấp
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
              <Shield className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">An toàn & Bảo mật</h3>
            <p className="text-gray-600 leading-relaxed">
              Hệ thống xác thực người dùng chặt chẽ và quy trình pháp lý minh bạch,
              đảm bảo quyền lợi của mọi thành viên
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
