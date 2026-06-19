'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export function ProfileSection() {
  const { currentPatient, setCurrentPatient } = useAppStore();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    dateOfBirth: '',
    gender: '',
    bloodType: '',
    rhFactor: '',
    dnr: false,
    organDonor: false,
    tissueDonor: false,
    occupation: '',
    workplace: '',
    primaryLanguage: 'English',
    secondaryLanguages: '',
    pregnancyStatus: '',
    lastMenstrualPeriod: '',
    insuranceProvider: '',
    insuranceId: '',
    weight: '' as string,
    height: '' as string,
    ethnicity: '',
    religion: '',
    nationality: '',
    refugeeStatus: false,
    veteranStatus: false,
    militaryBranch: '',
    deployments: '',
    disabilityStatus: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    emergencyNotes: '',
  });

  useEffect(() => {
    if (currentPatient) {
      setForm({
        dateOfBirth: currentPatient.dateOfBirth || '',
        gender: currentPatient.gender || '',
        bloodType: currentPatient.bloodType || '',
        rhFactor: currentPatient.rhFactor || '',
        dnr: currentPatient.dnr || false,
        organDonor: currentPatient.organDonor || false,
        tissueDonor: currentPatient.tissueDonor || false,
        occupation: currentPatient.occupation || '',
        workplace: currentPatient.workplace || '',
        primaryLanguage: currentPatient.primaryLanguage || 'English',
        secondaryLanguages: currentPatient.secondaryLanguages || '',
        pregnancyStatus: currentPatient.pregnancyStatus || '',
        lastMenstrualPeriod: currentPatient.lastMenstrualPeriod || '',
        insuranceProvider: currentPatient.insuranceProvider || '',
        insuranceId: currentPatient.insuranceId || '',
        weight: currentPatient.weight != null ? String(currentPatient.weight) : '',
        height: currentPatient.height != null ? String(currentPatient.height) : '',
        ethnicity: currentPatient.ethnicity || '',
        religion: currentPatient.religion || '',
        nationality: currentPatient.nationality || '',
        refugeeStatus: currentPatient.refugeeStatus || false,
        veteranStatus: currentPatient.veteranStatus || false,
        militaryBranch: currentPatient.militaryBranch || '',
        deployments: currentPatient.deployments || '',
        disabilityStatus: currentPatient.disabilityStatus || '',
        address: currentPatient.address || '',
        city: currentPatient.city || '',
        state: currentPatient.state || '',
        zipCode: currentPatient.zipCode || '',
        emergencyNotes: currentPatient.emergencyNotes || '',
      });
    }
  }, [currentPatient]);

  if (!currentPatient) return null;

  const age = form.dateOfBirth
    ? Math.floor((Date.now() - new Date(form.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        weight: form.weight ? parseFloat(form.weight) : null,
        height: form.height ? parseFloat(form.height) : null,
      };
      const res = await fetch(`/api/patients/${currentPatient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentPatient(data.patient);
        toast.success('Profile updated successfully');
      } else {
        toast.error('Failed to update profile');
      }
    } catch {
      toast.error('Failed to update profile');
    }
    setSaving(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Patient Profile</h2>
          <p className="text-slate-400 text-sm mt-1">Manage your medical identity and advance directives</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-red-600 hover:bg-red-700 text-white">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      {/* ID Card */}
      <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700/50 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-red-900/30 border-2 border-red-700/50 flex items-center justify-center text-xl font-bold text-red-300">
            {currentPatient.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div>
            <h3 className="text-lg font-semibold">{currentPatient.user?.name}</h3>
            <p className="text-sm text-slate-400">
              {age !== null ? `${age} years old` : 'Age not set'} • {form.gender || 'Gender not set'}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {form.bloodType && (
                <span className="px-2 py-0.5 rounded-md bg-red-950/50 border border-red-800/50 text-red-300 text-xs font-bold">
                  {form.bloodType}{form.rhFactor || ''}
                </span>
              )}
              {form.dnr && (
                <span className="px-2 py-0.5 rounded-md bg-amber-950/50 border border-amber-800/50 text-amber-300 text-xs font-bold pulse-glow">
                  DNR
                </span>
              )}
              {form.organDonor && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-950/50 border border-emerald-800/50 text-emerald-300 text-xs font-bold">
                  ORGAN DONOR
                </span>
              )}
              {form.tissueDonor && (
                <span className="px-2 py-0.5 rounded-md bg-teal-950/50 border border-teal-800/50 text-teal-300 text-xs font-bold">
                  TISSUE DONOR
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Basic Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label className="text-slate-300 text-sm">Date of Birth</Label>
            <Input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
              className="bg-slate-800 border-slate-700 text-white mt-1.5"
            />
          </div>
          <div>
            <Label className="text-slate-300 text-sm">Gender</Label>
            <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1.5">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Non-binary">Non-binary</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-slate-300 text-sm">Blood Type</Label>
            <Select value={form.bloodType} onValueChange={(v) => setForm({ ...form, bloodType: v })}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1.5">
                <SelectValue placeholder="Select blood type" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bt) => (
                  <SelectItem key={bt} value={bt}>{bt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-slate-300 text-sm">Rh Factor</Label>
            <Select value={form.rhFactor} onValueChange={(v) => setForm({ ...form, rhFactor: v })}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1.5">
                <SelectValue placeholder="Select Rh factor" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="+">Positive (+)</SelectItem>
                <SelectItem value="-">Negative (-)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-slate-300 text-sm">Primary Language</Label>
            <Input
              value={form.primaryLanguage}
              onChange={(e) => setForm({ ...form, primaryLanguage: e.target.value })}
              className="bg-slate-800 border-slate-700 text-white mt-1.5"
            />
          </div>
          <div>
            <Label className="text-slate-300 text-sm">Secondary Languages</Label>
            <Input
              value={form.secondaryLanguages}
              onChange={(e) => setForm({ ...form, secondaryLanguages: e.target.value })}
              className="bg-slate-800 border-slate-700 text-white mt-1.5"
              placeholder="e.g., Spanish, Mandarin (comma-separated)"
            />
          </div>
          <div>
            <Label className="text-slate-300 text-sm">Occupation</Label>
            <Input
              value={form.occupation}
              onChange={(e) => setForm({ ...form, occupation: e.target.value })}
              className="bg-slate-800 border-slate-700 text-white mt-1.5"
              placeholder="e.g., Teacher, Engineer"
            />
          </div>
          <div>
            <Label className="text-slate-300 text-sm">Workplace</Label>
            <Input
              value={form.workplace}
              onChange={(e) => setForm({ ...form, workplace: e.target.value })}
              className="bg-slate-800 border-slate-700 text-white mt-1.5"
              placeholder="e.g., City Hospital, Acme Corp"
            />
          </div>
          <div>
            <Label className="text-slate-300 text-sm">Pregnancy Status</Label>
            <Select value={form.pregnancyStatus} onValueChange={(v) => setForm({ ...form, pregnancyStatus: v })}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1.5">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="not-pregnant">Not Pregnant</SelectItem>
                <SelectItem value="confirmed">Confirmed Pregnant</SelectItem>
                <SelectItem value="possible">Possibly Pregnant</SelectItem>
                <SelectItem value="postpartum">Postpartum</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-slate-300 text-sm">Insurance Provider</Label>
            <Input
              value={form.insuranceProvider}
              onChange={(e) => setForm({ ...form, insuranceProvider: e.target.value })}
              className="bg-slate-800 border-slate-700 text-white mt-1.5"
            />
          </div>
          <div>
            <Label className="text-slate-300 text-sm">Insurance ID</Label>
            <Input
              value={form.insuranceId}
              onChange={(e) => setForm({ ...form, insuranceId: e.target.value })}
              className="bg-slate-800 border-slate-700 text-white mt-1.5"
            />
          </div>
        </div>
      </div>

      {/* Physical */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Physical</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label className="text-slate-300 text-sm">Weight (kg)</Label>
            <Input
              type="number"
              value={form.weight}
              onChange={(e) => setForm({ ...form, weight: e.target.value })}
              className="bg-slate-800 border-slate-700 text-white mt-1.5"
              placeholder="e.g., 70"
            />
          </div>
          <div>
            <Label className="text-slate-300 text-sm">Height (cm)</Label>
            <Input
              type="number"
              value={form.height}
              onChange={(e) => setForm({ ...form, height: e.target.value })}
              className="bg-slate-800 border-slate-700 text-white mt-1.5"
              placeholder="e.g., 175"
            />
          </div>
          {form.gender === 'Female' && (
            <div>
              <Label className="text-slate-300 text-sm">Last Menstrual Period</Label>
              <Input
                type="date"
                value={form.lastMenstrualPeriod}
                onChange={(e) => setForm({ ...form, lastMenstrualPeriod: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white mt-1.5"
              />
            </div>
          )}
        </div>
      </div>

      {/* Demographics */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Demographics</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label className="text-slate-300 text-sm">Ethnicity</Label>
            <Input
              value={form.ethnicity}
              onChange={(e) => setForm({ ...form, ethnicity: e.target.value })}
              className="bg-slate-800 border-slate-700 text-white mt-1.5"
              placeholder="e.g., Hispanic, Asian, African American"
            />
          </div>
          <div>
            <Label className="text-slate-300 text-sm">Religion</Label>
            <Input
              value={form.religion}
              onChange={(e) => setForm({ ...form, religion: e.target.value })}
              className="bg-slate-800 border-slate-700 text-white mt-1.5"
              placeholder="e.g., Catholic, Muslim, Jewish"
            />
          </div>
          <div>
            <Label className="text-slate-300 text-sm">Nationality</Label>
            <Input
              value={form.nationality}
              onChange={(e) => setForm({ ...form, nationality: e.target.value })}
              className="bg-slate-800 border-slate-700 text-white mt-1.5"
              placeholder="e.g., US Citizen, Canadian"
            />
          </div>
          <div>
            <Label className="text-slate-300 text-sm">Disability Status</Label>
            <Select value={form.disabilityStatus} onValueChange={(v) => setForm({ ...form, disabilityStatus: v })}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1.5">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="physical">Physical</SelectItem>
                <SelectItem value="cognitive">Cognitive</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
            <div>
              <p className="font-medium text-slate-300">Refugee Status</p>
              <p className="text-xs text-slate-500 mt-0.5">Indicates refugee or displaced person</p>
            </div>
            <Switch
              checked={form.refugeeStatus}
              onCheckedChange={(v) => setForm({ ...form, refugeeStatus: v })}
            />
          </div>
        </div>
      </div>

      {/* Military/Veteran */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Military / Veteran</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
            <div>
              <p className="font-medium text-slate-300">Veteran Status</p>
              <p className="text-xs text-slate-500 mt-0.5">Military veteran or active service member</p>
            </div>
            <Switch
              checked={form.veteranStatus}
              onCheckedChange={(v) => setForm({ ...form, veteranStatus: v })}
            />
          </div>
          {form.veteranStatus && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300 text-sm">Military Branch</Label>
                <Select value={form.militaryBranch} onValueChange={(v) => setForm({ ...form, militaryBranch: v })}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1.5">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="Army">Army</SelectItem>
                    <SelectItem value="Navy">Navy</SelectItem>
                    <SelectItem value="Air Force">Air Force</SelectItem>
                    <SelectItem value="Marines">Marines</SelectItem>
                    <SelectItem value="Coast Guard">Coast Guard</SelectItem>
                    <SelectItem value="Space Force">Space Force</SelectItem>
                    <SelectItem value="National Guard">National Guard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300 text-sm">Deployments</Label>
                <Input
                  value={form.deployments}
                  onChange={(e) => setForm({ ...form, deployments: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white mt-1.5"
                  placeholder="e.g., Iraq, Afghanistan (comma-separated)"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Address */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Address</h3>
        <div className="space-y-4">
          <div>
            <Label className="text-slate-300 text-sm">Street Address</Label>
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="bg-slate-800 border-slate-700 text-white mt-1.5"
              placeholder="e.g., 123 Main St, Apt 4B"
            />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label className="text-slate-300 text-sm">City</Label>
              <Input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white mt-1.5"
              />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">State</Label>
              <Input
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white mt-1.5"
              />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">ZIP Code</Label>
              <Input
                value={form.zipCode}
                onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white mt-1.5"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Notes */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Emergency Notes</h3>
        <Textarea
          value={form.emergencyNotes}
          onChange={(e) => setForm({ ...form, emergencyNotes: e.target.value })}
          className="bg-slate-800 border-slate-700 text-white mt-1.5 min-h-[100px]"
          placeholder="Any critical information emergency responders should know — medical conditions, special needs, communication preferences, etc."
        />
      </div>

      {/* Toggles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg bg-amber-950/20 border border-amber-800/30">
          <div>
            <p className="font-medium text-amber-300">Do Not Resuscitate (DNR)</p>
            <p className="text-xs text-slate-400 mt-0.5">Advance directive — will be displayed prominently to emergency responders</p>
          </div>
          <Switch
            checked={form.dnr}
            onCheckedChange={(v) => setForm({ ...form, dnr: v })}
          />
        </div>
        <div className="flex items-center justify-between p-4 rounded-lg bg-emerald-950/20 border border-emerald-800/30">
          <div>
            <p className="font-medium text-emerald-300">Organ Donor</p>
            <p className="text-xs text-slate-400 mt-0.5">Registered organ donor status</p>
          </div>
          <Switch
            checked={form.organDonor}
            onCheckedChange={(v) => setForm({ ...form, organDonor: v })}
          />
        </div>
        <div className="flex items-center justify-between p-4 rounded-lg bg-teal-950/20 border border-teal-800/30">
          <div>
            <p className="font-medium text-teal-300">Tissue Donor</p>
            <p className="text-xs text-slate-400 mt-0.5">Registered tissue donor status</p>
          </div>
          <Switch
            checked={form.tissueDonor}
            onCheckedChange={(v) => setForm({ ...form, tissueDonor: v })}
          />
        </div>
      </div>
    </div>
  );
}
