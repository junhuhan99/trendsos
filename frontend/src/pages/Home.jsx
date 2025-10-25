import { useState, useEffect } from 'react';
import api from '../utils/api';
import HeroSlider from '../components/home/HeroSlider';
import PopularArticles from '../components/home/PopularArticles';
import ArticleGrid from '../components/home/ArticleGrid';

const Home = () => {
  const [heroArticles, setHeroArticles] = useState([]);
  const [popularArticles, setPopularArticles] = useState([]);
  const [recentArticles, setRecentArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);

      const [heroRes, popularRes, recentRes] = await Promise.all([
        api.get('/articles?featured=true&limit=5'),
        api.get('/articles?sort=popular&limit=5'),
        api.get('/articles?sort=recent&limit=8'),
      ]);

      setHeroArticles(heroRes.data.articles || []);
      setPopularArticles(popularRes.data.articles || []);
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        {/* 히어로 슬라이더 */}
        <div className="mb-12">
          <HeroSlider articles={heroArticles} />
        </div>

        {/* 인기 콘텐츠 */}
        <PopularArticles articles={popularArticles} />

        {/* 회원가입 유도 배너 */}
        {!localStorage.getItem('token') && (
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-8 mb-12 text-center">
            <h3 className="text-2xl font-bold mb-2">지금 회원가입하고</h3>
            <p className="text-lg text-gray-700 mb-4">실무 꿀팁을 스크랩해 보세요.</p>
            <a
              href="/register"
              className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              회원가입
            </a>
          </div>
        )}

        {/* 많이 스크랩된 콘텐츠 */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">많이 스크랩된 콘텐츠</h2>
          <div className="grid grid-cols-1 gap-6">
            {popularArticles.slice(0, 6).map((article, index) => (
              <ArticleListItem key={article._id || index} article={article} rank={index + 1} />
            ))}
          </div>
        </section>

        {/* 독자들의 성장을 이끈 문장 */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">독자들의 성장을 이끈 문장</h2>
            <div className="flex gap-2">
              <button className="p-2 rounded-lg hover:bg-gray-200">←</button>
              <button className="p-2 rounded-lg hover:bg-gray-200">→</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentArticles.slice(0, 3).map((article) => (
              <QuoteCard key={article._id} article={article} />
            ))}
          </div>
        </section>

        {/* 최신 콘텐츠 그리드 */}
        <ArticleGrid articles={recentArticles} title="요즘 뜨는 인기 컬렉션" />
      </div>
    </div>
  );
};

const ArticleListItem = ({ article, rank }) => (
  <a href={`/article/${article._id}`} className="flex gap-4 p-4 bg-white rounded-xl hover:shadow-md transition-shadow">
    <div className="flex-shrink-0 w-16 text-center">
      <span className="text-3xl font-bold text-gray-300">{rank}</span>
      {article.isNew && <span className="badge badge-new block mt-1">NEW</span>}
    </div>
    <div className="flex-1">
      <h3 className="font-semibold text-lg mb-1">{article.title}</h3>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>{article.category}</span>
        <span>·</span>
        <span>{article.readTime || '5'}분</span>
      </div>
    </div>
    {article.thumbnail && (
      <img src={article.thumbnail} alt="" className="w-24 h-24 rounded-lg object-cover" />
    )}
  </a>
);

const QuoteCard = ({ article }) => (
  <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl p-6 text-white h-64 flex flex-col justify-between">
    <div>
      <p className="text-sm mb-4 line-clamp-3">{article.summary || article.title}</p>
    </div>
    <div className="text-sm opacity-90">
      <p>누구도 알려주지 않는 백엔드 로드맵</p>
    </div>
  </div>
);

export default Home;
