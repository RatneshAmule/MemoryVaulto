import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await params;
    const { searchParams } = new URL(request.url);
    const accessorId = searchParams.get('accessorId');
    const method = searchParams.get('method') || 'search';
    const reason = searchParams.get('reason') || '';

    const patient = await db.patient.findUnique({
      where: { id: patientId },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        allergies: true,
        medications: true,
        conditions: true,
        surgeries: true,
        implants: true,
        vaccinations: true,
        emergencyContacts: { orderBy: { priority: 'asc' } },
        consentProxies: { orderBy: { priority: 'asc' } },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Check if there's an active (non-expired) access log for this accessor+patient
    let accessLog = null;
    const now = new Date();

    if (accessorId) {
      const existingAccess = await db.accessLog.findFirst({
        where: {
          accessorId,
          patientId,
          accessType: 'emergency',
          expiresAt: { gt: now },
        },
        orderBy: { timestamp: 'desc' },
      });

      if (existingAccess) {
        // Active access exists — reuse it
        accessLog = existingAccess;
      } else {
        // No active access — check if there's an expired one
        const expiredAccess = await db.accessLog.findFirst({
          where: {
            accessorId,
            patientId,
            accessType: 'emergency',
            expiresAt: { lte: now },
          },
          orderBy: { timestamp: 'desc' },
        });

        // Create new access log
        const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
        accessLog = await db.accessLog.create({
          data: {
            accessorId,
            patientId,
            accessType: 'emergency',
            accessMethod: method,
            reason,
            dataViewed: JSON.stringify(['profile', 'allergies', 'medications', 'conditions', 'surgeries', 'implants', 'vaccinations', 'emergencyContacts', 'consentProxies']),
            expiresAt,
          },
        });
      }
    }

    return NextResponse.json({ patient, accessLog });
  } catch (error) {
    console.error('Emergency access error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
