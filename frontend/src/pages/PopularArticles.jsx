import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import SEO from '../components/common/SEO';

const PopularArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await api.get('/articles?sort=popular&limit=20');
      setArticles(response.data.articles || []);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <>
      <SEO title="인기 콘텐츠 | 트렌드OS" description="가장 인기있는 IT 콘텐츠" />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <h1 className="text-3xl font-bold mb-8">🔥 인기 콘텐츠</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, idx) => (
              <Link key={article._id} to={`/article/${article._id}`} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow relative">
                <div className="absolute top-2 left-2 bg-primary-600 text-white px-2 py-1 rounded text-xs font-bold">{idx + 1}</div>
                {article.thumbnail && <img src={article.thumbnail} alt={article.title} className="w-full h-48 object-cover" />}
                <div className="p-4">
                  <span className="text-xs text-gray-500">{article.category}</span>
                  <h3 className="font-bold mt-2 line-clamp-2">{article.title}</h3>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{article.summary}</p>
                  <div className="flex gap-4 mt-3 text-xs text-gray-500">
                    <span>조회 {article.views || 0}</span>
                    <span>좋아요 {article.likes || 0}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default PopularArticles;
