import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HeroSlider = ({ articles = [] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.max(articles.length, 1));
    }, 5000);

    return () => clearInterval(timer);
  }, [articles.length]);

  if (articles.length === 0) {
    return (
      <div className="relative w-full h-[500px] bg-gradient-to-r from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-4xl font-bold mb-4">트렌드OS</h2>
          <p className="text-xl">IT 트렌드와 개발 지식을 한 곳에서</p>
        </div>
      </div>
    );
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % articles.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + articles.length) % articles.length);
  };

  return (
    <div className="relative w-full h-[500px] rounded-2xl overflow-hidden group">
      {/* 오늘의 토픽 배지 */}
      <div className="absolute top-6 left-6 z-10">
        <span className="bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
          💎 오늘의 토픽
        </span>
      </div>

      {/* 슬라이드 */}
      <div
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {articles.map((article, index) => (
          <div
            key={article._id || index}
            className="min-w-full h-full relative bg-gradient-to-r from-primary-600 to-purple-700"
          >
            {article.thumbnail && (
              <img
                src={article.thumbnail}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
              <h2 className="text-4xl font-bold mb-4 max-w-3xl">{article.title}</h2>
              <p className="text-lg mb-4 max-w-2xl opacity-90">{article.summary}</p>
              <div className="flex items-center space-x-4 text-sm">
                <span className="bg-white/20 px-3 py-1 rounded-full">{article.category}</span>
                <span>{article.readTime || '5'}분</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 네비게이션 버튼 */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft className="w-6 h-6 text-gray-800" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight className="w-6 h-6 text-gray-800" />
      </button>

      {/* 인디케이터 */}
      <div className="absolute bottom-6 right-6 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
        {currentSlide + 1} / {articles.length}
      </div>
    </div>
  );
};

export default HeroSlider;
