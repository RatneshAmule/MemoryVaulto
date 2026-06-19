import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
  try {
    const { roomId } = await params;
    const warRoom = await db.familyWarRoom.findUnique({
      where: { roomId },
      include: { members: true, messages: { orderBy: { timestamp: 'desc' }, take: 50 }, updates: { orderBy: { timestamp: 'desc' } }, patient: { include: { user: { select: { name: true } } } } }
    });
    if (!warRoom) return NextResponse.json({ error: 'War room not found' }, { status: 404 });
    return NextResponse.json({ warRoom });
  } catch (error) { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
  try {
    const { roomId } = await params;
    const body = await request.json();
    const warRoom = await db.familyWarRoom.update({
      where: { roomId },
      data: { patientStatus: body.patientStatus, patientLocation: body.patientLocation },
    });
    if (body.patientStatus) {
      await db.warRoomUpdate.create({ data: { roomId, type: 'status-change', content: `Patient status: ${body.patientStatus}. Location: ${body.patientLocation || 'unknown'}` } });
    }
    return NextResponse.json({ warRoom });
  } catch (error) { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}
