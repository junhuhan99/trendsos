import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RichTextEditor from '../components/common/RichTextEditor';
import ImageUpload from '../components/common/ImageUpload';
import api from '../utils/api';

const WriteArticle = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    category: '개발',
    thumbnail: '',
    featured: false,
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // 서버에서 최신 사용자 정보 가져오기
    const fetchUserInfo = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setCheckingAuth(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      } catch (error) {
        console.error('Failed to fetch user info:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setCheckingAuth(false);
      }
    };

    fetchUserInfo();
  }, []);

  const categories = ['개발', 'AI', 'IT서비스', '기획', '디자인', '비즈니스', '프로덕트', '커리어', '트렌드', '스타트업'];

  // 로딩 중
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // 로그인 안 됨
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">로그인이 필요합니다</h2>
          <p className="text-gray-600 mb-6">글을 작성하려면 로그인해주세요.</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            로그인하기
          </button>
        </div>
      </div>
    );
  }

  // 작가 또는 관리자가 아니면 접근 불가
  if (!user.isAuthor && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">작가 권한이 필요합니다</h2>
          <p className="text-gray-600 mb-6">글을 작성하려면 작가 신청을 해주세요.</p>
          <p className="text-sm text-gray-500 mb-6">현재 상태: {user.isAuthor ? '작가 승인됨' : '일반 회원'}</p>
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
      // metaKeywords를 배열로 변환
      const keywords = formData.metaKeywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k);

      const response = await api.post('/articles', {
        ...formData,
        metaKeywords: keywords,
      });

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
      <div className="max-w-5xl mx-auto px-4">
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
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="글의 핵심 내용을 2-3줄로 요약해주세요"
              />
            </div>

            {/* 본문 (Rich Text Editor) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                본문 <span className="text-red-500">*</span>
              </label>
              <RichTextEditor
                value={formData.content}
                onChange={(value) => setFormData({ ...formData, content: value })}
                placeholder="본문 내용을 작성하세요..."
              />
            </div>

            {/* 카테고리 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리
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

            {/* 썸네일 이미지 */}
            <ImageUpload
              label="썸네일 이미지"
              value={formData.thumbnail}
              onChange={(url) => setFormData({ ...formData, thumbnail: url })}
            />

            {/* SEO 설정 */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">SEO 최적화 (선택사항)</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    메타 제목
                  </label>
                  <input
                    type="text"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="비워두면 제목이 자동으로 사용됩니다"
                  />
                  <p className="text-xs text-gray-500 mt-1">검색 결과에 표시될 제목 (권장: 50-60자)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    메타 설명
                  </label>
                  <textarea
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="비워두면 요약이 자동으로 사용됩니다"
                  />
                  <p className="text-xs text-gray-500 mt-1">검색 결과에 표시될 설명 (권장: 120-160자)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    키워드
                  </label>
                  <input
                    type="text"
                    name="metaKeywords"
                    value={formData.metaKeywords}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="예: React, JavaScript, 프론트엔드 (쉼표로 구분)"
                  />
                  <p className="text-xs text-gray-500 mt-1">쉼표(,)로 구분하여 입력하세요</p>
                </div>
              </div>
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
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
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
