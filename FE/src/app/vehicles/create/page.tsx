'use client';

import { useState } from 'react';
import { createVehicle, uploadVehicleImages } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function CreateVehiclePage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    licensePlate: '',
    location: '',
    status: 'available',
    registrationInfo: '',
    batteryCapacity: 0,
    yearOfManufacture: new Date().getFullYear(),
  });

  const [imageFiles, setImageFiles] = useState<{
    image1?: File;
    image2?: File;
    image3?: File;
  }>({});

  const [imagePreviews, setImagePreviews] = useState<{
    preview1?: string;
    preview2?: string;
    preview3?: string;
  }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'batteryCapacity' || name === 'yearOfManufacture'
        ? Number(value)
        : value,
    }));
  };

  const handleImageChange = (imageNumber: 1 | 2 | 3) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file hình ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    // Update file state
    setImageFiles(prev => ({
      ...prev,
      [`image${imageNumber}`]: file,
    }));

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviews(prev => ({
        ...prev,
        [`preview${imageNumber}`]: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (imageNumber: 1 | 2 | 3) => {
    setImageFiles(prev => ({
      ...prev,
      [`image${imageNumber}`]: undefined,
    }));
    setImagePreviews(prev => ({
      ...prev,
      [`preview${imageNumber}`]: undefined,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Vui lòng đăng nhập để thêm xe');
      return;
    }
    
    setError('');
    setSuccess('');
    
    // Validation
    if (!formData.brand || !formData.model || !formData.licensePlate) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    
    if (formData.batteryCapacity <= 0) {
      setError('Dung lượng pin phải lớn hơn 0');
      return;
    }
    
    if (formData.yearOfManufacture < 2000 || formData.yearOfManufacture > new Date().getFullYear() + 1) {
      setError('Năm sản xuất không hợp lệ');
      return;
    }

    // Validate: At least image1 is required
    if (!imageFiles.image1) {
      setError('Vui lòng chọn ít nhất 1 hình ảnh cho xe');
      return;
    }

    setSubmitting(true);
    try {
      // Step 1: Upload images first
      const uploadResponse = await uploadVehicleImages({
        image1: imageFiles.image1,
        image2: imageFiles.image2,
        image3: imageFiles.image3,
      });

      if (!uploadResponse.success || !uploadResponse.data) {
        setError(uploadResponse.message || 'Không thể upload ảnh');
        setSubmitting(false);
        return;
      }

      // Map response data to imageUrls
      const responseData = uploadResponse.data;
      const keys = Object.keys(responseData);
      const imageUrls = {
        imageUrl1: responseData[keys[0]] || '',
        imageUrl2: responseData[keys[1]] || '',
        imageUrl3: responseData[keys[2]] || '',
      };

      // Step 2: Create vehicle with uploaded image URLs
      const response = await createVehicle({
        ...formData,
        ...imageUrls,
        ownerId: user.userId,
      });
      
      if (response.success) {
        setSuccess('Thêm xe thành công! Đang chờ admin phê duyệt...');
        setTimeout(() => {
          router.push('/vehicles');
        }, 2000);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Không thể thêm xe');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 max-w-md text-center">
          <p className="text-yellow-800 font-medium mb-4">Vui lòng đăng nhập để thêm xe</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/vehicles')}
            className="mb-4 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
          >
            ← Quay lại
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Thêm xe mới</h1>
          <p className="text-gray-600">Đăng ký xe điện của bạn vào hệ thống</p>
        </div>

        {/* Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">✓ {success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">✗ {error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
          {/* Brand */}
          <div>
            <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
              Hãng xe <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="brand"
              name="brand"
              required
              value={formData.brand}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="VD: VinFast, Tesla, BYD..."
            />
          </div>

          {/* Model */}
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
              Model <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="model"
              name="model"
              required
              value={formData.model}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="VD: VF8, Model 3, Seal..."
            />
          </div>

          {/* License Plate */}
          <div>
            <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700 mb-2">
              Biển số xe <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="licensePlate"
              name="licensePlate"
              required
              value={formData.licensePlate}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="VD: 30A-12345"
            />
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Vị trí <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="location"
              name="location"
              required
              value={formData.location}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="VD: Hà Nội, TP. HCM..."
            />
          </div>

          {/* Battery Capacity */}
          <div>
            <label htmlFor="batteryCapacity" className="block text-sm font-medium text-gray-700 mb-2">
              Dung lượng pin (kWh) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="batteryCapacity"
              name="batteryCapacity"
              required
              min={1}
              step={0.1}
              value={formData.batteryCapacity}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="VD: 87.7"
            />
          </div>

          {/* Year of Manufacture */}
          <div>
            <label htmlFor="yearOfManufacture" className="block text-sm font-medium text-gray-700 mb-2">
              Năm sản xuất <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="yearOfManufacture"
              name="yearOfManufacture"
              required
              min={2000}
              max={new Date().getFullYear() + 1}
              value={formData.yearOfManufacture}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              name="status"
              required
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="available">Sẵn sàng</option>
              <option value="in-use">Đang sử dụng</option>
              <option value="maintenance">Bảo trì</option>
            </select>
          </div>

          {/* Registration Info */}
          <div>
            <label htmlFor="registrationInfo" className="block text-sm font-medium text-gray-700 mb-2">
              Thông tin đăng ký <span className="text-red-500">*</span>
            </label>
            <textarea
              id="registrationInfo"
              name="registrationInfo"
              required
              rows={3}
              value={formData.registrationInfo}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Nhập thông tin đăng ký xe..."
            />
          </div>

          {/* Images Upload */}
          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-700 mb-4">Hình ảnh xe</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Image 1 */}
              <div>
                <label className="block text-xs text-gray-600 mb-2">
                  Hình ảnh 1 <span className="text-red-500">*</span>
                </label>
                {imagePreviews.preview1 ? (
                  <div className="relative">
                    <img
                      src={imagePreviews.preview1}
                      alt="Preview 1"
                      className="w-full h-40 object-cover rounded-lg border-2 border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(1)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      id="image1"
                      accept="image/*"
                      onChange={handleImageChange(1)}
                      className="hidden"
                    />
                    <label htmlFor="image1" className="cursor-pointer">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-600">Click để chọn ảnh</p>
                      <p className="text-xs text-gray-500">PNG, JPG (max 5MB)</p>
                    </label>
                  </div>
                )}
              </div>

              {/* Image 2 */}
              <div>
                <label className="block text-xs text-gray-600 mb-2">
                  Hình ảnh 2
                </label>
                {imagePreviews.preview2 ? (
                  <div className="relative">
                    <img
                      src={imagePreviews.preview2}
                      alt="Preview 2"
                      className="w-full h-40 object-cover rounded-lg border-2 border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(2)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      id="image2"
                      accept="image/*"
                      onChange={handleImageChange(2)}
                      className="hidden"
                    />
                    <label htmlFor="image2" className="cursor-pointer">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-600">Click để chọn ảnh</p>
                      <p className="text-xs text-gray-500">PNG, JPG (max 5MB)</p>
                    </label>
                  </div>
                )}
              </div>

              {/* Image 3 */}
              <div>
                <label className="block text-xs text-gray-600 mb-2">
                  Hình ảnh 3
                </label>
                {imagePreviews.preview3 ? (
                  <div className="relative">
                    <img
                      src={imagePreviews.preview3}
                      alt="Preview 3"
                      className="w-full h-40 object-cover rounded-lg border-2 border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(3)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      id="image3"
                      accept="image/*"
                      onChange={handleImageChange(3)}
                      className="hidden"
                    />
                    <label htmlFor="image3" className="cursor-pointer">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-600">Click để chọn ảnh</p>
                      <p className="text-xs text-gray-500">PNG, JPG (max 5MB)</p>
                    </label>
                  </div>
                )}
              </div>
            </div>
            
            <p className="text-sm text-gray-500 mt-2">
              * Ảnh đầu tiên là bắt buộc. Bạn có thể thêm tối đa 3 hình ảnh.
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.push('/vehicles')}
              disabled={submitting}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
            >
              {submitting ? 'Đang thêm...' : 'Thêm xe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
