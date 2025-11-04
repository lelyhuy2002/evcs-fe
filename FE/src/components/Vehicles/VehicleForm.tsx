'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateVehicleSchema, type VehicleFormData } from '@/types/vehicle';
import { createVehicleAction } from '@/actions/vehicleActions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { uploadVehicleImages } from '@/lib/api';

interface VehicleFormProps {
  ownerId: number;
}

export function VehicleForm({ ownerId }: VehicleFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VehicleFormData>({
    resolver: zodResolver(CreateVehicleSchema.omit({ ownerId: true })),
    defaultValues: {
      status: 'Available',
      batteryCapacity: 0,
      yearOfManufacture: new Date().getFullYear(),
    },
  });

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

  const onSubmit = async (data: VehicleFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate: At least image1 is required
      if (!imageFiles.image1) {
        setError('Vui lòng chọn ít nhất 1 hình ảnh cho xe');
        setIsSubmitting(false);
        return;
      }

      // Step 1: Upload images first
      const uploadResponse = await uploadVehicleImages({
        image1: imageFiles.image1,
        image2: imageFiles.image2,
        image3: imageFiles.image3,
      });

      if (!uploadResponse.success || !uploadResponse.data) {
        setError(uploadResponse.message || 'Không thể upload ảnh');
        setIsSubmitting(false);
        return;
      }

      // Map response data to imageUrls
      // Backend returns { additionalProp1, additionalProp2, additionalProp3 }
      // or might return with specific keys
      const responseData = uploadResponse.data;
      const keys = Object.keys(responseData);
      const imageUrls = {
        imageUrl1: responseData[keys[0]] || '',
        imageUrl2: responseData[keys[1]] || '',
        imageUrl3: responseData[keys[2]] || '',
      };

      // Step 2: Create vehicle with uploaded image URLs
      const result = await createVehicleAction({
        ...data,
        ...imageUrls,
        ownerId,
      });

      if (result.success) {
        reset();
        setImageFiles({});
        setImagePreviews({});
        router.push('/dashboard?tab=vehicles');
        router.refresh();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Brand */}
          <div>
            <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
              Hãng xe <span className="text-red-500">*</span>
            </label>
            <input
              {...register('brand')}
              type="text"
              id="brand"
              placeholder="VD: VinFast, Tesla"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            {errors.brand && (
              <p className="mt-1 text-sm text-red-600">{errors.brand.message}</p>
            )}
          </div>

          {/* Model */}
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
              Model <span className="text-red-500">*</span>
            </label>
            <input
              {...register('model')}
              type="text"
              id="model"
              placeholder="VD: VF e34, Model 3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            {errors.model && (
              <p className="mt-1 text-sm text-red-600">{errors.model.message}</p>
            )}
          </div>

          {/* License Plate */}
          <div>
            <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700 mb-1">
              Biển số xe <span className="text-red-500">*</span>
            </label>
            <input
              {...register('licensePlate')}
              type="text"
              id="licensePlate"
              placeholder="VD: 30A-12345"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 uppercase"
            />
            {errors.licensePlate && (
              <p className="mt-1 text-sm text-red-600">{errors.licensePlate.message}</p>
            )}
          </div>

          {/* Year of Manufacture */}
          <div>
            <label htmlFor="yearOfManufacture" className="block text-sm font-medium text-gray-700 mb-1">
              Năm sản xuất <span className="text-red-500">*</span>
            </label>
            <input
              {...register('yearOfManufacture', { valueAsNumber: true })}
              type="number"
              id="yearOfManufacture"
              min={2000}
              max={new Date().getFullYear() + 1}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            {errors.yearOfManufacture && (
              <p className="mt-1 text-sm text-red-600">{errors.yearOfManufacture.message}</p>
            )}
          </div>

          {/* Battery Capacity */}
          <div>
            <label htmlFor="batteryCapacity" className="block text-sm font-medium text-gray-700 mb-1">
              Dung lượng pin (kWh) <span className="text-red-500">*</span>
            </label>
            <input
              {...register('batteryCapacity', { valueAsNumber: true })}
              type="number"
              id="batteryCapacity"
              step="0.1"
              min={0}
              placeholder="VD: 42"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            {errors.batteryCapacity && (
              <p className="mt-1 text-sm text-red-600">{errors.batteryCapacity.message}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Vị trí <span className="text-red-500">*</span>
            </label>
            <input
              {...register('location')}
              type="text"
              id="location"
              placeholder="VD: Hà Nội, TP.HCM"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
            )}
          </div>
        </div>

        {/* Registration Info */}
        <div className="mt-4">
          <label htmlFor="registrationInfo" className="block text-sm font-medium text-gray-700 mb-1">
            Thông tin đăng ký <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('registrationInfo')}
            id="registrationInfo"
            rows={3}
            placeholder="Nhập thông tin đăng ký xe (số đăng ký, ngày cấp, v.v.)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          {errors.registrationInfo && (
            <p className="mt-1 text-sm text-red-600">{errors.registrationInfo.message}</p>
          )}
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Hình ảnh xe</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Image 1 */}
          <div>
            <label htmlFor="image1" className="block text-sm font-medium text-gray-700 mb-2">
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
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-500 transition-colors">
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
                  <p className="text-xs text-gray-500">PNG, JPG (tối đa 5MB)</p>
                </label>
              </div>
            )}
          </div>

          {/* Image 2 */}
          <div>
            <label htmlFor="image2" className="block text-sm font-medium text-gray-700 mb-2">
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
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-500 transition-colors">
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
                  <p className="text-xs text-gray-500">PNG, JPG (tối đa 5MB)</p>
                </label>
              </div>
            )}
          </div>

          {/* Image 3 */}
          <div>
            <label htmlFor="image3" className="block text-sm font-medium text-gray-700 mb-2">
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
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-500 transition-colors">
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
                  <p className="text-xs text-gray-500">PNG, JPG (tối đa 5MB)</p>
                </label>
              </div>
            )}
          </div>
        </div>

        <p className="mt-4 text-sm text-gray-500">
          * Ảnh đầu tiên là bắt buộc. Bạn có thể thêm tối đa 3 hình ảnh.
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Đang xử lý...
            </span>
          ) : (
            'Thêm xe mới'
          )}
        </button>
      </div>

      {/* Info Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <svg className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Lưu ý:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Xe sau khi thêm sẽ ở trạng thái <strong>"Chờ duyệt"</strong></li>
              <li>Admin sẽ kiểm tra và duyệt xe trong vòng 24-48 giờ</li>
              <li>Chỉ xe đã được duyệt mới có thể dùng để tạo nhóm đồng sở hữu</li>
            </ul>
          </div>
        </div>
      </div>
    </form>
  );
}
