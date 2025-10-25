import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Calendar } from 'lucide-react';
import api from '../../utils/api';

const WeeklyRanking = () => {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    fetchPopularArticles();
  }, []);

  const fetchPopularArticles = async () => {
    try {
      const response = await api.get('/articles?sort=popular&limit=4');
      setArticles(response.data.articles || []);
    } catch (error) {
      console.error('Failed to fetch popular articles:', error);
    }
  };

  const getCurrentWeek = () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const week = Math.ceil(now.getDate() / 7);
    return `${month}월 ${week}주 인기`;
  };

  const getBadgeColor = (index) => {
    switch (index) {
      case 0:
        return 'bg-yellow-500';
      case 1:
        return 'bg-gray-400';
      case 2:
        return 'bg-orange-600';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-primary-600" />
        <h2 className="text-xl font-bold">{getCurrentWeek()}</h2>
      </div>

      <div className="space-y-4">
        {articles.map((article, index) => (
          <Link
            key={article._id}
            to={`/article/${article._id}`}
            className="flex gap-4 group"
          >
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 ${getBadgeColor(index)} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
                {index + 1}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              {index === 0 && article.thumbnail && (
                <div className="w-16 h-16 rounded-lg overflow-hidden mb-2 float-right ml-3">
                  <img
                    src={article.thumbnail}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 mb-1">
                {index === 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">
                    NEW
                  </span>
                )}
                <span className="text-xs text-gray-500">{article.category}</span>
                {article.views > 100 && (
                  <>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{article.views}회</span>
                  </>
                )}
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-orange-500 flex items-center gap-0.5">
                  👍 인기
                </span>
              </div>

              <h3 className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-primary-600 transition-colors mb-1">
                {article.title}
              </h3>

              {index !== 0 && article.thumbnail && (
                <div className="w-16 h-16 rounded-lg overflow-hidden mt-2">
                  <img
                    src={article.thumbnail}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default WeeklyRanking;
