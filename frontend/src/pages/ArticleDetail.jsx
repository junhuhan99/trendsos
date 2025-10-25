import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, Bookmark, Share2, Eye, Clock } from 'lucide-react';
import api from '../utils/api';
import SEO from '../components/common/SEO';

const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [author, setAuthor] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      const response = await api.get(`/articles/${id}`);
      setArticle(response.data);

      if (response.data.author) {
        try {
          const authorRes = await api.get(`/authors/${response.data.author._id || response.data.author}`);
          setAuthor(authorRes.data.author);
        } catch (err) {
          console.log('Author not found');
        }
      }

      const relatedRes = await api.get(`/articles?category=${response.data.category}&limit=5`);
      setRelatedArticles(relatedRes.data.articles.filter(a => a._id !== id));
    } catch (error) {
      console.error('Failed to fetch article:', error);
      alert('게시글을 불러올 수 없습니다.');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!localStorage.getItem('token')) {
      alert('로그인이 필요합니다.');
      return;
    }
    try {
      const response = await api.post(`/articles/${id}/like`);
      setLiked(response.data.hasLiked);
      setArticle({ ...article, likes: response.data.likes });
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleBookmark = async () => {
    if (!localStorage.getItem('token')) {
      alert('로그인이 필요합니다.');
      return;
    }
    try {
      const response = await api.post(`/articles/${id}/bookmark`);
      setBookmarked(response.data.hasBookmarked);
    } catch (error) {
      console.error('Bookmark error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!article) return null;

  return (
    <>
      <SEO
        title={article.metaTitle || article.title}
        description={article.metaDescription || article.summary}
        keywords={article.metaKeywords || [article.category]}
        ogImage={article.ogImage || article.thumbnail}
        article={true}
        publishedTime={article.createdAt}
        modifiedTime={article.updatedAt}
        author={author?.name}
        canonical={`/article/${article._id}`}
      />

      <div className="bg-white">
        <div className="border-b">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center gap-2 mb-4">
              <Link to="/" className="text-sm text-primary-600 hover:underline">{article.category}</Link>
              <span className="text-gray-300">|</span>
              <span className="text-sm text-gray-500">{new Date(article.createdAt).toLocaleDateString('ko-KR')}</span>
            </div>
            <h1 className="text-4xl font-bold mb-4 leading-tight">{article.title}</h1>
            <p className="text-xl text-gray-600 mb-6">{article.summary}</p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-1"><Eye className="w-4 h-4" /><span>{article.views || 0}</span></div>
              <div className="flex items-center gap-1"><Clock className="w-4 h-4" /><span>{article.readTime || 5}분</span></div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-12 gap-8">
            <aside className="col-span-2 hidden lg:block">
              <div className="sticky top-24">
                {author && (
                  <Link to={`/author/${author._id}`} className="block">
                    <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl mb-3 mx-auto">{author.name[0]}</div>
                    <p className="text-center font-medium text-sm">{author.name}</p>
                    <p className="text-center text-xs text-gray-500 mt-1">{author.authorCategory}</p>
                  </Link>
                )}
                <div className="mt-6 space-y-3">
                  <button onClick={handleLike} className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg border ${liked ? 'bg-red-50 border-red-500 text-red-500' : 'border-gray-300 hover:bg-gray-50'}`}>
                    <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} /><span className="text-sm">{article.likes || 0}</span>
                  </button>
                  <button onClick={handleBookmark} className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg border ${bookmarked ? 'bg-primary-50 border-primary-500 text-primary-500' : 'border-gray-300 hover:bg-gray-50'}`}>
                    <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"><Share2 className="w-4 h-4" /></button>
                </div>
              </div>
            </aside>

            <main className="col-span-12 lg:col-span-7">
              {article.thumbnail && <img src={article.thumbnail} alt={article.title} className="w-full rounded-lg mb-8" />}
              <div className="prose prose-lg max-w-none article-content" dangerouslySetInnerHTML={{ __html: article.content }} />
              {article.metaKeywords && article.metaKeywords.length > 0 && (
                <div className="mt-12 pt-8 border-t">
                  <div className="flex flex-wrap gap-2">
                    {article.metaKeywords.map((keyword, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-sm">#{keyword}</span>
                    ))}
                  </div>
                </div>
              )}
            </main>

            <aside className="col-span-12 lg:col-span-3">
              <div className="sticky top-24 space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-bold mb-4">관련 글</h3>
                  <div className="space-y-4">
                    {relatedArticles.slice(0, 5).map((related) => (
                      <Link key={related._id} to={`/article/${related._id}`} className="block hover:text-primary-600">
                        <p className="text-sm font-medium line-clamp-2">{related.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{new Date(related.createdAt).toLocaleDateString('ko-KR')}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <style>{`
        .article-content img { max-width: 100%; height: auto; border-radius: 0.5rem; margin: 2rem 0; }
        .article-content p { margin-bottom: 1.5rem; line-height: 1.8; }
        .article-content h2 { font-size: 1.875rem; font-weight: 700; margin-top: 3rem; margin-bottom: 1rem; }
        .article-content h3 { font-size: 1.5rem; font-weight: 700; margin-top: 2rem; margin-bottom: 0.75rem; }
        .article-content ul, .article-content ol { margin-bottom: 1.5rem; padding-left: 1.5rem; }
        .article-content li { margin-bottom: 0.5rem; }
        .article-content code { background: #f3f4f6; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.875rem; }
        .article-content pre { background: #1f2937; color: #f3f4f6; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin: 1.5rem 0; }
      `}</style>
    </>
  );
};

export default ArticleDetail;
