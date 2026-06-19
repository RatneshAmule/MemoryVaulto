import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractToken, JWTPayload } from './jwt';
import { db } from '@/lib/db';

interface AccessResult {
  allowed: boolean;
  user?: {
    id: string;
    name: string;
    role: string;
    hospital?: string | null;
  };
  error?: string;
}

/**
 * SECURE: Enforce role-based access using JWT verification.
 * Replaces the old insecure x-user-id header trust model.
 */
export async function enforceAccess(
  requiredRoles: string[],
  request: NextRequest
): Promise<AccessResult> {
  try {
    const token = extractToken(request);

    if (!token) {
      return { allowed: false, error: 'Authentication required' };
    }

    const payload = verifyToken(token);

    if (!payload) {
      return { allowed: false, error: 'Invalid or expired token' };
    }

    // Verify user still exists and get fresh role (prevents deleted user access)
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, role: true, hospital: true },
    });

    if (!user) {
      return { allowed: false, error: 'User not found' };
    }

    // Admin can access everything
    if (user.role === 'admin' || requiredRoles.includes(user.role)) {
      return { allowed: true, user };
    }

    return { allowed: false, error: 'Insufficient permissions', user };
  } catch {
    return { allowed: false, error: 'Authentication error' };
  }
}

/**
 * SECURE: Require authentication (any role) using JWT.
 */
export async function requireAuth(
  request: NextRequest
): Promise<AccessResult> {
  return enforceAccess(['patient', 'doctor', 'paramedic', 'admin', 'nurse', 'specialist'], request);
}

/**
 * SECURE: Check if a user owns a patient record.
 * Patients can only access their own record. Staff can access any.
 */
export async function verifyPatientAccess(
  request: NextRequest,
  patientId: string
): Promise<AccessResult> {
  const authResult = await requireAuth(request);

  if (!authResult.allowed || !authResult.user) {
    return authResult;
  }

  // Admin, doctors, nurses, paramedics, specialists can access any patient
  if (['admin', 'doctor', 'nurse', 'paramedic', 'specialist'].includes(authResult.user.role)) {
    return { allowed: true, user: authResult.user };
  }

  // Patients can only access their own record
  const patient = await db.patient.findUnique({
    where: { id: patientId },
    select: { userId: true },
  });

  if (!patient) {
    return { allowed: false, error: 'Patient not found' };
  }

  if (patient.userId !== authResult.user.id) {
    return { allowed: false, error: 'Access denied: not your record' };
  }

  return { allowed: true, user: authResult.user };
}

// Helper to return a 403 response
export function forbiddenResponse(error: string = 'Access denied') {
  return NextResponse.json({ error }, { status: 403 });
}

// Helper to return a 401 response
export function unauthorizedResponse(error: string = 'Authentication required') {
  return NextResponse.json({ error }, { status: 401 });
}
