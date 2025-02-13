import API from 'services/api';
import { LOCALES } from 'constants/locales';

const URL = process.env.APP_URL;

function generateSiteMap(operators, countries) {
  const url = (path) => {
    return `
    <url>
      <loc>${URL}${path}</loc>
      <xhtml:link rel="alternate" hreflang="en" href="${URL}${path}" />
      ${LOCALES.filter(l => l.code !== 'en').map(({ code }) => (
        `<xhtml:link rel="alternate" hreflang="${code}" href="${URL}/${code}${path}" />`
      )).join("")}
    </url>
    `
  };
  const paths = [
    '',
    '/signup',
    '/database',
    '/observations',
    '/about',
    '/newsletter',
    '/terms',
    '/help/overview',
    '/help/how-otp-works',
    '/help/legislation-and-regulations',
    '/help/faqs',
    '/help/tutorials',
    '/operators',
    '/operator/new',
    ...operators.flatMap(({ slug }) => [
      `/operators/${slug}/overview`,
      `/operators/${slug}/documentation`,
      `/operators/${slug}/observations`,
      `/operators/${slug}/fmus`,
    ]),
    ...countries.flatMap(({ id }) => [
      `/countries/${id}/overview`,
      `/countries/${id}/documentation`
    ])
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset
     xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
     xmlns:xhtml="http://www.w3.org/1999/xhtml"
   >
     ${paths.map((path) => url(path)).join("")}
   </urlset>
 `;
}

export async function getServerSideProps({ res }) {
  const { data: operators } = await API
    .get('operators', { locale: 'en', 'page[size]': 3000, 'fields[operators]': 'slug' })

  let countries = [];
  if (process.env.FEATURE_COUNTRY_PAGES) {
    countries = await API.get('countries', {
      locale: 'en',
      include: 'required-gov-documents',
      'fields[country]': 'id',
      'fields[required-gov-documents]': 'id',
      'page[size]': 2000
    })
      .then(({ data }) => data.filter(c => (c['required-gov-documents'] || []).length));
  }

  const sitemap = generateSiteMap(operators, countries);

  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default function SiteMap() {}
