import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  try {
    const { messageId } = await params;
    const body = await request.json();

    const msg = await db.voiceMessage.update({
      where: { id: messageId },
      data: {
        category: body.category,
        title: body.title,
        audioUrl: body.audioUrl,
        duration: body.duration,
        transcript: body.transcript,
        isActive: body.isActive,
      },
    });

    return NextResponse.json({ voiceMessage: msg });
  } catch (error) {
    console.error('Update voice message error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  try {
    const { messageId } = await params;
    // Soft delete
    await db.voiceMessage.update({
      where: { id: messageId },
      data: { isActive: false },
    });
    return NextResponse.json({ message: 'Voice message deactivated' });
  } catch (error) {
    console.error('Delete voice message error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
