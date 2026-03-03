export const config = {
  matcher: '/(.*)',
}

export default function middleware(request: Request) {
  const auth = request.headers.get('authorization')

  if (auth) {
    const [scheme, encoded] = auth.split(' ')
    if (scheme === 'Basic' && encoded) {
      const decoded = atob(encoded)
      const [username, ...rest] = decoded.split(':')
      const password = rest.join(':')
      if (
        username === process.env.BASIC_AUTH_USER &&
        password === process.env.BASIC_AUTH_PASSWORD
      ) {
        return
      }
    }
  }

  return new Response('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Spray Wall Tracker"',
    },
  })
}
