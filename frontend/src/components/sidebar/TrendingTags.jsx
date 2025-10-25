import { Hash } from 'lucide-react';

const TrendingTags = () => {
  const tags = [
    { name: 'React', count: 145 },
    { name: 'JavaScript', count: 203 },
    { name: 'TypeScript', count: 98 },
    { name: 'Next.js', count: 87 },
    { name: 'AI', count: 156 },
    { name: '프론트엔드', count: 178 },
    { name: '백엔드', count: 134 },
    { name: 'DevOps', count: 72 },
    { name: '디자인시스템', count: 56 },
    { name: 'UX', count: 91 },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Hash className="w-5 h-5 text-primary-600" />
        <h3 className="font-bold text-lg">트렌딩 태그</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag.name}
            className="px-3 py-1.5 bg-gray-100 hover:bg-primary-100 hover:text-primary-600 rounded-full text-sm transition-colors"
          >
            #{tag.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TrendingTags;
