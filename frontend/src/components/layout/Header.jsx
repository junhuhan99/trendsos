import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));

  // 로그인 상태 변경 감지
  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem('token'));
      setUser(JSON.parse(localStorage.getItem('user') || '{}'));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-primary-600 font-bold text-2xl">⚡</span>
            <span className="font-bold text-xl">트렌드OS</span>
          </Link>

          {/* 네비게이션 */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/new" className="text-gray-700 hover:text-primary-600 font-medium flex items-center">
              새로 나온
              <span className="ml-1 bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">N</span>
            </Link>
            <Link to="/popular" className="text-gray-700 hover:text-primary-600 font-medium">
              인기
            </Link>
            <Link to="/authors" className="text-gray-700 hover:text-primary-600 font-medium">
              요즘 작가들
            </Link>
            <Link to="/collections" className="text-gray-700 hover:text-primary-600 font-medium flex items-center">
              컬렉션
              <span className="ml-1 bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">N</span>
            </Link>
            <Link to="/ai" className="text-gray-700 hover:text-primary-600 font-medium flex items-center">
              몰아봐 AI
            </Link>
          </nav>

          {/* 우측 메뉴 */}
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Search className="w-5 h-5 text-gray-600" />
            </button>

            {isLoggedIn ? (
              <>
                {/* 글쓰기 버튼 (작가 또는 관리자) */}
                {(user.isAuthor || user.role === 'admin') && (
                  <Link
                    to="/write"
                    className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    글쓰기
                  </Link>
                )}

                {/* 작가 신청 버튼 (일반 사용자) */}
                {!user.isAuthor && user.role !== 'admin' && user.authorStatus !== 'pending' && (
                  <Link
                    to="/author/apply"
                    className="text-sm text-gray-700 hover:text-primary-600 font-medium"
                  >
                    작가 신청
                  </Link>
                )}

                {/* 관리자 메뉴 */}
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-sm text-gray-700 hover:text-primary-600">
                    관리자
                  </Link>
                )}

                <Link to="/profile" className="text-sm text-gray-700 hover:text-primary-600">
                  내 프로필
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-700 hover:text-primary-600"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-700 hover:text-primary-600">
                  로그인
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>

        {/* 카테고리 */}
        <div className="flex items-center space-x-6 py-3 overflow-x-auto scrollbar-hide">
          <CategoryLink to="/category/development">개발</CategoryLink>
          <CategoryLink to="/category/ai">AI</CategoryLink>
          <CategoryLink to="/category/it-service">IT서비스</CategoryLink>
          <CategoryLink to="/category/planning">기획</CategoryLink>
          <CategoryLink to="/category/design">디자인</CategoryLink>
          <CategoryLink to="/category/business">비즈니스</CategoryLink>
          <CategoryLink to="/category/product">프로덕트</CategoryLink>
          <CategoryLink to="/category/career">커리어</CategoryLink>
          <CategoryLink to="/category/trend">트렌드</CategoryLink>
          <CategoryLink to="/category/startup">스타트업</CategoryLink>
        </div>
      </div>
    </header>
  );
};

const CategoryLink = ({ to, children }) => (
  <Link
    to={to}
    className="text-sm text-gray-600 hover:text-primary-600 whitespace-nowrap font-medium transition-colors"
  >
    {children}
  </Link>
);

export default Header;
