import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const patient = await db.patient.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, name: true, role: true, hospital: true, avatar: true } },
        allergies: true,
        medications: true,
        conditions: true,
        surgeries: true,
        implants: true,
        vaccinations: true,
        emergencyContacts: { orderBy: { priority: 'asc' } },
        consentProxies: { orderBy: { priority: 'asc' } },
        accessLogs: {
          include: { accessor: { select: { id: true, name: true, role: true, hospital: true } } },
          orderBy: { timestamp: 'desc' },
          take: 20,
        },
        medicalTests: { orderBy: { testDate: 'desc' } },
        pharmacogenomics: true,
        vitalBaselines: { orderBy: { recordedDate: 'desc' } },
        bloodAntibodies: true,
        culturalDirectives: true,
        voiceMessages: { where: { isActive: true } },
        advanceDirectives: { where: { isActive: true } },
        medicationAdherence: true,
        painProfile: true,
        geneticFlags: true,
        deviceIntegrations: { where: { isActive: true } },
        occupationalExposures: true,
        radiationExposures: { orderBy: { studyDate: 'desc' } },
        caregiverPasses: { where: { isActive: true } },
        medicalTimeline: { orderBy: { eventDate: 'desc' } },
        dischargeAssessments: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json({ patient });
  } catch (error) {
    console.error('Get patient error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const patient = await db.patient.update({
      where: { id },
      data: {
        dateOfBirth: body.dateOfBirth,
        gender: body.gender,
        bloodType: body.bloodType,
        rhFactor: body.rhFactor,
        dnr: body.dnr,
        organDonor: body.organDonor,
        tissueDonor: body.tissueDonor,
        occupation: body.occupation,
        workplace: body.workplace,
        primaryLanguage: body.primaryLanguage,
        secondaryLanguages: body.secondaryLanguages,
        pregnancyStatus: body.pregnancyStatus,
        lastMenstrualPeriod: body.lastMenstrualPeriod,
        insuranceProvider: body.insuranceProvider,
        insuranceId: body.insuranceId,
        weight: body.weight,
        height: body.height,
        ethnicity: body.ethnicity,
        religion: body.religion,
        nationality: body.nationality,
        refugeeStatus: body.refugeeStatus,
        veteranStatus: body.veteranStatus,
        militaryBranch: body.militaryBranch,
        deployments: body.deployments,
        disabilityStatus: body.disabilityStatus,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        emergencyNotes: body.emergencyNotes,
      },
      include: {
        user: { select: { id: true, email: true, name: true, role: true } },
        allergies: true,
        medications: true,
        conditions: true,
        surgeries: true,
        implants: true,
        vaccinations: true,
        emergencyContacts: { orderBy: { priority: 'asc' } },
        consentProxies: { orderBy: { priority: 'asc' } },
        pharmacogenomics: true,
        vitalBaselines: true,
        bloodAntibodies: true,
        culturalDirectives: true,
        voiceMessages: { where: { isActive: true } },
        advanceDirectives: { where: { isActive: true } },
        medicationAdherence: true,
        painProfile: true,
        geneticFlags: true,
        deviceIntegrations: { where: { isActive: true } },
        occupationalExposures: true,
        radiationExposures: true,
        caregiverPasses: { where: { isActive: true } },
        medicalTimeline: { orderBy: { eventDate: 'desc' } },
      },
    });

    return NextResponse.json({ patient });
  } catch (error) {
    console.error('Update patient error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
