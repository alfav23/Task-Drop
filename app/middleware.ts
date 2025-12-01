import { NextResponse } from 'next/server';

export function middleware(request: any) {
  if (!request.cookies.has('authToken')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/'], // Apply middleware to these paths
};