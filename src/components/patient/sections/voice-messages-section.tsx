'use client';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mic, Plus, Play, Square, Volume2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function VoiceMessagesSection() {
  const { currentPatient, fetchPatient } = useAppStore();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    category: 'intro',
    title: '',
    transcript: '',
    duration: 0,
    isActive: true,
  });
  const [playing, setPlaying] = useState<string | null>(null);
  const items = currentPatient?.voiceMessages || [];

  const handleAdd = async () => {
    if (!currentPatient || !form.title || !form.transcript) return;
    const res = await fetch(`/api/patients/${currentPatient.id}/sub/voice-messages`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        audioUrl: `tts://${form.transcript.slice(0, 50)}`,
        isActive: form.isActive,
      })
    });
    if (res.ok) {
      await fetchPatient(currentPatient.id);
      setAdding(false);
      setForm({ category: 'intro', title: '', transcript: '', duration: 0, isActive: true });
      toast.success('Voice message saved');
    } else toast.error('Failed');
  };

  const handlePlay = (msg: { id: string; transcript?: string | null }) => {
    if ('speechSynthesis' in window) {
      if (playing === msg.id) { speechSynthesis.cancel(); setPlaying(null); return; }
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(msg.transcript || '');
      utterance.rate = 0.9;
      utterance.onend = () => setPlaying(null);
      speechSynthesis.speak(utterance);
      setPlaying(msg.id);
    }
  };

  const toggleActive = async (msg: { id: string; isActive: boolean }) => {
    if (!currentPatient) return;
    try {
      const res = await fetch(`/api/patients/${currentPatient.id}/voice-messages/${msg.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !msg.isActive }),
      });
      if (res.ok) {
        await fetchPatient(currentPatient.id);
        toast.success(msg.isActive ? 'Voice message deactivated' : 'Voice message activated');
      }
    } catch {
      toast.error('Failed to update');
    }
  };

  const categoryColors: Record<string, string> = {
    'intro': 'bg-blue-500/20 text-blue-400',
    'end-of-life': 'bg-red-500/20 text-red-400',
    'family-message': 'bg-purple-500/20 text-purple-400',
    'cultural': 'bg-amber-500/20 text-amber-400',
    'treatment-preferences': 'bg-emerald-500/20 text-emerald-400',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Mic className="w-5 h-5 text-red-400" /> Voice of the Patient
          </h2>
          <p className="text-sm text-slate-400">When you can&apos;t speak, your voice speaks for you</p>
        </div>
        <Button size="sm" onClick={() => setAdding(!adding)}>
          <Plus className="w-4 h-4 mr-1" />Add
        </Button>
      </div>

      {adding && (
        <Card className="mb-4 bg-slate-900 border-slate-800">
          <CardContent className="pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300 text-xs">Category</Label>
                <select
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm mt-1"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                >
                  <option value="intro">Introduction</option>
                  <option value="end-of-life">End of Life Wishes</option>
                  <option value="family-message">Family Message</option>
                  <option value="cultural">Cultural/Religious</option>
                  <option value="treatment-preferences">Treatment Preferences</option>
                </select>
              </div>
              <div>
                <Label className="text-slate-300 text-xs">Title</Label>
                <Input
                  className="bg-slate-800 border-slate-700 mt-1"
                  placeholder="My introduction"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label className="text-slate-300 text-xs">Transcript (this will be spoken via text-to-speech)</Label>
              <Textarea
                className="bg-slate-800 border-slate-700 mt-1 min-h-[100px]"
                placeholder="Hello, my name is..."
                value={form.transcript}
                onChange={e => setForm({ ...form, transcript: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className="flex items-center gap-2 text-sm"
                >
                  {form.isActive ? (
                    <ToggleRight className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-slate-500" />
                  )}
                  <span className={form.isActive ? 'text-emerald-400' : 'text-slate-500'}>
                    {form.isActive ? 'Active' : 'Inactive'}
                  </span>
                </button>
              </div>
              <div className="flex gap-2 ml-auto">
                <Button size="sm" onClick={handleAdd}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {items.length === 0 ? (
        <p className="text-slate-500 text-sm">No voice messages recorded</p>
      ) : (
        <div className="space-y-3">
          {items.map((msg, i) => (
            <Card key={i} className={`bg-slate-900 ${msg.isActive ? 'border-red-500/20' : 'border-slate-800 opacity-60'}`}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={categoryColors[msg.category] || 'bg-slate-500/20 text-slate-400'}>
                    {msg.category}
                  </Badge>
                  <span className="font-medium">{msg.title}</span>
                  {msg.duration ? <span className="text-xs text-slate-500">{msg.duration}s</span> : null}
                  {!msg.isActive && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-slate-700/50 text-slate-400 border-slate-600">
                      Inactive
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-300 italic mb-3">&ldquo;{msg.transcript}&rdquo;</p>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="border-red-500/30 text-red-400" onClick={() => handlePlay(msg)}>
                    {playing === msg.id ? (
                      <><Square className="w-3 h-3 mr-1" />Stop</>
                    ) : (
                      <><Play className="w-3 h-3 mr-1" />Play Voice</>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={msg.isActive ? 'text-emerald-400' : 'text-slate-500'}
                    onClick={() => toggleActive(msg)}
                  >
                    {msg.isActive ? (
                      <><ToggleRight className="w-4 h-4 mr-1" />Active</>
                    ) : (
                      <><ToggleLeft className="w-4 h-4 mr-1" />Inactive</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
