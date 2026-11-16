import {NextResponse,type NextRequest} from 'next/server';
export function middleware(request:NextRequest){const requestHeaders=new Headers(request.headers);const pathname=new URL(request.url).pathname;requestHeaders.set('x-rdmeca-lang',pathname==='/en'||pathname.startsWith('/en/')?'en':'fr');return NextResponse.next({request:{headers:requestHeaders}})}
