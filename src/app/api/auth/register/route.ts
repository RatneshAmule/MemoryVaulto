import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/jwt';
import { enforceAccess } from '@/lib/auth-middleware';

// Allowed roles for self-registration (staff roles require admin approval)
const SELF_REGISTRATION_ROLES = ['patient'];
const ALL_VALID_ROLES = ['patient', 'doctor', 'paramedic', 'admin', 'nurse', 'specialist'];
const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role, hospital, badgeId } = await request.json();

    // Input validation
    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: 'Email, password, name, and role are required' }, { status: 400 });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Password complexity
    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` }, { status: 400 });
    }

    // Validate role
    if (!ALL_VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 });
    }

    // Non-patient roles require admin authentication
    if (!SELF_REGISTRATION_ROLES.includes(role)) {
      const authResult = await enforceAccess(['admin'], request);
      if (!authResult.allowed) {
        return NextResponse.json({ error: 'Only admins can create staff accounts' }, { status: 403 });
      }
    }

    // Name length validation
    if (name.length > 200 || name.length < 1) {
      return NextResponse.json({ error: 'Name must be between 1 and 200 characters' }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const salt = await bcrypt.genSalt(12); // Increased from 10 to 12 rounds
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        hospital: hospital || null,
        badgeId: badgeId || null,
      },
    });

    // If patient role, create empty patient record
    let patient: Awaited<ReturnType<typeof db.patient.create>> | null = null;
    if (role === 'patient') {
      patient = await db.patient.create({
        data: {
          userId: user.id,
          dateOfBirth: '',
          gender: '',
          bloodType: '',
        },
      });
    }

    // Issue JWT token for the new user
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
        patientId: patient?.id || null,
      },
      token,
      message: 'Registration successful',
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
