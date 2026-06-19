import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
  try {
    const { roomId } = await params;
    const { senderName, senderRole, content } = await request.json();
    const message = await db.warRoomMessage.create({ data: { roomId, senderName, senderRole, content } });
    return NextResponse.json({ message });
  } catch (error) { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}
