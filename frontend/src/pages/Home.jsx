import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import AdBanner from '../components/ads/AdBanner';
import PopularAuthors from '../components/sidebar/PopularAuthors';
import TrendingTags from '../components/sidebar/TrendingTags';
import RecommendedPosts from '../components/sidebar/RecommendedPosts';

const Home = () => {
  const [heroArticles, setHeroArticles] = useState([]);
  const [recentArticles, setRecentArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const [heroRes, recentRes] = await Promise.all([
        api.get('/articles?featured=true&limit=3'),
        api.get('/articles?sort=recent&limit=12'),
      ]);

      setHeroArticles(heroRes.data.articles || []);
      setRecentArticles(recentRes.data.articles || []);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
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
    <div className="min-h-screen bg-gray-50">
      {/* 상단 배너 광고 */}
      <div className="bg-white border-b">
        <div className="container-custom py-3">
          <AdBanner position="top-banner" className="rounded-lg overflow-hidden max-h-24" />
        </div>
      </div>

      <div className="container-custom py-6">
        {/* 3단 레이아웃 */}
        <div className="grid grid-cols-12 gap-6">
          {/* 좌측 사이드바 */}
          <aside className="col-span-12 lg:col-span-3 space-y-6">
            <PopularAuthors />
            <TrendingTags />
            <AdBanner position="sidebar-left" className="rounded-xl overflow-hidden" />
          </aside>

          {/* 메인 콘텐츠 */}
          <main className="col-span-12 lg:col-span-6 space-y-8">
            {/* 오늘의 토픽 (축소된 배너) */}
            {heroArticles.length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-4">🔥 오늘의 토픽</h2>
                <div className="grid grid-cols-1 gap-4">
                  {heroArticles.map((article) => (
                    <Link
                      key={article._id}
                      to={`/article/${article._id}`}
                      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
                    >
                      <div className="flex">
                        {article.thumbnail && (
                          <div className="w-32 h-32 flex-shrink-0">
                            <img
                              src={article.thumbnail}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="flex-1 p-4">
                          <span className="inline-block px-2 py-1 bg-primary-100 text-primary-600 text-xs font-medium rounded mb-2">
                            {article.category}
                          </span>
                          <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                            {article.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{article.summary}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* 콘텐츠 상단 광고 */}
            <AdBanner position="content-top" className="rounded-xl overflow-hidden" />

            {/* 최신 콘텐츠 */}
            <section>
              <h2 className="text-xl font-bold mb-4">📌 최신 콘텐츠</h2>
              <div className="grid grid-cols-1 gap-4">
                {recentArticles.slice(0, 6).map((article) => (
                  <ArticleCard key={article._id} article={article} />
                ))}
              </div>
            </section>

            {/* 콘텐츠 중간 광고 */}
            <AdBanner position="content-middle" className="rounded-xl overflow-hidden" />

            {/* 더 많은 콘텐츠 */}
            <section>
              <h2 className="text-xl font-bold mb-4">✨ 놓치면 후회할 콘텐츠</h2>
              <div className="grid grid-cols-1 gap-4">
                {recentArticles.slice(6, 12).map((article) => (
                  <ArticleCard key={article._id} article={article} />
                ))}
              </div>
            </section>

            {/* 콘텐츠 하단 광고 */}
            <AdBanner position="content-bottom" className="rounded-xl overflow-hidden" />
          </main>

          {/* 우측 사이드바 */}
          <aside className="col-span-12 lg:col-span-3 space-y-6">
            <RecommendedPosts />

            {/* 회원가입 유도 */}
            {!localStorage.getItem('token') && (
              <div className="bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl p-6 text-white">
                <h3 className="font-bold text-lg mb-2">트렌드OS 시작하기</h3>
                <p className="text-sm opacity-90 mb-4">실무 꿀팁을 스크랩하고 작가를 팔로우하세요</p>
                <Link
                  to="/register"
                  className="block w-full bg-white hover:bg-gray-100 text-primary-600 font-medium py-2 px-4 rounded-lg text-center transition-colors"
                >
                  무료 회원가입
                </Link>
              </div>
            )}

            <AdBanner position="sidebar-right" className="rounded-xl overflow-hidden" />

            {/* 카테고리 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-lg mb-4">카테고리</h3>
              <div className="space-y-2">
                {['개발', 'AI', 'IT서비스', '기획', '디자인', '비즈니스', '프로덕트', '커리어', '트렌드', '스타트업'].map((cat) => (
                  <Link
                    key={cat}
                    to={`/category/${cat}`}
                    className="block px-3 py-2 hover:bg-gray-100 rounded-lg text-sm transition-colors"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

const ArticleCard = ({ article }) => {
  return (
    <Link
      to={`/article/${article._id}`}
      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
    >
      <div className="flex gap-4 p-4">
        {article.thumbnail && (
          <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
            <img
              src={article.thumbnail}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-500">{article.category}</span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-400">
              {new Date(article.createdAt).toLocaleDateString('ko-KR')}
            </span>
          </div>
          <h3 className="font-semibold mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {article.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-1">{article.summary}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span>조회 {article.views || 0}</span>
            <span>좋아요 {article.likes || 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Home;
