import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, Heart } from 'lucide-react';
import api from '../utils/api';

const AuthorList = () => {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');

  const categories = ['전체', '개발', 'AI', 'IT서비스', '기획', '디자인', '비즈니스', '프로덕트', '커리어', '트렌드', '스타트업'];

  useEffect(() => {
    fetchAuthors();
  }, [category]);

  const fetchAuthors = async () => {
    try {
      setLoading(true);
      const params = {};
      if (category && category !== '전체') {
        params.category = category;
      }

      const response = await api.get('/authors', { params });
      setAuthors(response.data.authors || []);
    } catch (error) {
      console.error('Failed to fetch authors:', error);
    } finally {
      setLoading(false);
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
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">요즘 뜨는 작가</h1>
          <p className="text-gray-600">IT 트렌드를 선도하는 작가들을 만나보세요</p>
        </div>

        {/* 카테고리 필터 */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat === '전체' ? '' : cat)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                (cat === '전체' && !category) || category === cat
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 작가 목록 */}
        {authors.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">등록된 작가가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {authors.map((author) => (
              <AuthorCard key={author._id} author={author} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const AuthorCard = ({ author }) => {
  return (
    <Link
      to={`/author/${author._id}`}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
    >
      {/* 프로필 */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl flex-shrink-0">
          {author.name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg mb-1 truncate">{author.name}</h3>
          <span className="inline-block px-2 py-1 bg-primary-100 text-primary-600 rounded text-xs font-medium">
            {author.authorCategory}
          </span>
        </div>
      </div>

      {/* 자기소개 */}
      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
        {author.authorBio || author.bio}
      </p>

      {/* 통계 */}
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <BookOpen className="w-4 h-4" />
          {author.articleCount || 0}개 글
        </span>
        <span className="flex items-center gap-1">
          <Heart className="w-4 h-4" />
          {author.followerCount || 0}명 팔로워
        </span>
      </div>
    </Link>
  );
};

export default AuthorList;
