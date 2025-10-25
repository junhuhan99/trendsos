import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import SEO from '../components/common/SEO';

const NewArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await api.get('/articles?sort=recent&limit=20');
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
      <SEO title="새로 나온 | 트렌드OS" description="최신 IT 트렌드와 기술 콘텐츠" />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <h1 className="text-3xl font-bold mb-8">새로 나온 콘텐츠</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link key={article._id} to={`/article/${article._id}`} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {article.thumbnail && <img src={article.thumbnail} alt={article.title} className="w-full h-48 object-cover" />}
                <div className="p-4">
                  <span className="text-xs text-gray-500">{article.category}</span>
                  <h3 className="font-bold mt-2 line-clamp-2">{article.title}</h3>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{article.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default NewArticles;
