import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const caregiverPasses = await db.caregiverPass.findMany({
      where: { patientId: id, isActive: true },
      orderBy: { issuedAt: 'desc' },
    });
    return NextResponse.json({ caregiverPasses });
  } catch (error) {
    console.error('Get caregiver passes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { caregiverName, relationship, accessLevel, expiresAt } = await request.json();

    if (!caregiverName || !relationship || !accessLevel) {
      return NextResponse.json({ error: 'caregiverName, relationship, and accessLevel are required' }, { status: 400 });
    }

    const qrCode = `CGP-${uuidv4().slice(0, 8).toUpperCase()}`;
    const expires = expiresAt ? new Date(expiresAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const pass = await db.caregiverPass.create({
      data: {
        patientId: id,
        caregiverName,
        relationship,
        accessLevel: parseInt(accessLevel),
        qrCode,
        expiresAt: expires,
      },
    });

    return NextResponse.json({ caregiverPass: pass }, { status: 201 });
  } catch (error) {
    console.error('Add caregiver pass error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
