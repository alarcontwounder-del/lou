import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Calendar, User, ArrowLeft, ArrowRight, Tag, ChevronRight, Clock, Share2 } from 'lucide-react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Newsletter } from './Newsletter';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;

const CATEGORY_LABELS = {
  'travel-tips': 'Travel Tips',
  'course-guides': 'Course Guides',
  'lifestyle': 'Lifestyle'
};

function ContentRenderer({ text }) {
  if (!text) return null;
  const paragraphs = text.split('\n\n');
  const elements = [];

  for (let i = 0; i < paragraphs.length; i++) {
    const trimmed = paragraphs[i].trim();
    if (!trimmed) continue;

    if (/^\*\*[^*]+\*\*$/.test(trimmed)) {
      const heading = trimmed.replace(/\*\*/g, '');
      elements.push(
        <h2 key={`heading-${i}`} className="font-heading text-xl md:text-2xl text-stone-900 mt-10 mb-4">{heading}</h2>
      );
    } else {
      elements.push(
        <p key={`para-${i}`} className="text-stone-700 leading-[1.9] text-[16px] mb-5">
          <FormattedText text={trimmed} />
        </p>
      );
    }
  }
  return <>{elements}</>;
}

function FormattedText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  const result = [];
  for (let j = 0; j < parts.length; j++) {
    if (parts[j].startsWith('**') && parts[j].endsWith('**')) {
      result.push(<strong key={j} className="text-stone-900 font-semibold">{parts[j].slice(2, -2)}</strong>);
    } else {
      result.push(parts[j]);
    }
  }
  return <>{result}</>;
}

