import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; directiveId: string }> }
) {
  try {
    const { directiveId } = await params;
    const body = await request.json();

    const cd = await db.culturalDirective.update({
      where: { id: directiveId },
      data: {
        religion: body.religion,
        directive: body.directive,
        description: body.description,
        overrideAllowed: body.overrideAllowed,
        verifiedBy: body.verifiedBy,
      },
    });

    return NextResponse.json({ culturalDirective: cd });
  } catch (error) {
    console.error('Update cultural directive error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; directiveId: string }> }
) {
  try {
    const { directiveId } = await params;
    await db.culturalDirective.delete({ where: { id: directiveId } });
    return NextResponse.json({ message: 'Cultural directive removed' });
  } catch (error) {
    console.error('Delete cultural directive error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
