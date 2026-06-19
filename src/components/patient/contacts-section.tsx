'use client';

import { useState } from 'react';
import { Plus, Trash2, Phone, Mail } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export function ContactsSection() {
  const { currentPatient, setCurrentPatient } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [priority, setPriority] = useState('1');

  if (!currentPatient) return null;

  const handleAdd = async () => {
    if (!name.trim() || !relationship.trim() || !phone.trim()) {
      toast.error('Name, relationship, and phone are required');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/patients/${currentPatient.id}/emergency-contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, relationship, phone, email, priority: parseInt(priority) }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentPatient({
          ...currentPatient,
          emergencyContacts: [...currentPatient.emergencyContacts, data.contact].sort((a, b) => a.priority - b.priority),
        });
        setName(''); setRelationship(''); setPhone(''); setEmail(''); setPriority('1'); setShowForm(false);
        toast.success('Emergency contact added');
      } else { toast.error('Failed to add contact'); }
    } catch { toast.error('Failed to add contact'); }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/patients/${currentPatient.id}/emergency-contacts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCurrentPatient({ ...currentPatient, emergencyContacts: currentPatient.emergencyContacts.filter((c) => c.id !== id) });
        toast.success('Contact removed');
      }
    } catch { toast.error('Failed to remove contact'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Emergency Contacts</h2>
          <p className="text-slate-400 text-sm mt-1">People to notify in case of emergency</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-red-600 hover:bg-red-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Contact
        </Button>
      </div>

      {showForm && (
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 mb-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300 text-sm">Full Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-slate-900 border-slate-700 text-white mt-1.5" placeholder="Contact name" />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Relationship</Label>
              <Input value={relationship} onChange={(e) => setRelationship(e.target.value)} className="bg-slate-900 border-slate-700 text-white mt-1.5" placeholder="e.g., Husband, Daughter" />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-slate-900 border-slate-700 text-white mt-1.5" placeholder="(555) 123-4567" />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-slate-900 border-slate-700 text-white mt-1.5" placeholder="email@example.com" />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Priority</Label>
              <Input type="number" min="1" max="10" value={priority} onChange={(e) => setPriority(e.target.value)} className="bg-slate-900 border-slate-700 text-white mt-1.5" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
              {loading ? 'Adding...' : 'Add Contact'}
            </Button>
            <Button variant="ghost" onClick={() => setShowForm(false)} className="text-slate-400">Cancel</Button>
          </div>
        </div>
      )}

      {currentPatient.emergencyContacts.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <Phone className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No emergency contacts recorded</p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentPatient.emergencyContacts.map((contact) => (
            <div key={contact.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-900/30 border border-red-700/30 flex items-center justify-center text-sm font-bold text-red-300">
                  {contact.priority}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{contact.name}</span>
                    <Badge variant="outline" className="text-xs bg-slate-700/50 text-slate-300 border-slate-600/50">
                      {contact.relationship}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{contact.phone}</span>
                    {contact.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{contact.email}</span>}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(contact.id)} className="text-slate-400 hover:text-red-400 h-8 w-8 p-0">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
