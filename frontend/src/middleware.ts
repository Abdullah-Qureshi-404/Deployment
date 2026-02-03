import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
 
const protectedRoutes = ["/dashboard"];
const publicRoutes = ["/login", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get token from cookies
  const token = request.cookies.get('auth_token')?.value;
  
  const isAuthenticated = !!token; // Just check if token exists
 
  // If user is logged in and tries to access login/verify pages
  if (isAuthenticated && publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
 
  // If user is not logged in and tries to access protected routes
  if (!isAuthenticated && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
 
  return NextResponse.next();
}
 
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
 
