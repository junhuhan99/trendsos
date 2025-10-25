import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Users, CheckCircle, XCircle } from 'lucide-react';
import api from '../utils/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('articles'); // 'articles' or 'authors'
  const [articles, setArticles] = useState([]);
  const [pendingAuthors, setPendingAuthors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    // 관리자 권한 확인
    if (user.role !== 'admin') {
      alert('관리자만 접근할 수 있습니다.');
      navigate('/');
      return;
    }

    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    if (activeTab === 'articles') {
      await fetchArticles();
    } else {
      await fetchPendingAuthors();
    }
    setLoading(false);
  };

  const fetchArticles = async () => {
    try {
      const response = await api.get('/articles');
      setArticles(response.data.articles || []);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    }
  };

  const fetchPendingAuthors = async () => {
    try {
      const response = await api.get('/authors/admin/pending');
      setPendingAuthors(response.data.authors || []);
    } catch (error) {
      console.error('Failed to fetch pending authors:', error);
    }
  };

  const handleDeleteArticle = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    try {
      await api.delete(`/articles/${id}`);
      fetchArticles();
    } catch (error) {
      console.error('Failed to delete article:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const handleEditArticle = (article) => {
    setEditingArticle(article);
    setShowModal(true);
  };

  const handleCreateArticle = () => {
    setEditingArticle(null);
    setShowModal(true);
  };

  const handleApproveAuthor = async (userId, status) => {
    const message = status === 'approved' ? '작가를 승인하시겠습니까?' : '작가 신청을 거부하시겠습니까?';
    if (!confirm(message)) {
      return;
    }

    try {
      await api.post('/authors/admin/approve', { userId, status });
      alert(status === 'approved' ? '작가가 승인되었습니다.' : '작가 신청이 거부되었습니다.');
      fetchPendingAuthors();
    } catch (error) {
      console.error('Failed to approve author:', error);
      alert('처리에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold">관리자 대시보드</h1>
          {activeTab === 'articles' && (
            <button
              onClick={handleCreateArticle}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              새 글 작성
            </button>
          )}
        </div>

        {/* 탭 */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('articles')}
              className={`pb-3 px-1 border-b-2 transition-colors ${
                activeTab === 'articles'
                  ? 'border-primary-600 text-primary-600 font-semibold'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              게시글 관리
            </button>
            <button
              onClick={() => setActiveTab('authors')}
              className={`pb-3 px-1 border-b-2 transition-colors relative ${
                activeTab === 'authors'
                  ? 'border-primary-600 text-primary-600 font-semibold'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              작가 승인
              {pendingAuthors.length > 0 && (
                <span className="absolute -top-1 -right-6 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {pendingAuthors.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 콘텐츠 */}
        {activeTab === 'articles' ? (
          <ArticlesTab
            articles={articles}
            onEdit={handleEditArticle}
            onDelete={handleDeleteArticle}
          />
        ) : (
          <AuthorsTab
            authors={pendingAuthors}
            onApprove={handleApproveAuthor}
          />
        )}
      </div>

      {/* 모달 */}
      {showModal && (
        <ArticleModal
          article={editingArticle}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchArticles();
          }}
        />
      )}
    </div>
  );
};

// 게시글 관리 탭
const ArticlesTab = ({ articles, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              제목
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              카테고리
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              작성일
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              조회수
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              관리
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {articles.map((article) => (
            <tr key={article._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{article.title}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                  {article.category}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(article.createdAt).toLocaleDateString('ko-KR')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {article.views || 0}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEdit(article)}
                  className="text-primary-600 hover:text-primary-900 mr-4"
                >
                  <Edit className="w-4 h-4 inline" />
                </button>
                <button
                  onClick={() => onDelete(article._id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="w-4 h-4 inline" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {articles.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          아직 작성된 게시글이 없습니다.
        </div>
      )}
    </div>
  );
};

// 작가 승인 탭
const AuthorsTab = ({ authors, onApprove }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {authors.length === 0 ? (
        <div className="col-span-2 text-center py-12 bg-white rounded-2xl">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">승인 대기 중인 작가가 없습니다.</p>
        </div>
      ) : (
        authors.map((author) => (
          <div key={author._id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl flex-shrink-0">
                {author.name[0]}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{author.name}</h3>
                <p className="text-sm text-gray-500">{author.email}</p>
                <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                  승인 대기 중
                </span>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-1">전문 분야</h4>
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {author.authorCategory}
              </span>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-1">자기소개</h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{author.authorBio}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onApprove(author._id, 'approved')}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                승인
              </button>
              <button
                onClick={() => onApprove(author._id, 'rejected')}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <XCircle className="w-4 h-4" />
                거부
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

// 게시글 모달 (기존 코드 유지)
const ArticleModal = ({ article, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: article?.title || '',
    content: article?.content || '',
    summary: article?.summary || '',
    category: article?.category || '개발',
    thumbnail: article?.thumbnail || '',
    featured: article?.featured || false,
  });
  const [loading, setLoading] = useState(false);

  const categories = ['개발', 'AI', 'IT서비스', '기획', '디자인', '비즈니스', '프로덕트', '커리어', '트렌드', '스타트업'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (article) {
        await api.put(`/articles/${article._id}`, formData);
      } else {
        await api.post('/articles', formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save article:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold">
            {article ? '게시글 수정' : '새 게시글 작성'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">요약</label>
            <textarea
              required
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">본문</label>
            <textarea
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows="10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">썸네일 URL</label>
            <input
              type="url"
              value={formData.thumbnail}
              onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
              오늘의 토픽으로 등록
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;
