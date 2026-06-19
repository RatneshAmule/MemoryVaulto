import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const { name, role, phone, email } = await request.json();

    if (!name || !role) {
      return NextResponse.json({ error: 'name and role are required' }, { status: 400 });
    }

    const warRoom = await db.familyWarRoom.findFirst({
      where: {
        OR: [
          { roomId },
          { id: roomId },
        ],
        status: 'active',
      },
    });

    if (!warRoom) {
      return NextResponse.json({ error: 'Active war room not found' }, { status: 404 });
    }

    const member = await db.warRoomMember.create({
      data: {
        roomId: warRoom.id,
        name,
        role,
        phone: phone || null,
        email: email || null,
        isOnline: true,
      },
    });

    // Add update about new member
    await db.warRoomUpdate.create({
      data: {
        roomId: warRoom.id,
        type: 'status-change',
        content: `${name} (${role}) joined the war room.`,
      },
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    console.error('War room join error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