function RelatedCard({ post, language }) {
  const title = post.title[language] || post.title.en;
  const excerpt = post.excerpt[language] || post.excerpt.en;
  return (
    <Link
      to={'/blog/' + post.slug}
      className="group bg-brand-cream rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
      data-testid={'blog-related-' + post.slug}
    >
      <div className="aspect-[3/2] m-3 mb-0 rounded-xl overflow-hidden">
        <img src={post.image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
      </div>
      <div className="p-5">
        <span className="text-xs text-brand-slate uppercase tracking-wider">{CATEGORY_LABELS[post.category] || post.category}</span>
        <h3 className="font-heading text-lg text-stone-900 mt-2 mb-2 group-hover:text-brand-slate transition-colors line-clamp-2">{title}</h3>
        <p className="text-stone-500 text-sm line-clamp-2">{excerpt}</p>
      </div>
    </Link>
  );
}

function Breadcrumbs({ title }) {
  return (
    <nav aria-label="Breadcrumb" className="max-w-3xl mx-auto px-4 pt-28 pb-2" data-testid="blog-breadcrumbs">
      <ol className="flex items-center gap-1.5 text-xs text-stone-400">
        <li><Link to="/" className="hover:text-stone-600 transition-colors">Home</Link></li>
        <ChevronRight className="w-3 h-3 text-stone-300" />
        <li><Link to="/" state={{ scrollTo: 'blog' }} className="hover:text-stone-600 transition-colors">Blog</Link></li>
        <ChevronRight className="w-3 h-3 text-stone-300" />
        <li className="text-stone-500 truncate max-w-[200px] sm:max-w-none">{title}</li>
      </ol>
    </nav>
  );
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [post, setPost] = useState(null);
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setError(false);
    Promise.all([
      axios.get(API + '/api/blog/' + slug),
      axios.get(API + '/api/blog')
    ]).then(function(results) {
      setPost(results[0].data);
      setAllPosts(results[1].data);
      setLoading(false);
    }).catch(function() {
      setError(true);
      setLoading(false);
    });
  }, [slug]);

  useEffect(() => {
    if (!post) return;

    var titleText = (post.title[language] || post.title.en) + ' | golfinmallorca.com';
    var description = post.meta_description || post.excerpt[language] || post.excerpt.en;
    var keywords = (post.seo_keywords || post.tags || []).join(', ');
    var pageUrl = 'https://golfinmallorca.com/blog/' + post.slug;

    document.title = titleText;

    var setMeta = function(attr, name, content) {
      var el = document.querySelector('meta[' + attr + '="' + name + '"]');
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };

    setMeta('name', 'description', description);
    setMeta('name', 'keywords', keywords);
    setMeta('name', 'author', post.author);
    setMeta('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1');
    setMeta('property', 'og:title', titleText);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', pageUrl);
    setMeta('property', 'og:type', 'article');
    setMeta('property', 'og:image', post.image);
    setMeta('property', 'og:site_name', 'golfinmallorca.com');
    setMeta('property', 'article:published_time', post.created_at);
    setMeta('property', 'article:author', post.author);
    setMeta('property', 'article:section', post.category);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', titleText);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', post.image);

    var canonical = document.getElementById('main-canonical');
    if (!canonical) { canonical = document.querySelector('link[rel="canonical"]'); }
    var originalCanonical = canonical ? canonical.href : '';
    if (canonical) canonical.href = pageUrl;

    var langCode = language === 'es' ? 'es-ES' : language === 'de' ? 'de-DE' : language === 'sv' ? 'sv-SE' : 'en-GB';

    var schema = document.getElementById('blog-article-schema');
    if (!schema) { schema = document.createElement('script'); schema.id = 'blog-article-schema'; schema.type = 'application/ld+json'; document.head.appendChild(schema); }
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title[language] || post.title.en,
      description: description,
      image: post.image,
      datePublished: post.created_at,
      dateModified: post.created_at,
      author: { '@type': 'Person', name: post.author },
      publisher: {
        '@type': 'Organization',
        name: 'golfinmallorca.com',
        url: 'https://golfinmallorca.com',
        logo: { '@type': 'ImageObject', url: API + '/api/uploads/logo_email_v2.jpg' }
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
      keywords: keywords,
      articleSection: post.category,
      inLanguage: langCode,
      about: { '@type': 'Thing', name: 'Golf in Mallorca', description: 'Golf courses, holidays, and travel in Mallorca, Spain' }
    });

    var breadcrumbSchema = document.getElementById('blog-breadcrumb-schema');
    if (!breadcrumbSchema) { breadcrumbSchema = document.createElement('script'); breadcrumbSchema.id = 'blog-breadcrumb-schema'; breadcrumbSchema.type = 'application/ld+json'; document.head.appendChild(breadcrumbSchema); }
    breadcrumbSchema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://golfinmallorca.com' },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://golfinmallorca.com/#blog' },
        { '@type': 'ListItem', position: 3, name: post.title[language] || post.title.en, item: pageUrl }
      ]
    });

    return function() {
      document.title = 'golfinmallorca.com | Your Gateway to Luxury Golf in Mallorca';
      var can = document.getElementById('main-canonical') || document.querySelector('link[rel="canonical"]');
      if (can) can.href = originalCanonical || 'https://golfinmallorca.com/';
      var ids = ['blog-article-schema', 'blog-breadcrumb-schema'];
      ids.forEach(function(id) { var el = document.getElementById(id); if (el) el.remove(); });
    };
  }, [post, language]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream">
        <Navbar onAdminClick={function(){}} isAuthenticated={false} isCheckingAuth={true} onSearchClick={function(){}} onPlanTrip={function(){}} variant="light" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-brand-cream">
        <Navbar onAdminClick={function(){}} isAuthenticated={false} isCheckingAuth={true} onSearchClick={function(){}} onPlanTrip={function(){}} variant="light" />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <h1 className="font-heading text-3xl text-stone-900 mb-4">Article Not Found</h1>
          <p className="text-stone-600 mb-8">The blog post you are looking for does not exist.</p>
          <Link to="/" state={{ scrollTo: 'blog' }} className="inline-flex items-center gap-2 bg-brand-charcoal text-white px-6 py-3 rounded-full hover:bg-stone-700 transition-colors text-sm font-medium" data-testid="blog-404-back">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  var title = post.title[language] || post.title.en;
  var content = post.content[language] || post.content.en;
  var excerpt = post.excerpt[language] || post.excerpt.en;
  var readTime = Math.max(3, Math.ceil(content.split(/\s+/).length / 200));
  var dateFormatted = new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  var related = allPosts.filter(function(p) { return p.slug !== post.slug && p.category === post.category; }).slice(0, 2);
  if (related.length < 2) {
    var extra = allPosts.filter(function(p) { return p.slug !== post.slug && !related.find(function(r) { return r.slug === p.slug; }); }).slice(0, 2 - related.length);
    related = related.concat(extra);
  }

  var handleShare = function() {
    var url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: title, url: url }).catch(function(){});
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  var handleCta = function() {
    var url = post.cta.url;
    if (url.startsWith('#')) {
      navigate('/', { state: { scrollTo: url.slice(1) } });
    } else if (url.startsWith('/')) {
      navigate(url);
    } else {
      window.location.href = url;
    }
  };

  var tagElements = (post.tags || []).map(function(tag) {
    return <span key={tag} className="text-xs text-stone-500 bg-stone-100 px-3 py-1.5 rounded-full">{tag}</span>;
  });

  var relatedElements = related.map(function(p) {
    return <RelatedCard key={p.slug} post={p} language={language} />;
  });

  return (
    <div className="min-h-screen bg-brand-cream" data-testid="blog-post-page">
      <Navbar onAdminClick={function(){}} isAuthenticated={false} isCheckingAuth={true} onSearchClick={function(){}} onPlanTrip={function(){}} variant="light" />

      <Breadcrumbs title={title} />

      <article className="max-w-3xl mx-auto px-4 pb-16">
        <div className="mb-6">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-slate bg-stone-100 px-3 py-1.5 rounded-full uppercase tracking-wider" data-testid="blog-post-category">
            <Tag className="w-3 h-3" />
            {CATEGORY_LABELS[post.category] || post.category}
          </span>
        </div>

        <h1 className="font-heading text-3xl sm:text-4xl lg:text-[2.75rem] text-stone-900 leading-tight mb-6" data-testid="blog-post-title">
          {title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-stone-400 mb-8 pb-8 border-b border-stone-200">
          <span className="flex items-center gap-1.5" data-testid="blog-post-author">
            <User className="w-4 h-4" />
            {post.author}
          </span>
          <span className="flex items-center gap-1.5" data-testid="blog-post-date">
            <Calendar className="w-4 h-4" />
            <time dateTime={post.created_at}>{dateFormatted}</time>
          </span>
          <span className="flex items-center gap-1.5" data-testid="blog-post-readtime">
            <Clock className="w-4 h-4" />
            {readTime} min read
          </span>
          <button onClick={handleShare} className="ml-auto flex items-center gap-1.5 text-stone-400 hover:text-stone-600 transition-colors" data-testid="blog-post-share">
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>

        <div className="rounded-2xl overflow-hidden mb-10 aspect-[16/9]">
          <img
            src={post.image}
            alt={title}
            className="w-full h-full object-cover"
            loading="eager"
            data-testid="blog-post-image"
          />
        </div>

        <div className="blog-content" data-testid="blog-post-content">
          <ContentRenderer text={content} />
        </div>

        {post.cta && (
          <div className="mt-12 p-8 bg-stone-50 rounded-2xl border border-stone-100 text-center" data-testid="blog-post-cta">
            <p className="text-stone-500 text-sm mb-4 uppercase tracking-wider">Ready to book?</p>
            <button
              onClick={handleCta}
              className="inline-flex items-center gap-2 bg-brand-charcoal hover:bg-stone-700 text-white font-medium text-sm px-8 py-3.5 rounded-full transition-colors"
              data-testid="blog-post-cta-button"
            >
              {post.cta.label}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {tagElements.length > 0 && (
          <div className="mt-10 pt-8 border-t border-stone-200" data-testid="blog-post-tags">
            <p className="text-xs text-stone-400 uppercase tracking-wider mb-3">Tags</p>
            <div className="flex flex-wrap gap-2">
              {tagElements}
            </div>
          </div>
        )}

        {/* Share Buttons */}
        <div className="mt-10 pt-8 border-t border-stone-200" data-testid="blog-share-buttons">
          <p className="text-xs text-stone-400 uppercase tracking-wider mb-3">Share this article</p>
          <div className="flex items-center gap-3">
            <a
              href={'https://wa.me/?text=' + encodeURIComponent(title + ' — ' + window.location.href)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366]/10 text-[#25D366] rounded-full text-sm font-medium hover:bg-[#25D366]/20 transition-colors"
              data-testid="share-whatsapp"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </a>
            <a
              href={'https://twitter.com/intent/tweet?text=' + encodeURIComponent(title) + '&url=' + encodeURIComponent(window.location.href)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-600 rounded-full text-sm font-medium hover:bg-stone-200 transition-colors"
              data-testid="share-twitter"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              Twitter
            </a>
            <a
              href={'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(window.location.href)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1877F2]/10 text-[#1877F2] rounded-full text-sm font-medium hover:bg-[#1877F2]/20 transition-colors"
              data-testid="share-facebook"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </a>
          </div>
        </div>
      </article>

      {relatedElements.length > 0 && (
        <section className="bg-white py-16 border-t border-stone-100" data-testid="blog-related-posts">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="font-heading text-2xl md:text-3xl text-stone-900 text-center mb-10">You Might Also Enjoy</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {relatedElements}
            </div>
            <div className="text-center mt-10">
              <Link
                to="/"
                state={{ scrollTo: 'blog' }}
                className="inline-flex items-center gap-2 text-brand-charcoal hover:text-brand-slate transition-colors font-medium text-sm"
                data-testid="blog-view-all"
              >
                <ArrowLeft className="w-4 h-4" />
                View All Articles
              </Link>
            </div>
          </div>
        </section>
      )}

      <Newsletter />
      <Footer />
    </div>
  );
}
