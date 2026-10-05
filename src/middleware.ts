import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Only create Supabase client if accessing protected routes
  const pathname = request.nextUrl.pathname

  if (!pathname.startsWith('/admin') && !pathname.startsWith('/profile')) {
    return NextResponse.next()
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          request.cookies.set({ name: name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Check if user has admin or editor role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'super_admin', 'editor'].includes(profile.role)) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // TEMPORARILY DISABLED: Protect profile route
  // if (pathname.startsWith('/profile')) {
  //   if (!user) {
  //     return NextResponse.redirect(new URL('/auth/login', request.url))
  //   }
  // }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
