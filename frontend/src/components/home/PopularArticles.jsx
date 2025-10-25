import { Link } from 'react-router-dom';
import { TrendingUp, Flame } from 'lucide-react';

const PopularArticles = ({ articles = [] }) => {
  if (articles.length === 0) {
    return (
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-primary-600" />
          10월 4주 인기
        </h2>
        <div className="text-center py-12 text-gray-500">
          아직 인기 콘텐츠가 없습니다.
        </div>
      </section>
    );
  }

  return (
    <section className="mb-16">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <TrendingUp className="w-6 h-6 mr-2 text-primary-600" />
        10월 4주 인기
      </h2>

      <div className="space-y-4">
        {articles.slice(0, 5).map((article, index) => (
          <Link
            key={article._id || index}
            to={`/article/${article._id}`}
            className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors group"
          >
            {/* 순위 */}
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-300 group-hover:text-primary-600 transition-colors">
                {index + 1}
              </span>
            </div>

            {/* 콘텐츠 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {article.isNew && (
                  <span className="badge badge-new">NEW</span>
                )}
                <span className="text-sm text-gray-500">{article.category}</span>
                <span className="text-sm text-gray-400">·</span>
                <span className="text-sm text-gray-400">{article.readTime || '5'}분</span>
                {article.isTrending && (
                  <>
                    <span className="text-sm text-gray-400">·</span>
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium text-orange-500">인기</span>
                  </>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                {article.title}
              </h3>
              {article.summary && (
                <p className="text-sm text-gray-600 line-clamp-2">{article.summary}</p>
              )}
            </div>

            {/* 썸네일 */}
            {article.thumbnail && (
              <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={article.thumbnail}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
};

export default PopularArticles;
