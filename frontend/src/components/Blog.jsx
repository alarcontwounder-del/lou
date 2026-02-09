import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Calendar, User, ArrowRight, Tag } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BlogCard = ({ post, language, t, onReadMore }) => {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'de' ? 'de-DE' : language === 'fr' ? 'fr-FR' : language === 'se' ? 'sv-SE' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <article
      className="card-hover bg-white border border-stone-100 overflow-hidden group"
      data-testid={`blog-card-${post.slug}`}
    >
      {/* Image */}
      <div className="img-zoom aspect-[16/10]">
        <img
          src={post.image}
          alt={post.title[language] || post.title.en}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Category & Date */}
        <div className="flex items-center gap-4 text-sm text-stone-400 mb-3">
          <span className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" />
            {post.category.replace('-', ' ')}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(post.created_at)}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-heading text-xl md:text-2xl text-stone-900 mb-3 line-clamp-2">
          {post.title[language] || post.title.en}
        </h3>

        {/* Excerpt */}
        <p className="text-stone-600 text-sm mb-4 line-clamp-2">
          {post.excerpt[language] || post.excerpt.en}
        </p>

        {/* Author */}
        <div className="flex items-center gap-2 text-sm text-stone-500 mb-4">
          <User className="w-4 h-4" />
          <span>{post.author}</span>
        </div>

        {/* Read More */}
        <button
          onClick={() => onReadMore(post)}
          className="inline-flex items-center gap-2 text-brand-green hover:text-brand-terracotta transition-colors font-medium text-sm group"
          data-testid={`blog-read-${post.slug}`}
        >
          {t('blog.readMore')}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </article>
  );
};

const BlogModal = ({ post, language, t, onClose }) => {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'de' ? 'de-DE' : language === 'fr' ? 'fr-FR' : language === 'se' ? 'sv-SE' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="blog-modal">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-stone-600 hover:text-stone-900 transition-colors"
          data-testid="blog-modal-close"
        >
          ×
        </button>

        {/* Image */}
        <div className="aspect-video">
          <img
            src={post.image}
            alt={post.title[language] || post.title.en}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-stone-400 mb-4">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatDate(post.created_at)}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              {post.author}
            </span>
            <span className="px-3 py-1 bg-brand-sand/20 rounded-full text-stone-600 capitalize">
              {post.category.replace('-', ' ')}
            </span>
          </div>

          {/* Title */}
          <h2 className="font-heading text-3xl md:text-4xl text-stone-900 mb-6">
            {post.title[language] || post.title.en}
          </h2>

          {/* Content */}
          <div className="prose prose-stone max-w-none">
            <p className="text-stone-600 leading-relaxed text-lg">
              {post.content[language] || post.content.en}
            </p>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-stone-100">
              {post.tags.map((tag, i) => (
                <span key={i} className="text-xs px-3 py-1.5 bg-stone-100 text-stone-600 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const Blog = () => {
  const { language, t } = useLanguage();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`${API}/blog`);
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <section id="blog" className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center">Loading...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="blog" className="section-padding bg-white" data-testid="blog-section">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-brand-terracotta text-sm uppercase tracking-[0.2em] mb-4" data-testid="blog-subtitle">
            {t('blog.subtitle')}
          </p>
          <h2 className="font-heading text-4xl md:text-5xl text-stone-900 mb-4" data-testid="blog-title">
            {t('blog.title')}
          </h2>
          <p className="text-stone-600 max-w-2xl mx-auto">
            {t('blog.description')}
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          {posts.slice(0, 4).map((post) => (
            <BlogCard 
              key={post.id} 
              post={post} 
              language={language} 
              t={t}
              onReadMore={setSelectedPost}
            />
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedPost && (
        <BlogModal
          post={selectedPost}
          language={language}
          t={t}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </section>
  );
};
