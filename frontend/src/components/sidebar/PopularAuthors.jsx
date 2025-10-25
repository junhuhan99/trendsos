import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import api from '../../utils/api';

const PopularAuthors = () => {
  const [authors, setAuthors] = useState([]);

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    try {
      const response = await api.get('/authors?limit=5');
      setAuthors(response.data.authors || []);
    } catch (error) {
      console.error('Failed to fetch authors:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary-600" />
        <h3 className="font-bold text-lg">인기 작가</h3>
      </div>

      <div className="space-y-4">
        {authors.slice(0, 5).map((author) => (
          <Link
            key={author._id}
            to={`/author/${author._id}`}
            className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors"
          >
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
              {author.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{author.name}</p>
              <p className="text-xs text-gray-500">{author.authorCategory}</p>
            </div>
          </Link>
        ))}
      </div>

      <Link
        to="/authors"
        className="block text-center text-sm text-primary-600 hover:text-primary-700 mt-4 pt-4 border-t"
      >
        전체 작가 보기 →
      </Link>
    </div>
  );
};

export default PopularAuthors;
