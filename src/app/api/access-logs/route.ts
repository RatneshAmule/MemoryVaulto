import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const accessorId = searchParams.get('accessorId');

    const where: Record<string, string> = {};
    if (patientId) where.patientId = patientId;
    if (accessorId) where.accessorId = accessorId;

    const logs = await db.accessLog.findMany({
      where,
      include: {
        accessor: { select: { id: true, name: true, role: true, hospital: true } },
        patient: {
          include: { user: { select: { id: true, name: true } } },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Access logs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
