import { Target, Eye, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="bg-linear-to-br from-emerald-600 to-emerald-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Về EV Share</h1>
          <p className="text-xl max-w-3xl mx-auto opacity-90">
            Chúng tôi tin rằng tương lai của giao thông là xanh, bền vững và dễ tiếp cận cho mọi người
          </p>
        </div>
      </div>

      {/* Story Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Câu chuyện của chúng tôi</h2>
          <div className="prose prose-lg text-gray-600 space-y-4">
            <p>
              EV Share ra đời từ ý tưởng đơn giản: làm thế nào để xe điện trở nên dễ tiếp cận hơn 
              với mọi người? Chúng tôi nhận thấy rằng chi phí ban đầu cao là rào cản lớn nhất 
              ngăn cản nhiều người chuyển sang sử dụng xe điện.
            </p>
            <p>
              Từ đó, mô hình đồng sở hữu được hình thành - nơi những người cùng chí hướng 
              có thể cùng nhau chia sẻ chi phí và trải nghiệm sở hữu xe điện cao cấp mà không 
              cần đầu tư quá lớn.
            </p>
            <p>
              Hơn cả việc tiết kiệm chi phí, EV Share tạo nên một cộng đồng những người yêu 
              thích công nghệ xanh, cùng nhau lan tỏa thông điệp bảo vệ môi trường và phát 
              triển bền vững.
            </p>
          </div>
        </div>
      </div>

      {/* Mission, Vision, Values */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Mission */}
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Sứ mệnh</h3>
              <p className="text-gray-600">
                Làm cho xe điện trở nên dễ tiếp cận với mọi người thông qua mô hình đồng sở hữu, 
                góp phần xây dựng tương lai giao thông xanh và bền vững.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <Eye className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Tầm nhìn</h3>
              <p className="text-gray-600">
                Trở thành nền tảng đồng sở hữu xe điện hàng đầu Việt Nam, kết nối hàng triệu 
                người cùng chung tay bảo vệ môi trường.
              </p>
            </div>

            {/* Values */}
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <Heart className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Giá trị cốt lõi</h3>
              <p className="text-gray-600">
                Minh bạch, trách nhiệm, cộng đồng và bền vững - những giá trị định hướng 
                mọi hoạt động của chúng tôi.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Đội ngũ của chúng tôi</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Những con người đam mê công nghệ xanh và cam kết tạo ra sự thay đổi tích cực
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center">
              <div className="w-32 h-32 bg-emerald-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-4xl">👤</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Thành viên {i}</h3>
              <p className="text-emerald-600 font-medium mb-2">Vị trí</p>
              <p className="text-gray-600 text-sm">
                Mô tả ngắn về thành viên và vai trò của họ trong đội ngũ
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
