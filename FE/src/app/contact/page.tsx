import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Liên hệ với chúng tôi</h1>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Có câu hỏi hoặc cần hỗ trợ? Hãy để lại thông tin, chúng tôi sẽ liên hệ lại sớm nhất
          </p>
        </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-md p-7">
            <h2 className="text-2xl font-bold text-gray-900 mb-5">Gửi tin nhắn</h2>
            <form className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Họ và tên
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  id="phone"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="0123456789"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nội dung
                </label>
                <textarea
                  id="message"
                  rows={5}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Nhập nội dung tin nhắn của bạn..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 text-white px-6 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Send className="w-5 h-5" />
                Gửi tin nhắn
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-5">
            <div className="bg-white rounded-lg shadow-md p-7">
              <h2 className="text-2xl font-bold text-gray-900 mb-5">Thông tin liên hệ</h2>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Địa chỉ</h3>
                    <p className="text-gray-600">
                      123 Đường Lê Lợi, Quận 1<br />
                      TP. Hồ Chí Minh, Việt Nam
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Điện thoại</h3>
                    <p className="text-gray-600">+84 123 456 789</p>
                    <p className="text-gray-600">+84 987 654 321</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <p className="text-gray-600">contact@evshare.vn</p>
                    <p className="text-gray-600">support@evshare.vn</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Working Hours */}
            <div className="bg-white rounded-lg shadow-md p-7">
              <h2 className="text-2xl font-bold text-gray-900 mb-5">Giờ làm việc</h2>
              <div className="space-y-2.5 text-gray-600">
                <div className="flex justify-between">
                  <span>Thứ Hai - Thứ Sáu:</span>
                  <span className="font-semibold">8:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Thứ Bảy:</span>
                  <span className="font-semibold">9:00 - 17:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Chủ Nhật:</span>
                  <span className="font-semibold">Nghỉ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
