import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Newsletter } from '../components/Newsletter';
import SEO_CONTENT from '../data/golfCourseSEO';
import { Thermometer, MapPin, Flag, Trophy, ChevronRight, ArrowLeft, ExternalLink, Navigation, Star, Sun, Clock, Users } from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;

export default function GolfCoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { golfCourses } = useData();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fromContext = golfCourses.find(c => c.id === courseId);
    if (fromContext) {
      setCourse(fromContext);
      setLoading(false);
    } else {
      axios.get(API + '/api/golf-courses/' + courseId)
        .then(res => setCourse(res.data))
        .catch(() => navigate('/'))
        .finally(() => setLoading(false));
    }
    window.scrollTo(0, 0);
  }, [courseId, golfCourses, navigate]);

  useEffect(() => {
    if (!course) return;
    const seo = SEO_CONTENT[course.id] || {};
    const title = seo.seoTitle || course.name + ' | Golf in Mallorca';
    const desc = seo.metaDesc || 'Book tee times at ' + course.name + ' in ' + course.location;
    const url = 'https://golfinmallorca.com/golf-courses/' + course.id;
    
    document.title = title;
    
    const setMeta = (attr, name, content) => {
      let el = document.querySelector('meta[' + attr + '="' + name + '"]');
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    setMeta('name', 'description', desc);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:image', course.image);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:type', 'place');

    let schema = document.getElementById('course-schema');
    if (!schema) { schema = document.createElement('script'); schema.id = 'course-schema'; schema.type = 'application/ld+json'; document.head.appendChild(schema); }
    schema.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'GolfCourse', name: course.name, description: course.description?.en || '', image: course.image, url: url, address: { '@type': 'PostalAddress', addressLocality: course.location, addressRegion: 'Illes Balears', addressCountry: 'ES' }, numberOfHoles: course.holes, priceRange: 'From EUR' + course.price_from, provider: { '@id': 'https://golfinmallorca.com/#organization' } });

    let canonical = document.getElementById('course-canonical');
    if (!canonical) { canonical = document.createElement('link'); canonical.id = 'course-canonical'; canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = url;

    return () => {
      document.title = 'Golf in Mallorca - Book Tee Times & Discover the Island';
      const s = document.getElementById('course-schema'); if (s) s.remove();
      const c = document.getElementById('course-canonical'); if (c) c.remove();
    };
  }, [course]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
      </div>
    );
  }
  if (!course) return null;

  const seo = SEO_CONTENT[course.id] || {};
  const longDesc = seo.longDesc || '';
  const shortDesc = course.description?.[language] || course.description?.en || '';
  const related = golfCourses.filter(c => c.id !== course.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-brand-cream" data-testid="golf-course-page">
      <Navbar onAdminClick={() => {}} isAuthenticated={false} isCheckingAuth={false} />
      <CourseHeroSection course={course} />
      <main className="max-w-6xl mx-auto px-6 md:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-10">
            <AboutSection name={course.name} longDesc={longDesc} shortDesc={shortDesc} />
            <DetailsSection course={course} seo={seo} />
            <FeaturesSection features={course.features} />
            <SeasonSection bestSeason={seo.bestSeason} />
          </div>
          <SidebarSection course={course} seo={seo} />
        </div>
        <RelatedSection courses={related} />
      </main>
      <Newsletter />
      <Footer />
    </div>
  );
}

// Per-course image position overrides for best framing
const HERO_POSITION = {};

// Override hero images with real venue photos provided by the owner
const HERO_IMAGE_OVERRIDE = {
  'golf-alcanada': 'https://customer-assets.emergentagent.com/job_d2328a9c-a7a3-423d-be37-2d406c49ef41/artifacts/jy0gy9e4_alcanada0.jpg',
  'golf-son-gual': 'https://customer-assets.emergentagent.com/job_d2328a9c-a7a3-423d-be37-2d406c49ef41/artifacts/6phgn5ow_songual04%20copia.jpg',
  'son-vida-golf': 'https://customer-assets.emergentagent.com/job_d2328a9c-a7a3-423d-be37-2d406c49ef41/artifacts/3jm58rib_hole-9-with-clubhouse.jpg',
};

function getHeroImage(imageUrl, courseId) {
  if (HERO_IMAGE_OVERRIDE[courseId]) return HERO_IMAGE_OVERRIDE[courseId];
  // Do NOT upscale Cloudinary images — use original to avoid pixelation
  return imageUrl;
}

