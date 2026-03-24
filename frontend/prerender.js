#!/usr/bin/env node
/**
 * SEO Pre-rendering for golfinmallorca.com
 * 
 * Creates route-specific index.html files from the main build,
 * each with correct meta tags (title, description, canonical, OG).
 * The React app JS is preserved so the page fully renders.
 * 
 * Run after: craco build
 */

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://golfinmallorca.com';
const BUILD_DIR = path.join(__dirname, 'build');
const MAIN_HTML_PATH = path.join(BUILD_DIR, 'index.html');

// Read the main build index.html
let mainHTML;
try {
  mainHTML = fs.readFileSync(MAIN_HTML_PATH, 'utf8');
} catch (e) {
  console.error('Build index.html not found. Run "craco build" first.');
  process.exit(1);
}

// All pages to pre-render with SEO metadata
const pages = [
  // Golf Courses
  ...['golf-alcanada', 'golf-son-gual', 'pula-golf-resort', 'son-vida-golf',
    'son-muntaner-golf', 'son-quint-golf', 'son-antem-east', 'son-antem-west',
    'capdepera-golf', 'golf-santa-ponsa', 'golf-son-servera', 'vall-dor-golf',
    'real-golf-bendinat', 'golf-ibiza', 'roca-llisa-ibiza', 'golf-son-parc-menorca'
  ].map(id => {
    const name = id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return {
      route: `/golf-courses/${id}`,
      title: `${name} | Golf in Mallorca - Book Tee Times`,
      desc: `Book tee times at ${name} in Mallorca. Course details, green fees, reviews. Expert golf concierge since 2003.`,
      type: 'place'
    };
  }),
  // Blog Posts
  ...['best-time-golf-mallorca', 'top-5-courses-beginners', 'golf-and-gastronomy-mallorca',
    'championship-courses-mallorca', 'ultimate-golf-guide-mallorca',
    'stay-and-play-golf-packages-mallorca', 'art-culture-mallorca-golfers',
    'culinary-mallorca-food-guide', 'cheap-golf-mallorca-budget', 'golf-near-palma-courses'
  ].map(slug => {
    const name = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return {
      route: `/blog/${slug}`,
      title: `${name} | golfinmallorca.com`,
      desc: `Read about ${name.toLowerCase()} on golfinmallorca.com. Expert golf travel tips and guides for Mallorca.`,
      type: 'article'
    };
  }),
  // Static Pages
  { route: '/golf-holidays-mallorca', title: 'Golf Holidays in Mallorca | Packages, Deals & Stay and Play', desc: 'Plan your perfect golf holiday in Mallorca. Stay and play packages, luxury golf resort deals, weekend breaks, group trips. Expert concierge since 2003.', type: 'website' },
  { route: '/book-tee-times', title: 'Book Tee Times in Mallorca | 16 Courses | Instant Confirmation', desc: 'Book tee times at 16 golf courses in Mallorca with instant confirmation. Green fees from EUR47. Discount tee times and group bookings.', type: 'website' },
  { route: '/terms', title: 'Terms of Service | golfinmallorca.com', desc: 'Terms of service for golfinmallorca.com. Booking conditions, cancellation policies, payment terms.', type: 'website' },
  { route: '/privacy', title: 'Privacy Policy | golfinmallorca.com', desc: 'Privacy policy for golfinmallorca.com. How we collect, use, and protect your personal data under GDPR.', type: 'website' }
];

function escapeHTML(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function createRouteHTML(page) {
  let html = mainHTML;
  const url = `${SITE_URL}${page.route}`;
  const safeTitle = escapeHTML(page.title);
  const safeDesc = escapeHTML(page.desc);

  // Replace title
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${safeTitle}</title>`);

  // Replace canonical
  html = html.replace(
    /(<link id="main-canonical" rel="canonical" href=")[^"]*(")/,
    `$1${url}$2`
  );

  // Replace meta description
  html = html.replace(
    /(<meta name="description" content=")[^"]*(")/,
    `$1${safeDesc}$2`
  );

  // Replace OG tags
  html = html.replace(/(<meta property="og:title" content=")[^"]*(")/,`$1${safeTitle}$2`);
  html = html.replace(/(<meta property="og:description" content=")[^"]*(")/,`$1${safeDesc}$2`);
  html = html.replace(/(<meta property="og:url" content=")[^"]*(")/,`$1${url}$2`);
  html = html.replace(/(<meta property="og:type" content=")[^"]*(")/,`$1${page.type}$2`);

  // Replace Twitter tags
  html = html.replace(/(<meta name="twitter:title" content=")[^"]*(")/,`$1${safeTitle}$2`);
  html = html.replace(/(<meta name="twitter:description" content=")[^"]*(")/,`$1${safeDesc}$2`);

  return html;
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

console.log(`Pre-rendering ${pages.length} pages with SEO metadata...`);

let count = 0;
pages.forEach(page => {
  const routeDir = path.join(BUILD_DIR, page.route.substring(1));
  ensureDir(routeDir);
  const html = createRouteHTML(page);
  fs.writeFileSync(path.join(routeDir, 'index.html'), html);
  count++;
});

console.log(`Done! ${count} route-specific index.html files created.`);
console.log('Each page has correct: title, description, canonical, OG tags, Twitter cards.');
