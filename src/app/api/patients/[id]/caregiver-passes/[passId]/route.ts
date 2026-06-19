import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; passId: string }> }
) {
  try {
    const { passId } = await params;
    const body = await request.json();

    const pass = await db.caregiverPass.update({
      where: { id: passId },
      data: {
        caregiverName: body.caregiverName,
        relationship: body.relationship,
        accessLevel: body.accessLevel !== undefined ? parseInt(body.accessLevel) : undefined,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
        isActive: body.isActive,
        usedAt: body.usedAt ? new Date(body.usedAt) : undefined,
      },
    });

    return NextResponse.json({ caregiverPass: pass });
  } catch (error) {
    console.error('Update caregiver pass error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; passId: string }> }
) {
  try {
    const { passId } = await params;
    await db.caregiverPass.update({
      where: { id: passId },
      data: { isActive: false },
    });
    return NextResponse.json({ message: 'Caregiver pass deactivated' });
  } catch (error) {
    console.error('Delete caregiver pass error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
