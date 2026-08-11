/**
 * Assemble index.html from partials and apply content fixes
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const bodyPath = path.join(ROOT, 'partials', 'body.html');
const outPath = path.join(ROOT, 'index.html');

const SITE_URL = 'https://www.support.com.sa';
const TITLE = 'مساندة | حلول أعمال متكاملة لنمو مستدام';
const DESCRIPTION =
  'مساندة شركة سعودية لخدمات الأعمال المتكاملة: التشغيل والصيانة، إدارة المرافق، تنسيق المواقع، توفير القوى العاملة للمشروعات، وخدمات الدعم المؤسسي.';
const KEYWORDS =
  'مساندة, خدمات الأعمال السعودية, التشغيل والصيانة, إدارة المرافق, إدارة التشغيل, توفير القوى العاملة, القوى العاملة للمشروعات, خدمات الشركات السعودية';

/* Proper social icon markup (LinkedIn, X, Instagram) */
const SOCIAL_HTML = `<div class="social">
          <a href="https://www.linkedin.com/company/mosanada" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a-2.067 2.067 0 1 1 0-4.134 2.067 2.067 0 0 1 0 4.134zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
          <a href="https://x.com/mosanada" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href="https://www.instagram.com/mosanada" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
          </a>
        </div>`;

const socialPattern =
  /<div class="social">[\s\S]*?<\/div>\s*(?=<\/div>\s*<div><h4>)/g;

let body = fs.readFileSync(bodyPath, 'utf8');

/* Apply social icons fix once (skip if already updated) */
if (!body.includes('linkedin.com/company/mosanada')) {
  body = body.replace(socialPattern, SOCIAL_HTML + '\n      ');
  fs.writeFileSync(bodyPath, body, 'utf8');
}

/* Inject section comments for index.html output only */
let bodyOut = body;
const sectionComments = [
  ['<section class="hero"', '<!-- ===== Hero ===== -->\n<section class="hero"'],
  ['<section class="section" id="about-ar"', '<!-- ===== About (AR) ===== -->\n<section class="section" id="about-ar"'],
  ['<section class="section" id="services-ar"', '<!-- ===== Services (AR) ===== -->\n<section class="section" id="services-ar"'],
  ['<section class="section section--blue" id="om-ar"', '<!-- ===== Operations & Maintenance (AR) ===== -->\n<section class="section section--blue" id="om-ar"'],
  ['<section class="section pkg" id="packages-ar"', '<!-- ===== Packages (AR) ===== -->\n<section class="section pkg" id="packages-ar"'],
  ['<section class="section section--navy stats" id="stats-ar"', '<!-- ===== Stats (AR) ===== -->\n<section class="section section--navy stats" id="stats-ar"'],
  ['<section class="section section--tint" id="tech-ar"', '<!-- ===== Technology (AR) ===== -->\n<section class="section section--tint" id="tech-ar"'],
  ['<section class="section" id="sectors-ar"', '<!-- ===== Sectors (AR) ===== -->\n<section class="section" id="sectors-ar"'],
  ['<section class="section" id="partners-ar"', '<!-- ===== Partners (AR) ===== -->\n<section class="section" id="partners-ar"'],
  ['<section class="section section--tint" id="projects-ar"', '<!-- ===== Projects (AR) ===== -->\n<section class="section section--tint" id="projects-ar"'],
  ['<section class="section section--blue" id="contact-ar"', '<!-- ===== Contact (AR) ===== -->\n<section class="section section--blue" id="contact-ar"'],
  ['<footer class="ftr">', '<!-- ===== Footer (AR) ===== -->\n<footer class="ftr">'],
  ['<div class="site" data-lang="en"', '<!-- ===== English Site ===== -->\n<div class="site" data-lang="en"'],
];
sectionComments.forEach(([from, to]) => {
  bodyOut = bodyOut.replace(from, to);
});

/* JSON-LD — inline defaults (no build-meta.json required in CI) */
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'مساندة',
  alternateName: 'Mosanada',
  foundingDate: '2010',
  url: SITE_URL,
  email: 'admin@support.com.sa',
  telephone: '+966112450657',
  address: { '@type': 'PostalAddress', addressLocality: 'Riyadh', addressCountry: 'SA' },
  description: DESCRIPTION,
};

const enhancedJsonLd = [
  jsonLd,
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'مساندة',
    alternateName: 'Mosanada',
    url: SITE_URL,
    inLanguage: ['ar', 'en'],
    publisher: { '@type': 'Organization', name: 'مساندة', url: SITE_URL },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'مساندة',
    image: `${SITE_URL}/assets/images/logo.png`,
    url: SITE_URL,
    telephone: '+966112450657',
    email: 'admin@support.com.sa',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Riyadh',
      addressCountry: 'SA',
    },
    foundingDate: '2010',
    areaServed: 'SA',
    serviceType: [
      'إدارة التشغيل',
      'إدارة المرافق',
      'تنسيق المواقع',
      'توفير القوى العاملة',
      'خدمات دعم الأعمال',
    ],
  },
];

const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${TITLE}</title>
  <meta name="description" content="${DESCRIPTION}">
  <meta name="keywords" content="${KEYWORDS}">
  <meta name="author" content="مساندة">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${SITE_URL}/">

  <!-- Theme -->
  <meta name="theme-color" content="#052A55">
  <meta name="color-scheme" content="light">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:locale" content="ar_SA">
  <meta property="og:locale:alternate" content="en_US">
  <meta property="og:site_name" content="مساندة">
  <meta property="og:title" content="${TITLE}">
  <meta property="og:description" content="${DESCRIPTION}">
  <meta property="og:url" content="${SITE_URL}/">
  <meta property="og:image" content="${SITE_URL}/assets/images/logo.png">
  <meta property="og:image:alt" content="شعار مساندة — حلول أعمال متكاملة">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${TITLE}">
  <meta name="twitter:description" content="${DESCRIPTION}">
  <meta name="twitter:image" content="${SITE_URL}/assets/images/logo.png">

  <!-- Favicons -->
  <link rel="icon" type="image/png" sizes="32x32" href="assets/icons/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="assets/icons/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="assets/icons/apple-touch-icon.png">
  <link rel="icon" type="image/png" href="assets/images/favicon.png">

  <!-- Stylesheets -->
  <link rel="stylesheet" href="css/main.css">
  <link rel="stylesheet" href="css/overrides.css">
  <link rel="stylesheet" href="css/navigation.css">

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">${JSON.stringify(enhancedJsonLd)}</script>
</head>
<body>
${bodyOut}
<script src="js/main.js" defer></script>
<script src="js/cart.js" defer></script>
</body>
</html>
`;

fs.writeFileSync(outPath, html, 'utf8');
console.log('Built index.html (' + html.length + ' bytes)');
