import { NextResponse } from 'next/server';

import API from 'services/api';

const TABS = ['overview', 'documentation', 'observations', 'fmus'];

// Numeric operator urls (old emails, PDFs, bookmarks) redirect to the slug url in one hop,
// instead of a full _app render whose only job is to look up the slug.
export async function proxy(request) {
  const url = request.nextUrl.clone();
  const [, , id, ...rest] = url.pathname.split('/');
  const tab = rest.length === 1 && TABS.includes(rest[0]) ? rest[0] : 'overview';

  try {
    const { data } = await API.get(`operators/${id}`, { 'fields[operators]': 'slug' }, { auth: false });
    url.pathname = `/operators/${data.slug}/${tab}`;
    return NextResponse.redirect(url, 301);
  } catch {
    // not found, or only visible to a logged-in user: the page's getInitialProps decides
    if (url.pathname === `/operators/${id}/${tab}`) return NextResponse.next();
    url.pathname = `/operators/${id}/${tab}`;
    return NextResponse.redirect(url, 308);
  }
}

export const config = {
  matcher: '/operators/:id(\\d+)/:path*',
};
