'use client';

import { User, Mail, MapPin, Calendar, CreditCard, Shield, AlertCircle, Loader2, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getCurrentUser, updateUserProfile } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  cccd: string;
  driverLicense: string;
  birthday: string;
  role: string;
  verificationStatus: string;
  createdAt: string;
  location: string;
  cccdFrontUrl: string;
  cccdBackUrl: string;
  driverLicenseUrl: string;
}

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    location: '',
    birthday: '',
    driverLicense: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await getCurrentUser();
      if (response.success) {
        setProfile(response.data);
        setFormData({
          fullName: response.data.fullName,
          location: response.data.location,
          birthday: response.data.birthday,
          driverLicense: response.data.driverLicense,
        });
      } else {
        setError('Không thể tải thông tin người dùng');
      }
    } catch {
      setError('Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const response = await updateUserProfile(formData);
      if (response.success) {
        setProfile(response.data);
        setSuccess('Cập nhật thông tin thành công!');
        setIsEditing(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || 'Cập nhật thất bại');
      }
    } catch (err) {
      setError('Đã có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <AlertCircle className="w-8 h-8 text-red-600 mb-2" />
          <p className="text-red-800">{error || 'Không tìm thấy thông tin người dùng'}</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            {/* Avatar & Basic Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                  <span className="text-4xl font-bold text-white">
                    {getInitials(profile.fullName)}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{profile.fullName}</h2>
                <p className="text-gray-600 mb-3">{profile.email}</p>
                
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    profile.verificationStatus === 'verified'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {profile.verificationStatus === 'verified' ? 'Đã xác minh' : 'Chờ xác minh'}
                  </span>
                  {profile.role === 'admin' && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      <Shield className="w-3 h-3 inline mr-1" />
                      Admin
                    </span>
                  )}
                </div>

                <div className="w-full mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Tham gia {new Date(profile.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Thống kê</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                  <span className="text-sm text-gray-700">Nhóm tham gia</span>
                  <span className="text-lg font-bold text-emerald-600">0</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-gray-700">Chuyến đi</span>
                  <span className="text-lg font-bold text-blue-600">0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details & Edit */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                  >
                    Chỉnh sửa
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Họ và tên <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="fullName"
                          required
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="Nguyễn Văn A"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày sinh <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="date"
                          name="birthday"
                          required
                          value={formData.birthday}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Địa chỉ <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="location"
                          required
                          value={formData.location}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="Hà Nội"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số GPLX <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="driverLicense"
                          required
                          value={formData.driverLicense}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="012345678"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          fullName: profile.fullName,
                          location: profile.location,
                          birthday: profile.birthday,
                          driverLicense: profile.driverLicense,
                        });
                      }}
                      disabled={saving}
                      className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                      {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{profile.email}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Số CCCD</label>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <CreditCard className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{profile.cccd}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Ngày sinh</label>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{new Date(profile.birthday).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Số GPLX</label>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <CreditCard className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{profile.driverLicense}</span>
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-500">Địa chỉ</label>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{profile.location}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Documents */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Giấy tờ đã tải lên</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-lg p-4 hover:border-emerald-300 transition-colors">
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">CCCD mặt trước</p>
                  <p className="text-xs text-gray-500 truncate">{profile.cccdFrontUrl}</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 hover:border-emerald-300 transition-colors">
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">CCCD mặt sau</p>
                  <p className="text-xs text-gray-500 truncate">{profile.cccdBackUrl}</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 hover:border-emerald-300 transition-colors">
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Giấy phép lái xe</p>
                  <p className="text-xs text-gray-500 truncate">{profile.driverLicenseUrl}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
