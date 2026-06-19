import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await params;
    const accessorId = request.nextUrl.searchParams.get('accessorId');

    if (!accessorId) {
      return NextResponse.json({ error: 'accessorId is required' }, { status: 400 });
    }

    const now = new Date();
    const activeAccess = await db.accessLog.findFirst({
      where: {
        accessorId,
        patientId,
        accessType: 'emergency',
        expiresAt: { gt: now },
      },
      orderBy: { timestamp: 'desc' },
    });

    if (!activeAccess) {
      return NextResponse.json({
        hasAccess: false,
        expiresAt: null,
        timeRemaining: 0,
      });
    }

    const remaining = Math.max(0, new Date(activeAccess.expiresAt!).getTime() - now.getTime());

    return NextResponse.json({
      hasAccess: true,
      expiresAt: activeAccess.expiresAt,
      timeRemaining: remaining,
      accessLogId: activeAccess.id,
      accessMethod: activeAccess.accessMethod,
      timestamp: activeAccess.timestamp,
    });
  } catch (error) {
    console.error('Access status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
