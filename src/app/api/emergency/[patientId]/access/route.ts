import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await params;
    const { accessorId, accessType, accessMethod, accessTier, reason, dataViewed, overrideReason } = await request.json();

    if (!accessorId) {
      return NextResponse.json({ error: 'accessorId is required' }, { status: 400 });
    }

    // Verify patient exists
    const patient = await db.patient.findUnique({
      where: { id: patientId },
      include: {
        user: { select: { name: true } },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Verify accessor exists
    const accessor = await db.user.findUnique({
      where: { id: accessorId },
      select: { id: true, name: true, role: true, hospital: true },
    });

    if (!accessor) {
      return NextResponse.json({ error: 'Accessor not found' }, { status: 401 });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours default

    const accessLog = await db.accessLog.create({
      data: {
        accessorId,
        patientId,
        accessType: accessType || 'emergency',
        accessMethod: accessMethod || 'search',
        accessTier: accessTier || null,
        reason: reason || null,
        dataViewed: dataViewed ? JSON.stringify(dataViewed) : JSON.stringify(['profile', 'allergies', 'medications', 'conditions']),
        overrideReason: overrideReason || null,
        expiresAt,
      },
      include: {
        accessor: { select: { id: true, name: true, role: true, hospital: true } },
      },
    });

    // Also create a notification for the patient's user
    if (patient.userId) {
      await db.notification.create({
        data: {
          userId: patient.userId,
          type: 'emergency-access',
          title: 'Emergency Vault Access',
          message: `${accessor.name} (${accessor.role}) accessed your medical vault via ${accessMethod || 'search'}${accessor.hospital ? ` at ${accessor.hospital}` : ''}. Reason: ${reason || 'Emergency access'}`,
          priority: accessType === 'break-glass' ? 'urgent' : 'high',
          actionUrl: `/patient/access-logs`,
        },
      });
    }

    return NextResponse.json({
      accessLog,
      expiresAt,
      message: 'Emergency access logged successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Emergency access log error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
