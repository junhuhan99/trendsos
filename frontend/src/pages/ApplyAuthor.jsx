import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, CheckCircle, Clock } from 'lucide-react';
import api from '../utils/api';

const ApplyAuthor = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [formData, setFormData] = useState({
    authorBio: '',
    authorCategory: '개발',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  const categories = ['개발', 'AI', 'IT서비스', '기획', '디자인', '비즈니스', '프로덕트', '커리어', '트렌드', '스타트업'];

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await api.get('/auth/me');
      setCurrentUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    }
  };

  // 이미 작가인 경우
  if (currentUser?.isAuthor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">이미 작가로 등록되어 있습니다</h2>
          <p className="text-gray-600 mb-6">지금 바로 글을 작성해보세요!</p>
          <Link
            to="/write"
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            글쓰기
          </Link>
        </div>
      </div>
    );
  }

  // 신청 대기 중인 경우
  if (currentUser?.authorStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">작가 신청이 검토 중입니다</h2>
          <p className="text-gray-600 mb-2">관리자가 신청서를 검토하고 있습니다.</p>
          <p className="text-gray-600 mb-6">승인되면 이메일로 알려드리겠습니다.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.authorBio.trim()) {
      setError('자기소개를 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/authors/apply', formData);
      alert('작가 신청이 완료되었습니다! 관리자 승인을 기다려주세요.');
      navigate('/');
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || '작가 신청에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <BookOpen className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">작가 신청</h1>
            <p className="text-gray-600">
              트렌드OS 작가가 되어 IT 트렌드와 지식을 공유해보세요
            </p>
          </div>

          {/* 혜택 안내 */}
          <div className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-lg mb-3">작가 혜택</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">✓</span>
                <span>자유롭게 글을 작성하고 발행할 수 있습니다</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">✓</span>
                <span>독자들과 소통하며 팔로워를 만들 수 있습니다</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">✓</span>
                <span>작가 프로필 페이지가 제공됩니다</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">✓</span>
                <span>인기 작가로 선정되면 메인에 소개됩니다</span>
              </li>
            </ul>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* 신청 폼 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                전문 분야 <span className="text-red-500">*</span>
              </label>
              <select
                name="authorCategory"
                value={formData.authorCategory}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                자기소개 <span className="text-red-500">*</span>
              </label>
              <textarea
                name="authorBio"
                required
                value={formData.authorBio}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                rows="6"
                placeholder="자신을 소개하고, 어떤 주제로 글을 쓸 계획인지 알려주세요. (최소 50자)"
                minLength="50"
              />
              <p className="text-sm text-gray-500 mt-1">{formData.authorBio.length}자 (최소 50자)</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>신청 후 안내:</strong> 관리자가 신청서를 검토한 후 승인/거부를 결정합니다.
                승인되면 이메일로 알림을 받으실 수 있습니다.
              </p>
            </div>

            <div className="flex gap-3">
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
                {loading ? '신청 중...' : '작가 신청하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplyAuthor;
