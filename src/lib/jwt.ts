import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production-use-strong-secret';
const JWT_EXPIRES_IN = '8h';
const JWT_ISSUER = 'memory-vault';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  hospital?: string | null;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: JWT_ISSUER,
  });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
    }) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
}

export function extractToken(request: Request): string | null {
  // 1. Authorization header: Bearer <token>
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  // 2. Cookie: token=<token>
  const cookieHeader = request.headers.get('cookie') || '';
  const tokenMatch = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
  if (tokenMatch) {
    return tokenMatch[1];
  }

  return null;
}
