import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X } from 'lucide-react';
import api from '../utils/api';

const WriteArticle = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    category: '개발',
    thumbnail: '',
    featured: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = ['개발', 'AI', 'IT서비스', '기획', '디자인', '비즈니스', '프로덕트', '커리어', '트렌드', '스타트업'];

  // 작가 또는 관리자가 아니면 접근 불가
  if (!user.isAuthor && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">작가 권한이 필요합니다</h2>
          <p className="text-gray-600 mb-6">글을 작성하려면 작가 신청을 해주세요.</p>
          <button
            onClick={() => navigate('/author/apply')}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            작가 신청하기
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.content.trim() || !formData.summary.trim()) {
      setError('제목, 요약, 본문은 필수 항목입니다.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/articles', formData);
      alert('게시글이 작성되었습니다!');
      navigate(`/article/${response.data.article._id}`);
    } catch (err) {
      setError(err.response?.data?.message || '게시글 작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">새 글 작성</h1>
            <p className="text-gray-600">IT 트렌드와 지식을 공유해보세요</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 제목 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                placeholder="매력적인 제목을 입력하세요"
              />
            </div>

            {/* 요약 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                요약 <span className="text-red-500">*</span>
              </label>
              <textarea
                name="summary"
                required
                value={formData.summary}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                rows="3"
                placeholder="글의 핵심 내용을 간단히 요약해주세요 (최대 200자)"
                maxLength="200"
              />
              <p className="text-sm text-gray-500 mt-1">{formData.summary.length}/200</p>
            </div>

            {/* 카테고리 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리 <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* 썸네일 URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                썸네일 이미지 URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  name="thumbnail"
                  value={formData.thumbnail}
                  onChange={handleChange}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              {formData.thumbnail && (
                <div className="mt-3 relative">
                  <img
                    src={formData.thumbnail}
                    alt="썸네일 미리보기"
                    className="w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, thumbnail: '' })}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* 본문 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                본문 <span className="text-red-500">*</span>
              </label>
              <textarea
                name="content"
                required
                value={formData.content}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-mono"
                rows="20"
                placeholder="본문 내용을 입력하세요. 마크다운을 지원합니다."
              />
            </div>

            {/* 오늘의 토픽 (관리자만) */}
            {user.role === 'admin' && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                  오늘의 토픽으로 등록
                </label>
              </div>
            )}

            {/* 버튼 */}
            <div className="flex gap-3 pt-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '작성 중...' : '게시하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WriteArticle;
