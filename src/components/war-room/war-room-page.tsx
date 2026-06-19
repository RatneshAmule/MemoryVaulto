'use client';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Phone, Send, ArrowLeft, Activity, MessageSquare, Plus } from 'lucide-react';
import { toast } from 'sonner';

export function WarRoomPage() {
  const { currentPatient, setCurrentPage, warRoomId, setWarRoomId } = useAppStore();
  const [warRoom, setWarRoom] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const createWarRoom = async () => {
    if (!currentPatient) return;
    setLoading(true);
    try {
      const res = await fetch('/api/war-room/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: currentPatient.id })
      });
      const data = await res.json();
      if (res.ok) { setWarRoom(data.warRoom); setWarRoomId(data.warRoom.roomId); toast.success('War Room created!'); }
      else toast.error('Failed to create');
    } catch { toast.error('Error'); }
    setLoading(false);
  };

  const fetchWarRoom = async () => {
    if (!warRoomId) return;
    try {
      const res = await fetch(`/api/war-room/${warRoomId}`);
      const data = await res.json();
      if (res.ok) setWarRoom(data.warRoom);
    } catch {}
  };

  const sendMessage = async () => {
    if (!warRoomId || !message) return;
    try {
      await fetch(`/api/war-room/${warRoomId}/message`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderName: currentPatient?.user?.name || 'Family', senderRole: 'family', content: message })
      });
      setMessage('');
      fetchWarRoom();
    } catch { toast.error('Failed to send'); }
  };

  const updateStatus = async () => {
    if (!warRoomId || !status) return;
    try {
      await fetch(`/api/war-room/${warRoomId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientStatus: status, patientLocation: location })
      });
      setStatus(''); setLocation('');
      fetchWarRoom();
      toast.success('Status updated');
    } catch { toast.error('Failed'); }
  };

  useEffect(() => { if (warRoomId) { fetch('/api/war-room/' + warRoomId).then(r => r.json()).then(d => { if (d.warRoom) setWarRoom(d.warRoom); }); } }, [warRoomId]);

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={() => setCurrentPage('patient-dashboard')}><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="w-6 h-6 text-teal-400" /> Family War Room</h1>
        </div>

        {!warRoom ? (
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6 text-center">
              <Users className="w-12 h-12 text-teal-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold mb-2">Create a War Room</h3>
              <p className="text-slate-400 mb-4">A private command center for your family during a medical emergency. Real-time updates, messaging, and coordination.</p>
              <Button onClick={createWarRoom} disabled={loading} className="bg-teal-600 hover:bg-teal-700"><Plus className="w-4 h-4 mr-1" />Create War Room</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {/* Status Panel */}
            <div className="space-y-4">
              <Card className="bg-slate-900 border-teal-500/30">
                <CardContent className="pt-4">
                  <h3 className="font-medium mb-2 flex items-center gap-2"><Activity className="w-4 h-4 text-teal-400" />Patient Status</h3>
                  <div className="text-2xl font-bold text-teal-400 mb-1">{warRoom.patientStatus || 'Unknown'}</div>
                  <div className="text-sm text-slate-400">Location: {warRoom.patientLocation || 'Unknown'}</div>
                  <div className="text-xs text-slate-500 mt-1">Room: {warRoom.roomId}</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="pt-4 space-y-2">
                  <h4 className="text-sm font-medium">Update Status</h4>
                  <Input className="bg-slate-800 border-slate-700" placeholder="Stable, Critical..." value={status} onChange={e => setStatus(e.target.value)} />
                  <Input className="bg-slate-800 border-slate-700" placeholder="Room 3, CT Scan..." value={location} onChange={e => setLocation(e.target.value)} />
                  <Button size="sm" onClick={updateStatus} className="w-full bg-teal-600 hover:bg-teal-700">Update</Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="pt-4">
                  <h4 className="text-sm font-medium mb-2">Members</h4>
                  <div className="space-y-1">
                    {(warRoom.members || []).map((m: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <div className={`w-2 h-2 rounded-full ${m.isOnline ? 'bg-green-400' : 'bg-slate-500'}`} />
                        <span>{m.name}</span>
                        <Badge variant="outline" className="text-[10px]">{m.role}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Messages & Updates */}
            <div className="md:col-span-2 space-y-4">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader><h3 className="font-medium flex items-center gap-2"><MessageSquare className="w-4 h-4 text-teal-400" />Messages</h3></CardHeader>
                <CardContent>
                  <div className="max-h-64 overflow-y-auto space-y-2 mb-3">
                    {(warRoom.messages || []).map((msg: any, i: number) => (
                      <div key={i} className="p-2 bg-slate-800 rounded-lg">
                        <div className="flex items-center gap-2 text-xs mb-1">
                          <span className="font-medium text-teal-400">{msg.senderName}</span>
                          <Badge variant="outline" className="text-[10px]">{msg.senderRole}</Badge>
                          <span className="text-slate-500 ml-auto">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-sm text-slate-300">{msg.content}</p>
                      </div>
                    ))}
                    {(!warRoom.messages || warRoom.messages.length === 0) && <p className="text-slate-500 text-sm text-center">No messages yet</p>}
                  </div>
                  <div className="flex gap-2">
                    <Input className="bg-slate-800 border-slate-700" placeholder="Type a message..." value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} />
                    <Button size="sm" onClick={sendMessage} className="bg-teal-600 hover:bg-teal-700"><Send className="w-4 h-4" /></Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800">
                <CardHeader><h3 className="font-medium">Status Updates</h3></CardHeader>
                <CardContent>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {(warRoom.updates || []).map((u: any, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-sm p-2 bg-slate-800 rounded">
                        <Activity className="w-3 h-3 text-teal-400 mt-0.5 flex-shrink-0" />
                        <div><span className="text-slate-300">{u.content}</span><span className="text-slate-500 ml-2 text-xs">{new Date(u.timestamp).toLocaleTimeString()}</span></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
