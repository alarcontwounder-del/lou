import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Calendar, User, ArrowRight, Tag, X, ChevronDown } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const Blog = () => {
  const { language, t } = useLanguage();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const modalRef = useRef(null);

  const handleModalScroll = useCallback(() => {
    if (modalRef.current && modalRef.current.scrollTop > 60) {
      setShowScrollHint(false);
    }
  }, []);

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

  const getContent = (post) => {
    return post.content[language] || post.content.en;
  };

  const openPost = (post) => {
    setSelectedPost(post);
    setShowScrollHint(true);
  };

  const closePost = () => {
    setSelectedPost(null);
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
              <div className="img-zoom aspect-[3/2]">
                <img
                  src={post.image}
                  alt={getTitle(post)}
                  className="w-full h-full object-cover object-center"
                />
              </div>

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

                <h3 className="font-heading text-xl md:text-2xl text-stone-900 mb-3 line-clamp-2">
                  {getTitle(post)}
                </h3>

                <p className="text-stone-600 text-sm mb-4 line-clamp-2">
                  {getExcerpt(post)}
                </p>

                <div className="flex items-center gap-2 text-sm text-stone-500 mb-4">
                  <User className="w-4 h-4" />
                  <span>{post.author}</span>
                </div>

                <button
                  onClick={() => openPost(post)}
                  className="inline-flex items-center gap-2 text-brand-charcoal hover:text-brand-slate transition-colors font-medium text-sm"
                  data-testid={'blog-read-' + post.slug}
                >
                  {t('blog.readMore')}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="blog-modal">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closePost}
          />
          
          <div
            ref={modalRef}
            onScroll={handleModalScroll}
            className="relative bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={closePost}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-stone-600 hover:text-stone-900 transition-colors"
              data-testid="blog-modal-close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative">
              <div className="aspect-video rounded-t-2xl overflow-hidden">
                <img
                  src={selectedPost.image}
                  alt={getTitle(selectedPost)}
                  className="w-full h-full object-cover"
                />
              </div>

              {showScrollHint && (
                <button
                  onClick={() => {
                    if (modalRef.current) {
                      modalRef.current.scrollBy({ top: 300, behavior: 'smooth' });
                    }
                  }}
                  className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-3 pt-10 bg-gradient-to-t from-black/50 to-transparent text-white/90 transition-opacity duration-500 hover:text-white cursor-pointer"
                  data-testid="blog-scroll-hint"
                >
                  <span className="text-xs uppercase tracking-[0.15em] font-medium mb-1">Continue reading</span>
                  <ChevronDown className="w-5 h-5 animate-bounce" />
                </button>
              )}
            </div>

            <div className="p-8">
              <div className="flex flex-wrap items-center gap-4 text-sm text-stone-400 mb-4">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formatDate(selectedPost.created_at)}
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  {selectedPost.author}
                </span>
              </div>

              <h2 className="font-heading text-3xl md:text-4xl text-stone-900 mb-6">
                {getTitle(selectedPost)}
              </h2>

              <p className="text-stone-600 leading-relaxed text-lg whitespace-pre-line">
                {getContent(selectedPost)}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