function CourseHeroSection({ course }) {
  const heroImg = getHeroImage(course.image, course.id);
  return (
    <div className="relative h-[35vh] min-h-[280px] max-h-[420px]" data-testid="course-hero">
      <img src={heroImg} alt={course.name} className="w-full h-full object-cover object-center" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      <Link to="/#courses" className="absolute top-20 left-6 md:left-12 inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs hover:bg-white/25 transition-all" data-testid="back-to-courses">
        <ArrowLeft className="w-4 h-4" />All Courses
      </Link>
      <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 pb-6">
        <div className="max-w-6xl mx-auto">
          <nav className="flex items-center gap-2 text-white/70 text-xs mb-2" data-testid="breadcrumb">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/#courses" className="hover:text-white transition-colors">Golf Courses</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">{course.name}</span>
          </nav>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-white mb-2" data-testid="course-name">{course.name}</h1>
          <div className="flex flex-wrap items-center gap-3 text-white/90 text-sm">
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{course.location}</span>
            <span className="flex items-center gap-1.5"><Flag className="w-4 h-4" />{course.holes} Holes | Par {course.par}</span>
            {course.price_from && <span className="flex items-center gap-1.5"><Trophy className="w-4 h-4" />From &euro;{course.price_from}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function AboutSection({ name, longDesc, shortDesc }) {
  return (
    <section data-testid="course-about">
      <h2 className="font-heading text-2xl md:text-3xl text-stone-900 mb-4">About {name}</h2>
      <p className="text-stone-600 text-lg leading-relaxed mb-4">{longDesc || shortDesc}</p>
      {longDesc && longDesc !== shortDesc && <p className="text-stone-500 leading-relaxed">{shortDesc}</p>}
    </section>
  );
}

function DetailCard({ icon, label, value }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-stone-100 shadow-sm">
      <div className="text-stone-400 mb-2">{icon}</div>
      <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-stone-900 font-semibold text-sm">{value}</p>
    </div>
  );
}

function DetailsSection({ course, seo }) {
  return (
    <section data-testid="course-details">
      <h2 className="font-heading text-2xl text-stone-900 mb-6">Course Details</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <DetailCard icon={<Flag className="w-5 h-5" />} label="Holes" value={String(course.holes)} />
        <DetailCard icon={<Star className="w-5 h-5" />} label="Par" value={String(course.par)} />
        <DetailCard icon={<Trophy className="w-5 h-5" />} label="Green Fee" value={'From EUR' + course.price_from} />
        {seo.designer && <DetailCard icon={<Users className="w-5 h-5" />} label="Designer" value={seo.designer} />}
        {seo.yearBuilt && <DetailCard icon={<Clock className="w-5 h-5" />} label="Established" value={String(seo.yearBuilt)} />}
        {seo.terrain && <DetailCard icon={<Sun className="w-5 h-5" />} label="Terrain" value={seo.terrain} />}
      </div>
    </section>
  );
}

function FeaturesSection({ features }) {
  if (!features || features.length === 0) return null;
  return (
    <section data-testid="course-features">
      <h2 className="font-heading text-2xl text-stone-900 mb-6">Facilities & Features</h2>
      <div className="flex flex-wrap gap-3">
        {features.map((f, i) => (
          <span key={i} className="px-4 py-2 bg-white border border-stone-200 rounded-full text-stone-700 text-sm font-medium shadow-sm">{f}</span>
        ))}
      </div>
    </section>
  );
}

function SeasonSection({ bestSeason }) {
  if (!bestSeason) return null;
  return (
    <section data-testid="course-season" className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <Thermometer className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h3 className="font-heading text-lg text-stone-900 mb-1">Best Time to Play</h3>
          <p className="text-stone-600">{bestSeason}</p>
          <p className="text-stone-500 text-sm mt-1">Mallorca enjoys over 300 days of sunshine per year.</p>
        </div>
      </div>
    </section>
  );
}

function SidebarSection({ course, seo }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm sticky top-24" data-testid="booking-card">
        <h3 className="font-heading text-xl text-stone-900 mb-2">Book Your Tee Time</h3>
        <p className="text-stone-500 text-sm mb-4">Secure the best rates for {course.name}.</p>
        {course.price_from && (
          <div className="bg-stone-50 rounded-xl p-4 mb-4">
            <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Green Fee From</p>
            <p className="text-3xl font-bold text-stone-900">&euro;{course.price_from}</p>
            <p className="text-xs text-stone-500 mt-1">per person</p>
          </div>
        )}
        <a href={course.booking_url} target="_blank" rel="noopener noreferrer" className="w-full inline-flex items-center justify-center gap-2 bg-stone-900 text-white px-6 py-3.5 rounded-full font-semibold hover:bg-stone-800 transition-all shadow-md" data-testid="book-tee-time-btn">
          Book Tee Time<ExternalLink className="w-4 h-4" />
        </a>
        {course.phone && (
          <a href={'tel:' + course.phone} className="w-full mt-3 inline-flex items-center justify-center gap-2 bg-white text-stone-700 border border-stone-200 px-6 py-3 rounded-full font-medium hover:bg-stone-50 transition-all text-sm">
            Call Pro Shop: {course.phone}
          </a>
        )}
      </div>
      <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm" data-testid="location-card">
        <h3 className="font-heading text-lg text-stone-900 mb-3">Location</h3>
        <div className="flex items-start gap-3 mb-4">
          <Navigation className="w-5 h-5 text-stone-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-stone-700 font-medium">{course.location}</p>
            {course.full_address && <p className="text-stone-500 text-sm mt-1">{course.full_address}</p>}
            {seo.nearbyArea && <p className="text-stone-400 text-xs mt-1">Near: {seo.nearbyArea}</p>}
          </div>
        </div>
        <a href={'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(course.full_address || course.name + ', ' + course.location)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 transition-colors">
          <MapPin className="w-4 h-4" />Open in Google Maps<ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

function RelatedSection({ courses }) {
  if (!courses || courses.length === 0) return null;
  return (
    <section className="mt-16" data-testid="related-courses">
      <h2 className="font-heading text-2xl md:text-3xl text-stone-900 mb-8">More Golf Courses in Mallorca</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses.map(rc => (
          <Link key={rc.id} to={'/golf-courses/' + rc.id} className="group bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-md transition-all" data-testid={'related-course-' + rc.id}>
            <div className="h-44 overflow-hidden">
              <img src={rc.image} alt={rc.name} loading="lazy" className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-4">
              <p className="text-xs text-stone-400 flex items-center gap-1 mb-1"><MapPin className="w-3 h-3" />{rc.location}</p>
              <h3 className="font-heading text-lg text-stone-900 group-hover:text-stone-700 transition-colors">{rc.name}</h3>
              <div className="flex items-center gap-3 mt-2 text-sm text-stone-500">
                <span>{rc.holes} Holes</span>
                <span>|</span>
                <span>Par {rc.par}</span>
                {rc.price_from && <><span>|</span><span>From &euro;{rc.price_from}</span></>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
