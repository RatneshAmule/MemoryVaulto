import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const patientId = id;

    const patient = await db.patient.findUnique({
      where: { id: patientId },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        allergies: true,
        medications: true,
        conditions: true,
        surgeries: true,
        implants: true,
        vaccinations: true,
        emergencyContacts: { orderBy: { priority: 'asc' } },
        consentProxies: { orderBy: { priority: 'asc' } },
        medicalTests: { orderBy: { testDate: 'desc' } },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const tests = patient.medicalTests.map(t => ({
      id: t.id,
      testName: t.testName,
      testDate: t.testDate.toISOString(),
      facility: t.facility,
      results: t.results,
      orderingDoc: t.orderingDoc,
      status: t.status,
    }));

    return NextResponse.json({ tests });
  } catch (error) {
    console.error('Get tests error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const patientId = id;
    const body = await request.json();
    const { testName, testDate, facility, results, orderingDoc, status, override } = body;

    if (!testName || !testDate) {
      return NextResponse.json({ error: 'testName and testDate are required' }, { status: 400 });
    }

    // Duplicate test check — same test within 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentTests = await db.medicalTest.findMany({
      where: {
        patientId,
        testName,
        testDate: { gte: sevenDaysAgo },
        status: { in: ['ordered', 'completed'] },
      },
      orderBy: { testDate: 'desc' },
    });

    if (recentTests.length > 0 && !override) {
      const dup = recentTests[0];
      return NextResponse.json({
        warning: `DUPLICATE TEST: ${testName} was already ordered on ${dup.testDate.toISOString().split('T')[0]}${dup.facility ? ` at ${dup.facility}` : ''}. Confirm override?`,
        duplicateOf: dup,
      }, { status: 409 });
    }

    const test = await db.medicalTest.create({
      data: {
        patientId,
        testName,
        testDate: new Date(testDate),
        facility: facility || null,
        results: results || null,
        orderingDoc: orderingDoc || null,
        status: status || 'ordered',
      },
    });

    return NextResponse.json({ test });
  } catch (error) {
    console.error('Create test error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
