import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { protocol, origin, path, method = 'GET', headers = {}, body } = await req.json()

    if (!protocol || !origin || !path) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const url = `${protocol}://${origin}${path}`

    const upstream = await fetch(url, {
      method,
      headers: headers as Record<string, string>,
      body: method === 'GET' || method === 'HEAD' ? undefined : JSON.stringify(body ?? {}),
      // Important for Neynar CORS
      cache: 'no-store',
    })

    const text = await upstream.text()
    const contentType = upstream.headers.get('content-type') || 'application/json'

    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        'content-type': contentType,
        'cache-control': 'no-store',
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Proxy error' }, { status: 500 })
  }
}


