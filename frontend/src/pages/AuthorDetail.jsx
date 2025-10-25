import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, Heart, Users, UserPlus, UserMinus, Twitter, Github, Linkedin, Globe } from 'lucide-react';
import api from '../utils/api';

const AuthorDetail = () => {
  const { id } = useParams();
  const [author, setAuthor] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchAuthorData();
  }, [id]);

  const fetchAuthorData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/authors/${id}`);
      setAuthor(response.data.author);
      setArticles(response.data.articles || []);

      // 현재 사용자가 이 작가를 팔로우하는지 확인
      if (currentUser._id && response.data.author.followers) {
        setIsFollowing(response.data.author.followers.includes(currentUser._id));
      }
    } catch (error) {
      console.error('Failed to fetch author:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!localStorage.getItem('token')) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const response = await api.post(`/authors/${id}/follow`);
      setIsFollowing(response.data.isFollowing);
      setAuthor({
        ...author,
        followerCount: response.data.followerCount,
      });
    } catch (error) {
      console.error('Failed to toggle follow:', error);
      alert(error.response?.data?.message || '팔로우 처리에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">작가를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* 프로필 헤더 */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* 프로필 이미지 */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-primary-600 rounded-full flex items-center justify-center text-white text-5xl">
                {author.name[0]}
              </div>
            </div>

            {/* 정보 */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{author.name}</h1>
                  <span className="inline-block px-3 py-1 bg-primary-100 text-primary-600 rounded-full text-sm font-medium">
                    {author.authorCategory}
                  </span>
                </div>

                {/* 팔로우 버튼 */}
                {currentUser._id !== author._id && (
                  <button
                    onClick={handleFollow}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                      isFollowing
                        ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                        : 'bg-primary-600 hover:bg-primary-700 text-white'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserMinus className="w-5 h-5" />
                        팔로잉
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        팔로우
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* 통계 */}
              <div className="flex items-center gap-6 mb-4 text-sm">
                <span className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-gray-400" />
                  <strong>{author.articleCount || 0}</strong>개 글
                </span>
                <span className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-gray-400" />
                  <strong>{author.followerCount || 0}</strong>명 팔로워
                </span>
                <span className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-400" />
                  <strong>{author.followingCount || 0}</strong>명 팔로잉
                </span>
              </div>

              {/* 자기소개 */}
              <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                {author.authorBio || author.bio}
              </p>

              {/* 소셜 링크 */}
              {author.socialLinks && (
                <div className="flex gap-3">
                  {author.socialLinks.twitter && (
                    <a
                      href={author.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Twitter className="w-5 h-5 text-gray-600" />
                    </a>
                  )}
                  {author.socialLinks.github && (
                    <a
                      href={author.socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Github className="w-5 h-5 text-gray-600" />
                    </a>
                  )}
                  {author.socialLinks.linkedin && (
                    <a
                      href={author.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Linkedin className="w-5 h-5 text-gray-600" />
                    </a>
                  )}
                  {author.socialLinks.website && (
                    <a
                      href={author.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Globe className="w-5 h-5 text-gray-600" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 작성한 글 */}
        <div>
          <h2 className="text-2xl font-bold mb-6">작성한 글</h2>

          {articles.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <p className="text-gray-500">아직 작성한 글이 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ArticleCard = ({ article }) => {
  return (
    <Link to={`/article/${article._id}`} className="card group">
      {/* 썸네일 */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {article.thumbnail ? (
          <img
            src={article.thumbnail}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500 to-purple-600">
            <span className="text-white text-6xl">⚡</span>
          </div>
        )}
      </div>

      {/* 콘텐츠 */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
          <span>{article.category}</span>
          <span>·</span>
          <span>{new Date(article.createdAt).toLocaleDateString('ko-KR')}</span>
        </div>

        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {article.title}
        </h3>

        <p className="text-sm text-gray-600 line-clamp-2">{article.summary}</p>
      </div>
    </Link>
  );
};

export default AuthorDetail;
