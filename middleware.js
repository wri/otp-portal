import { NextResponse } from 'next/server'

export function middleware(req) {
  const locale = req.cookies.get('NEXT_LOCALE') || 'en';

  if (req.nextUrl.pathname.startsWith('/reset-password') && locale !== 'en' && req.nextUrl.locale !== locale) {
    return NextResponse.redirect(
      new URL(`/${locale}${req.nextUrl.pathname}${req.nextUrl.search}`, req.url)
    )
  }
}
