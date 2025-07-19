import React, { useState, useEffect } from 'react';
import { ExternalLink, Clock, Globe } from 'lucide-react';

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  image: string;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
}

interface NewsPanelProps {
  className?: string;
}

const NewsPanel: React.FC<NewsPanelProps> = ({ className = '' }) => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const apiKey = import.meta.env.VITE_GNEWS_API_KEY;
        
        if (!apiKey) {
          setError('GNews API key not found. Please add VITE_GNEWS_API_KEY to your .env file.');
          setLoading(false);
          return;
        }

        // GNews API: https://gnews.io/docs/
        // Example: https://gnews.io/api/v4/top-headlines?token=API_KEY&lang=en&topic=technology&max=5
        const response = await fetch(
          `https://gnews.io/api/v4/top-headlines?token=${apiKey}&lang=en&topic=technology&max=5`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.articles) {
          throw new Error(data.message || 'Failed to fetch news');
        }

        setNews(data.articles || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch news');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <h3 className="text-lg font-semibold mb-4">Latest News</h3>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <h3 className="text-lg font-semibold mb-4">Latest News</h3>
        <div className="text-red-600 text-sm">
          <p>Unable to load news: {error}</p>
          <p className="mt-2 text-gray-600">
            Make sure you have added VITE_GNEWS_API_KEY to your .env file
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Latest News</h3>
        <Globe className="h-5 w-5 text-gray-400" />
      </div>
      <div className="space-y-4">
        {news.map((article, index) => (
          <article key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
            <div className="flex items-start space-x-3">
              {article.image && (
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                  {article.title}
                </h4>
                <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                  {article.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(article.publishedAt)}</span>
                    <span>•</span>
                    <span>{article.source.name}</span>
                  </div>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                  >
                    <span>Read</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default NewsPanel; 