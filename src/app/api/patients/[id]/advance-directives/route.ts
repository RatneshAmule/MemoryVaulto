import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const advanceDirectives = await db.advanceDirective.findMany({
      where: { patientId: id, isActive: true },
      orderBy: { createdDate: 'desc' },
    });
    return NextResponse.json({ advanceDirectives });
  } catch (error) {
    console.error('Get advance directives error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { directiveType, description, documentUrl, createdDate, expiryDate, witnessName, notarized } = await request.json();

    if (!directiveType || !description || !createdDate) {
      return NextResponse.json({ error: 'directiveType, description, and createdDate are required' }, { status: 400 });
    }

    const ad = await db.advanceDirective.create({
      data: {
        patientId: id,
        directiveType,
        description,
        documentUrl: documentUrl || null,
        createdDate,
        expiryDate: expiryDate || null,
        witnessName: witnessName || null,
        notarized: notarized || false,
      },
    });

    return NextResponse.json({ advanceDirective: ad }, { status: 201 });
  } catch (error) {
    console.error('Add advance directive error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
