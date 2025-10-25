import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame } from 'lucide-react';
import api from '../../utils/api';

const RecommendedPosts = () => {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await api.get('/articles?sort=popular&limit=5');
      setArticles(response.data.articles || []);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-5 h-5 text-orange-500" />
        <h3 className="font-bold text-lg">HOT 게시글</h3>
      </div>

      <div className="space-y-4">
        {articles.map((article, index) => (
          <Link
            key={article._id}
            to={`/article/${article._id}`}
            className="block hover:bg-gray-50 p-2 rounded-lg transition-colors"
          >
            <div className="flex gap-3">
              <span className="text-2xl font-bold text-gray-300 flex-shrink-0">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm line-clamp-2 mb-1">
                  {article.title}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{article.category}</span>
                  <span>·</span>
                  <span>조회 {article.views || 0}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecommendedPosts;
