import { Link } from 'react-router-dom';
import { Eye, ThumbsUp, MessageCircle, Bookmark } from 'lucide-react';

const ArticleGrid = ({ articles = [], title = "요즘 뜨는 인기 컬렉션" }) => {
  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Link to="/articles" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          더 보기 →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {articles.map((article) => (
          <ArticleCard key={article._id} article={article} />
        ))}
      </div>
    </section>
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

        {/* 댓글 수 배지 */}
        {article.commentCount > 0 && (
          <div className="absolute top-3 left-3 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center">
            💬 {article.commentCount}
          </div>
        )}
      </div>

      {/* 콘텐츠 */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {article.title}
        </h3>

        <p className="text-sm text-gray-500 mb-3">{article.author?.name || '익명'}</p>

        {/* 통계 */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center">
            <Eye className="w-3.5 h-3.5 mr-1" />
            {formatNumber(article.views || 0)}
          </span>
          <span className="flex items-center">
            <ThumbsUp className="w-3.5 h-3.5 mr-1" />
            {formatNumber(article.likes || 0)}
          </span>
          <span className="flex items-center">
            <MessageCircle className="w-3.5 h-3.5 mr-1" />
            {formatNumber(article.commentCount || 0)}
          </span>
        </div>
      </div>
    </Link>
  );
};

const formatNumber = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num;
};

export default ArticleGrid;
