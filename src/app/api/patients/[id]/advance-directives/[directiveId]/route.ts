import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; directiveId: string }> }
) {
  try {
    const { directiveId } = await params;
    const body = await request.json();

    const ad = await db.advanceDirective.update({
      where: { id: directiveId },
      data: {
        directiveType: body.directiveType,
        description: body.description,
        documentUrl: body.documentUrl,
        expiryDate: body.expiryDate,
        witnessName: body.witnessName,
        notarized: body.notarized,
        isActive: body.isActive,
      },
    });

    return NextResponse.json({ advanceDirective: ad });
  } catch (error) {
    console.error('Update advance directive error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; directiveId: string }> }
) {
  try {
    const { directiveId } = await params;
    // Soft delete
    await db.advanceDirective.update({
      where: { id: directiveId },
      data: { isActive: false },
    });
    return NextResponse.json({ message: 'Advance directive deactivated' });
  } catch (error) {
    console.error('Delete advance directive error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
