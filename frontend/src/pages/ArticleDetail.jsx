import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ThumbsUp, MessageCircle, Bookmark, Share2 } from 'lucide-react';
import api from '../utils/api';

const ArticleDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    fetchArticle();
    fetchComments();
  }, [id]);

  const fetchArticle = async () => {
    try {
      const response = await api.get(`/articles/${id}`);
      setArticle(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch article:', error);
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await api.get(`/articles/${id}/comments`);
      setComments(response.data.comments || []);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleLike = async () => {
    if (!localStorage.getItem('token')) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      await api.post(`/articles/${id}/like`);
      setLiked(!liked);
      setArticle({ ...article, likes: liked ? article.likes - 1 : article.likes + 1 });
    } catch (error) {
      console.error('Failed to like article:', error);
    }
  };

  const handleBookmark = async () => {
    if (!localStorage.getItem('token')) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      await api.post(`/articles/${id}/bookmark`);
      setBookmarked(!bookmarked);
    } catch (error) {
      console.error('Failed to bookmark article:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!localStorage.getItem('token')) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!newComment.trim()) {
      return;
    }

    try {
      await api.post(`/articles/${id}/comments`, { content: newComment });
      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Failed to post comment:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">게시글을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 좌측 사이드바 (고정) */}
        <div className="hidden lg:block fixed left-8 top-1/2 -translate-y-1/2">
          <div className="flex flex-col gap-4">
            <button
              onClick={handleLike}
              className={`p-3 rounded-lg ${liked ? 'bg-primary-100 text-primary-600' : 'bg-white hover:bg-gray-100'} transition-colors`}
            >
              <ThumbsUp className="w-5 h-5" />
              <span className="block text-xs mt-1">{article.likes || 0}</span>
            </button>
            <button className="p-3 bg-white hover:bg-gray-100 rounded-lg transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span className="block text-xs mt-1">{comments.length}</span>
            </button>
            <button
              onClick={handleBookmark}
              className={`p-3 rounded-lg ${bookmarked ? 'bg-primary-100 text-primary-600' : 'bg-white hover:bg-gray-100'} transition-colors`}
            >
              <Bookmark className="w-5 h-5" />
            </button>
            <button className="p-3 bg-white hover:bg-gray-100 rounded-lg transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <article className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          {/* 헤더 */}
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-primary-100 text-primary-600 rounded-full text-sm font-medium mb-4">
              {article.category}
            </span>
            <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white">
                  {article.author?.name?.[0] || 'U'}
                </div>
                {article.author?.name || '익명'}
              </span>
              <span>·</span>
              <span>{new Date(article.createdAt).toLocaleDateString('ko-KR')}</span>
              <span>·</span>
              <span>조회 {article.views || 0}</span>
            </div>
          </div>

          {/* 본문 */}
          <div className="prose max-w-none mb-8">
            {article.content?.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-gray-800 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* 작가 프로필 */}
          <div className="border-t border-gray-200 pt-6 mt-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl">
                {article.author?.name?.[0] || 'U'}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{article.author?.name || '익명'}</h3>
                <p className="text-sm text-gray-600">{article.author?.bio || ''}</p>
              </div>
            </div>
          </div>
        </article>

        {/* 댓글 섹션 */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6">댓글 {comments.length}</h2>

          {/* 댓글 작성 */}
          {localStorage.getItem('token') ? (
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="로그인하고 자유롭게 의견을 남겨주세요."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                rows="4"
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  작성하기
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-8 p-6 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-600 mb-4">로그인하고 자유롭게 의견을 남겨주세요</p>
              <a
                href="/login"
                className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                로그인
              </a>
            </div>
          )}

          {/* 댓글 리스트 */}
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment._id} className="border-b border-gray-200 pb-6 last:border-0">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white">
                    {comment.author?.name?.[0] || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{comment.author?.name || '익명'}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <p className="text-gray-800">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}

            {comments.length === 0 && (
              <p className="text-center text-gray-500 py-8">첫 댓글을 작성해보세요!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;
