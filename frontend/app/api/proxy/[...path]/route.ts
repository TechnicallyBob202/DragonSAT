import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001/api';

async function handler(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const pathStr = params.path.join('/');
  const { searchParams } = new URL(request.url);
  const qs = searchParams.toString();
  const backendUrl = `${BACKEND_URL}/${pathStr}${qs ? `?${qs}` : ''}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const auth = request.headers.get('Authorization');
  if (auth) headers['Authorization'] = auth;

  const init: RequestInit = { method: request.method, headers };

  if (!['GET', 'HEAD', 'DELETE'].includes(request.method)) {
    init.body = await request.text();
  }

  try {
    const res = await fetch(backendUrl, init);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('[proxy] backend unreachable:', err);
    return NextResponse.json({ error: 'Backend unreachable' }, { status: 502 });
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE, handler as OPTIONS };
