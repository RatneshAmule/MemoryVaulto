import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/jwt';
import { validateBody, loginSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateBody(loginSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    const { email, password } = validation.data;

    // Rate limiting: basic in-memory check (use Redis in production)
    const now = Date.now();
    if (!globalThis.__loginAttempts) globalThis.__loginAttempts = new Map();
    const attempts = globalThis.__loginAttempts.get(email) || { count: 0, firstAttempt: now };
    if (attempts.count >= 5 && now - attempts.firstAttempt < 15 * 60 * 1000) {
      return NextResponse.json({ error: 'Too many login attempts. Try again later.' }, { status: 429 });
    }

    const user = await db.user.findUnique({
      where: { email },
      include: { patient: { select: { id: true } } },
    });

    if (!user) {
      // Increment failed attempts
      attempts.count++;
      attempts.firstAttempt = attempts.firstAttempt || now;
      globalThis.__loginAttempts.set(email, attempts);
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      attempts.count++;
      attempts.firstAttempt = attempts.firstAttempt || now;
      globalThis.__loginAttempts.set(email, attempts);
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Clear failed attempts on success
    globalThis.__loginAttempts.delete(email);

    // Issue JWT token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      hospital: user.hospital,
    });

    const { password: _password, ...userWithoutPassword } = user;
    void _password;

    return NextResponse.json({
      user: {
        ...userWithoutPassword,
        patientId: user.patient?.id || null,
      },
      token,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Type declaration for rate limiting
declare global {
  var __loginAttempts: Map<string, { count: number; firstAttempt: number }>;
}
