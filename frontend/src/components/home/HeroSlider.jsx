import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import api from '../../utils/api';

const HeroSlider = () => {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    fetchFeaturedArticles();
  }, []);

  const fetchFeaturedArticles = async () => {
    try {
      const response = await api.get('/articles?featured=true&limit=5');
      setArticles(response.data.articles || []);
    } catch (error) {
      console.error('Failed to fetch featured articles:', error);
    }
  };

  if (articles.length === 0) return null;

  return (
    <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm">
      <div className="absolute top-4 left-4 z-10">
        <span className="inline-block px-4 py-2 bg-primary-600 text-white font-bold rounded-full text-sm">
          🔥 오늘의 토픽
        </span>
      </div>

      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          type: 'fraction',
        }}
        navigation={true}
        className="hero-slider"
      >
        {articles.map((article) => (
          <SwiperSlide key={article._id}>
            <Link to={`/article/${article._id}`} className="block">
              <div className="relative h-96 bg-gradient-to-br from-gray-900 to-gray-700">
                {article.thumbnail && (
                  <img
                    src={article.thumbnail}
                    alt={article.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <span className="inline-block px-3 py-1 bg-primary-600 text-white text-xs font-medium rounded mb-3">
                    {article.category}
                  </span>
                  <h2 className="text-3xl font-bold mb-3 line-clamp-2">
                    {article.title}
                  </h2>
                  <p className="text-lg text-gray-200 line-clamp-2 mb-4">
                    {article.summary}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-300">
                    <span>{article.author?.name || '익명'}</span>
                    <span>•</span>
                    <span>{new Date(article.createdAt).toLocaleDateString('ko-KR')}</span>
                  </div>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>

      <style>{`
        .hero-slider .swiper-pagination {
          bottom: 20px;
          right: 20px;
          left: auto;
          width: auto;
          background: rgba(0, 0, 0, 0.5);
          padding: 4px 12px;
          border-radius: 20px;
          color: white;
          font-size: 14px;
          font-weight: 500;
        }
        .hero-slider .swiper-button-prev,
        .hero-slider .swiper-button-next {
          color: white;
          background: rgba(0, 0, 0, 0.5);
          width: 40px;
          height: 40px;
          border-radius: 50%;
        }
        .hero-slider .swiper-button-prev:after,
        .hero-slider .swiper-button-next:after {
          font-size: 18px;
        }
      `}</style>
    </div>
  );
};

export default HeroSlider;
