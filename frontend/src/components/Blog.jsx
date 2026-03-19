import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, ArrowRight, Tag, X, ChevronDown } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const Blog = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
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
            className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
          >
            <button
              onClick={closePost}
              className="absolute top-3 right-3 z-10 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center text-stone-600 hover:text-stone-900 transition-colors"
              data-testid="blog-modal-close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative">
              <div className="aspect-[16/9] rounded-t-2xl overflow-hidden">
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
                      modalRef.current.scrollBy({ top: 280, behavior: 'smooth' });
                    }
                  }}
                  className="absolute bottom-5 left-1/2 -translate-x-1/2 group"
                  data-testid="blog-scroll-hint"
                >
                  <div className="flex flex-col items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2.5">
                    <span className="text-white/80 text-[10px] uppercase tracking-[0.2em] font-light group-hover:text-white transition-colors">Scroll</span>
                    <div className="w-6 h-10 rounded-full border-2 border-white/40 flex items-start justify-center pt-1.5 group-hover:border-white/60 transition-colors">
                      <div className="w-1 h-2 bg-white/70 rounded-full animate-bounce group-hover:bg-white transition-colors"></div>
                    </div>
                  </div>
                </button>
              )}
            </div>

            <div className="p-6">
              <div className="flex flex-wrap items-center gap-3 text-xs text-stone-400 mb-3">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(selectedPost.created_at)}
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  {selectedPost.author}
                </span>
              </div>

              <h2 className="font-heading text-2xl md:text-3xl text-stone-900 mb-5">
                {getTitle(selectedPost)}
              </h2>

              <p className="text-stone-600 leading-relaxed text-base whitespace-pre-line">
                {getContent(selectedPost)}
              </p>

              {selectedPost.cta && (
                <div className="mt-6 pt-5 border-t border-stone-100">
                  <button
                    onClick={() => {
                      closePost();
                      const url = selectedPost.cta.url;
                      if (url.startsWith('#')) {
                        setTimeout(() => {
                          const el = document.getElementById(url.slice(1));
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }, 300);
                      } else {
                        navigate(url);
                      }
                    }}
                    className="inline-flex items-center gap-2 bg-brand-charcoal hover:bg-stone-700 text-white font-medium text-sm px-6 py-3 rounded-full transition-colors"
                    data-testid="blog-cta-button"
                  >
                    {selectedPost.cta.label}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
