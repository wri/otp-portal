import Jsona from 'jsona';
import API from 'services/api';

const JSONA = new Jsona();
const URL = process.env.APP_URL;

function generateSiteMap(operators, countries) {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>${URL}</loc>
     </url>
     <url>
       <loc>${URL}/signup</loc>
     </url>

     <url>
       <loc>${URL}/database</loc>
     </url>
     <url>
       <loc>${URL}/observations</loc>
     </url>
     <url>
       <loc>${URL}/about</loc>
     </url>
     <url>
       <loc>${URL}/newsletter</loc>
     </url>
     <url>
       <loc>${URL}/terms</loc>
     </url>
     <url>
       <loc>${URL}/help/overview</loc>
     </url>
     <url>
       <loc>${URL}/help/how-otp-works</loc>
     </url>
     <url>
       <loc>${URL}/help/legislation-and-regulations</loc>
     </url>
     <url>
       <loc>${URL}/help/faqs</loc>
     </url>
     <url>
       <loc>${URL}/help/tutorials</loc>
     </url>
     <url>
       <loc>${URL}/operators</loc>
     </url>
     <url>
       <loc>${URL}/operators/new</loc>
     </url>
     ${operators.map(({ slug }) => {
       return `
         <url>
           <loc>${URL}/operators/${slug}/overview</loc>
         </url>
         <url>
           <loc>${URL}/operators/${slug}/documentation</loc>
         </url>
         <url>
           <loc>${URL}/operators/${slug}/observations</loc>
         </url>
         <url>
           <loc>${URL}/operators/${slug}/fmus</loc>
         </url>
       `;}).join("")}
     ${countries.map(({ id }) => {
       return `
         <url>
           <loc>${URL}/countries/${id}</loc>
         </url>
       `;
     }).join("")}
   </urlset>
 `;
}

export async function getServerSideProps({ res }) {
  const operators = await API
    .get('operators', { locale: 'en', 'page[size]': 3000, 'fields[operator]': 'slug' })
    .then((data) => JSONA.deserialize(data));

  let countries = [];
  if (process.env.FEATURE_COUNTRY_PAGES) {
    countries = await API.get('countries', {
      locale: 'en',
      include: 'required-gov-documents',
      'fields[country]': 'id',
      'fields[required-gov-documents]': 'id',
      'page[size]': 2000
    })
      .then((data) => JSONA.deserialize(data))
      .then((data) => data.filter(c => (c['required-gov-documents'] || []).length));
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
