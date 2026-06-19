import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const voiceMessages = await db.voiceMessage.findMany({
      where: { patientId: id, isActive: true },
      orderBy: { recordedAt: 'desc' },
    });
    return NextResponse.json({ voiceMessages });
  } catch (error) {
    console.error('Get voice messages error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { category, title, audioUrl, duration, transcript } = await request.json();

    if (!category || !title) {
      return NextResponse.json({ error: 'Category and title are required' }, { status: 400 });
    }

    const msg = await db.voiceMessage.create({
      data: {
        patientId: id,
        category,
        title,
        audioUrl: audioUrl || null,
        duration: duration || null,
        transcript: transcript || null,
      },
    });

    return NextResponse.json({ voiceMessage: msg }, { status: 201 });
  } catch (error) {
    console.error('Add voice message error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
