import { Helmet } from 'react-helmet-async';

const SEO = ({
  title = '트렌드OS - IT 트렌드 매거진',
  description = 'IT 개발자와 기획자를 위한 실무 인사이트와 트렌드를 공유하는 플랫폼',
  keywords = ['IT', '개발', 'AI', '트렌드', '기술', '프로그래밍', '디자인'],
  ogImage = '/default-og.jpg',
  article = false,
  publishedTime,
  modifiedTime,
  author,
  canonical
}) => {
  const siteUrl = 'http://15.165.30.90';
  const fullUrl = canonical ? `${siteUrl}${canonical}` : siteUrl;

  return (
    <Helmet>
      {/* 기본 메타 태그 */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={Array.isArray(keywords) ? keywords.join(', ') : keywords} />

      {/* Open Graph */}
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="트렌드OS" />

      {/* Article 메타 (블로그 글인 경우) */}
      {article && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {article && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {article && author && (
        <meta property="article:author" content={author} />
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={fullUrl} />}
    </Helmet>
  );
};

export default SEO;
