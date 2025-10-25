import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import SEO from '../components/common/SEO';
import HeroSlider from '../components/home/HeroSlider';
import WeeklyRanking from '../components/home/WeeklyRanking';

const Home = () => {
  const [recentArticles, setRecentArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/articles?sort=recent&limit=10');
      setRecentArticles(response.data.articles || []);
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
    <>
      <SEO />
      <div className="min-h-screen bg-gray-50">
        <div className="container-custom py-8">
          {/* 상단: 슬라이더 + 주간 인기 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <HeroSlider />
            </div>
            <div className="lg:col-span-1">
              <WeeklyRanking />
            </div>
          </div>

          {/* 최신 게시글 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentArticles.map((article) => (
              <ArticleCard key={article._id} article={article} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

const ArticleCard = ({ article }) => {
  return (
    <Link
      to={`/article/${article._id}`}
      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group flex flex-col"
    >
      {article.thumbnail && (
        <div className="w-full h-48 overflow-hidden">
          <img
            src={article.thumbnail}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
          <span>{article.category}</span>
          <span>·</span>
          <span>{Math.floor(Math.random() * 5) + 3}분</span>
        </div>
        <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors flex-1">
          {article.title}
        </h3>
        <div className="flex items-center gap-2 mt-auto">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white text-sm">
            {article.author?.name?.[0] || '익'}
          </div>
          <span className="text-sm text-gray-600">{article.author?.name || '익명'}</span>
        </div>
      </div>
    </Link>
  );
};

export default Home;
