import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const accessorId = searchParams.get('accessorId');
    const accessType = searchParams.get('accessType');
    const limit = parseInt(searchParams.get('limit') || '100');

    const where: Record<string, string> = {};
    if (patientId) where.patientId = patientId;
    if (accessorId) where.accessorId = accessorId;
    if (accessType) where.accessType = accessType;

    const logs = await db.accessLog.findMany({
      where,
      include: {
        accessor: { select: { id: true, name: true, role: true, hospital: true } },
        patient: {
          include: { user: { select: { id: true, name: true } } },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    // Stats
    const totalLogs = await db.accessLog.count({ where });
    const emergencyAccessCount = await db.accessLog.count({
      where: { ...where, accessType: 'emergency' },
    });
    const breakGlassCount = await db.accessLog.count({
      where: { ...where, accessType: 'break-glass' },
    });
    const activeEmergencyAccess = await db.accessLog.count({
      where: {
        ...where,
        accessType: 'emergency',
        expiresAt: { gt: new Date() },
      },
    });

    return NextResponse.json({
      logs,
      stats: {
        total: totalLogs,
        emergencyAccess: emergencyAccessCount,
        breakGlassAccess: breakGlassCount,
        activeEmergencyAccess,
      },
    });
  } catch (error) {
    console.error('Hospital access logs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
