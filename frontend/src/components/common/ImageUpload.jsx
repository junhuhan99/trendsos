import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import api from '../../utils/api';

const ImageUpload = ({ value, onChange, label = '이미지 업로드' }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || '');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    // 이미지 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    try {
      setUploading(true);

      // FormData 생성
      const formData = new FormData();
      formData.append('image', file);

      // 업로드 API 호출
      const response = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const imageUrl = response.data.url;
      setPreview(imageUrl);
      onChange(imageUrl);
    } catch (error) {
      console.error('Image upload error:', error);
      alert(error.response?.data?.message || '이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview('');
    onChange('');
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {preview ? (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Preview"
            className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-300"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="image-upload"
            disabled={uploading}
          />
          <label
            htmlFor="image-upload"
            className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Upload className="w-12 h-12 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">
              {uploading ? '업로드 중...' : '클릭하여 이미지 선택'}
            </span>
            <span className="text-xs text-gray-400 mt-1">
              JPEG, PNG, GIF, WEBP (최대 5MB)
            </span>
          </label>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
