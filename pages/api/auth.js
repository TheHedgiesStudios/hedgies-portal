import { serialize, parse } from 'cookie'

const COOKIE_NAME = 'hedgies_session'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export default function handler(req, res) {
  const method = req.method

  if (method === 'POST') {
    const { password } = req.body
    const KEY = process.env.PORTAL_PASSWORD || 'hedgies-default'

    if (password && password === KEY) {
      const cookie = serialize(COOKIE_NAME, '1', {
        path: '/',
        httpOnly: true,
        maxAge: COOKIE_MAX_AGE,
        sameSite: 'lax'
      })
      res.setHeader('Set-Cookie', cookie)
      return res.status(200).json({ ok: true })
    } else {
      return res.status(401).json({ ok: false, message: 'Invalid password' })
    }
  }

  if (method === 'GET') {
    const cookies = parse(req.headers.cookie || '')
    if (cookies[COOKIE_NAME]) return res.status(200).json({ ok: true })
    return res.status(401).json({ ok: false })
  }

  res.status(405).end()
}
