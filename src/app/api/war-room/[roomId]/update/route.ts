import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
  try {
    const { roomId } = await params;
    const { type, content } = await request.json();
    const update = await db.warRoomUpdate.create({ data: { roomId, type, content } });
    return NextResponse.json({ update });
  } catch (error) { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}
