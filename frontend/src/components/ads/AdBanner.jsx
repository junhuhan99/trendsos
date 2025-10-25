import { useEffect, useState } from 'react';
import api from '../../utils/api';

const AdBanner = ({ position, className = '' }) => {
  const [ad, setAd] = useState(null);

  useEffect(() => {
    fetchAd();
  }, [position]);

  const fetchAd = async () => {
    try {
      const response = await api.get(`/ads/active?position=${position}`);
      if (response.data.ads && response.data.ads.length > 0) {
        // 랜덤으로 하나 선택
        const randomAd = response.data.ads[Math.floor(Math.random() * response.data.ads.length)];
        setAd(randomAd);

        // 노출수 증가
        api.post(`/ads/${randomAd._id}/impression`).catch(() => {});
      }
    } catch (error) {
      console.error('Failed to fetch ad:', error);
    }
  };

  const handleClick = () => {
    if (ad) {
      // 클릭수 증가
      api.post(`/ads/${ad._id}/click`).catch(() => {});
    }
  };

  if (!ad) return null;

  return (
    <a
      href={ad.linkUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`block overflow-hidden ${className}`}
    >
      <img
        src={ad.imageUrl}
        alt={ad.title}
        className="w-full h-full object-cover hover:opacity-90 transition-opacity"
      />
      {ad.description && (
        <p className="text-xs text-gray-500 mt-1 text-center">광고</p>
      )}
    </a>
  );
};

export default AdBanner;
