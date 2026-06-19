import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dischargeAssessments = await db.dischargeAssessment.findMany({
      where: { patientId: id },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ dischargeAssessments });
  } catch (error) {
    console.error('Get discharge assessments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.visitDate) {
      return NextResponse.json({ error: 'visitDate is required' }, { status: 400 });
    }

    const assessment = await db.dischargeAssessment.create({
      data: {
        patientId: id,
        visitDate: body.visitDate,
        dischargeSafetyScore: body.dischargeSafetyScore || 0,
        transportAvailable: body.transportAvailable ?? true,
        pharmacyAccess: body.pharmacyAccess ?? true,
        foodSecurity: body.foodSecurity ?? true,
        socialSupport: body.socialSupport ?? true,
        healthLiteracy: body.healthLiteracy || 'moderate',
        followUpScheduled: body.followUpScheduled ?? false,
        homeHealthNeeded: body.homeHealthNeeded ?? false,
        dmeNeeded: body.dmeNeeded || null,
        readmissionRisk: body.readmissionRisk !== undefined ? parseFloat(body.readmissionRisk) : null,
        interventions: body.interventions || null,
        aiRecommendation: body.aiRecommendation || null,
      },
    });

    return NextResponse.json({ dischargeAssessment: assessment }, { status: 201 });
  } catch (error) {
    console.error('Add discharge assessment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
