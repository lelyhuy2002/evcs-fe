'use client';

import Link from 'next/link';
import { Mail, Lock, User, Calendar, CreditCard, MapPin, Upload, AlertCircle, CheckCircle, FileImage } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    cccd: '',
    driverLicense: '',
    birthday: '',
    location: '',
  });

  // File states
  const [cccdFront, setCccdFront] = useState<File | null>(null);
  const [cccdBack, setCccdBack] = useState<File | null>(null);
  const [driverLicenseImg, setDriverLicenseImg] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'cccdFront' | 'cccdBack' | 'driverLicense') => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('Kích thước file không được vượt quá 5MB');
        return;
      }
      
      // Validate file type
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        setError('Chỉ chấp nhận file ảnh định dạng JPG, JPEG, PNG');
        return;
      }

      if (type === 'cccdFront') setCccdFront(file);
      else if (type === 'cccdBack') setCccdBack(file);
      else setDriverLicenseImg(file);
      
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (!cccdFront || !cccdBack || !driverLicenseImg) {
      setError('Vui lòng upload đầy đủ các ảnh giấy tờ');
      return;
    }

    setLoading(true);

    try {
      const response = await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        cccd: formData.cccd,
        driverLicense: formData.driverLicense,
        birthday: formData.birthday,
        location: formData.location,
        cccdFront,
        cccdBack,
        driverLicenseImg,
      });

      if (response.success) {
        setSuccess(true);
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(response.message || 'Đăng ký thất bại');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 to-white flex items-start justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-7">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-8 h-8 text-white"
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
            <h2 className="text-2xl font-bold text-gray-900">Đăng ký</h2>
            <p className="text-gray-600 mt-2">Tạo tài khoản để tham gia EV Share</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">Đăng ký thành công! Đang chuyển đến trang đăng nhập...</p>
            </div>
          )}

          {/* Form */}
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="example@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="cccd" className="block text-sm font-medium text-gray-700 mb-1">
                  Số CCCD (12 số) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="cccd"
                    name="cccd"
                    required
                    pattern="\d{12}"
                    value={formData.cccd}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="001234567890"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="driverLicense" className="block text-sm font-medium text-gray-700 mb-1">
                  Số GPLX <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="driverLicense"
                    name="driverLicense"
                    required
                    value={formData.driverLicense}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="012345678"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="birthday" className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày sinh <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    id="birthday"
                    name="birthday"
                    required
                    value={formData.birthday}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="location"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Hà Nội"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    minLength={8}
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="••••••••"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-0.5">Phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* File Uploads */}
            <div className="border-t pt-3">
              <h3 className="text-base font-semibold text-gray-900 mb-2">Upload Giấy Tờ</h3>
              <div className="grid md:grid-cols-3 gap-3">
                {/* CCCD Front */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CCCD mặt trước <span className="text-red-500">*</span>
                  </label>
                  <label className="cursor-pointer block">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 hover:border-emerald-500 transition-colors">
                      <div className="flex flex-col items-center">
                        {cccdFront ? (
                          <FileImage className="w-7 h-7 text-emerald-600 mb-1" />
                        ) : (
                          <Upload className="w-7 h-7 text-gray-400 mb-1" />
                        )}
                        <p className="text-xs text-gray-600 text-center truncate w-full px-2">
                          {cccdFront ? cccdFront.name : 'Chọn ảnh'}
                        </p>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={(e) => handleFileChange(e, 'cccdFront')}
                      className="hidden"
                      disabled={loading}
                      required
                    />
                  </label>
                </div>

                {/* CCCD Back */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CCCD mặt sau <span className="text-red-500">*</span>
                  </label>
                  <label className="cursor-pointer block">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 hover:border-emerald-500 transition-colors">
                      <div className="flex flex-col items-center">
                        {cccdBack ? (
                          <FileImage className="w-7 h-7 text-emerald-600 mb-1" />
                        ) : (
                          <Upload className="w-7 h-7 text-gray-400 mb-1" />
                        )}
                        <p className="text-xs text-gray-600 text-center truncate w-full px-2">
                          {cccdBack ? cccdBack.name : 'Chọn ảnh'}
                        </p>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={(e) => handleFileChange(e, 'cccdBack')}
                      className="hidden"
                      disabled={loading}
                      required
                    />
                  </label>
                </div>

                {/* Driver License */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ảnh GPLX <span className="text-red-500">*</span>
                  </label>
                  <label className="cursor-pointer block">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 hover:border-emerald-500 transition-colors">
                      <div className="flex flex-col items-center">
                        {driverLicenseImg ? (
                          <FileImage className="w-7 h-7 text-emerald-600 mb-1" />
                        ) : (
                          <Upload className="w-7 h-7 text-gray-400 mb-1" />
                        )}
                        <p className="text-xs text-gray-600 text-center truncate w-full px-2">
                          {driverLicenseImg ? driverLicenseImg.name : 'Chọn ảnh'}
                        </p>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={(e) => handleFileChange(e, 'driverLicense')}
                      className="hidden"
                      disabled={loading}
                      required
                    />
                  </label>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1.5">Chỉ chấp nhận JPG, JPEG, PNG. Tối đa 5MB.</p>
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                required
                disabled={loading}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 mt-0.5"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                Tôi đồng ý với{' '}
                <Link href="/terms" className="text-emerald-600 hover:text-emerald-700">
                  Điều khoản sử dụng
                </Link>{' '}
                và{' '}
                <Link href="/privacy" className="text-emerald-600 hover:text-emerald-700">
                  Chính sách bảo mật
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white px-6 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? 'Đang xử lý...' : 'Đăng ký'}
            </button>
          </form>

          {/* Sign in link */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Đã có tài khoản?{' '}
              <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
