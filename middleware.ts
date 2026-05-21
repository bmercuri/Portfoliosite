import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PASSWORD = '2026Portfolio'
const COOKIE_NAME = 'portfolio-auth'

export function middleware(request: NextRequest) {
  const cookie = request.cookies.get(COOKIE_NAME)
  if (cookie?.value === PASSWORD) return NextResponse.next()

  const { searchParams } = new URL(request.url)
  if (searchParams.get('password') === PASSWORD) {
    const response = NextResponse.redirect(new URL('/', request.url))
    response.cookies.set(COOKIE_NAME, PASSWORD, { httpOnly: true, maxAge: 60 * 60 * 24 * 7 })
    return response
  }

  return new NextResponse(`
    <html><body style="background:#111;display:flex;align-items:center;justify-content:center;height:100vh;font-family:monospace;">
    <form style="color:#d2ff4a;display:flex;flex-direction:column;gap:12px;text-align:center;">
      <p style="margin:0;font-size:14px;letter-spacing:.1em;">ENTER PASSWORD</p>
      <input name="password" type="password" autofocus
        style="background:transparent;border:1px solid #d2ff4a;color:#d2ff4a;padding:8px 12px;outline:none;text-align:center;" />
      <button type="submit"
        style="background:#d2ff4a;color:#111;border:none;padding:8px;cursor:pointer;font-family:monospace;">→</button>
    </form>
    </body></html>
  `, { status: 401, headers: { 'Content-Type': 'text/html' } })
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
}