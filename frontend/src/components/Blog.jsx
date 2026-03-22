import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, Tag } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const Blog = () => {
  const { language, t } = useLanguage();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(BACKEND_URL + '/api/blog');
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTitle = (post) => {
    return post.title[language] || post.title.en;
  };

  const getExcerpt = (post) => {
    return post.excerpt[language] || post.excerpt.en;
  };

  if (loading) {
    return (
      <section id="blog" className="section-padding bg-brand-cream">
        <div className="container-custom">
          <div className="text-center">Loading...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="blog" className="section-padding bg-brand-cream" data-testid="blog-section">
      <div className="container-custom">
        <div className="text-center mb-12">
          <p className="text-brand-slate text-sm uppercase tracking-[0.2em] mb-4" data-testid="blog-subtitle">
            {t('blog.subtitle')}
          </p>
          <h2 className="font-heading text-4xl md:text-5xl text-stone-900 mb-4" data-testid="blog-title">
            {t('blog.title')}
          </h2>
          <p className="text-stone-600 max-w-2xl mx-auto">
            {t('blog.description')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="card-hover bg-white border border-stone-100 rounded-2xl overflow-hidden group"
              data-testid={'blog-card-' + post.slug}
            >
              <Link to={`/blog/${post.slug}`} className="block">
                <div className="img-zoom aspect-[3/2]">
                  <img
                    src={post.image}
                    alt={getTitle(post)}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                </div>
              </Link>

              <div className="p-6">
                <div className="flex items-center gap-4 text-sm text-stone-400 mb-3">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(post.created_at)}
                  </span>
                </div>

                <Link to={`/blog/${post.slug}`}>
                  <h3 className="font-heading text-xl md:text-2xl text-stone-900 mb-3 line-clamp-2 group-hover:text-brand-slate transition-colors">
                    {getTitle(post)}
                  </h3>
                </Link>

                <p className="text-stone-600 text-sm mb-4 line-clamp-2">
                  {getExcerpt(post)}
                </p>

                <div className="flex items-center gap-2 text-sm text-stone-500 mb-4">
                  <User className="w-4 h-4" />
                  <span>{post.author}</span>
                </div>

                <Link
                  to={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-2 text-brand-charcoal hover:text-brand-slate transition-colors font-medium text-sm"
                  data-testid={'blog-read-' + post.slug}
                >
                  {t('blog.readMore')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
