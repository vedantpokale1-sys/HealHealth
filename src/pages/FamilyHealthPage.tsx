import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Heart,
  AlertCircle,
  Plus,
  Calendar,
  Lock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { FamilyMember } from '../types';

export const FamilyHealthPage: React.FC = () => {
  const { familyMembers, addFamilyMember } = useApp();
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Child');
  const [age, setAge] = useState(8);
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [allergyInput, setAllergyInput] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addFamilyMember({
      name,
      relationship,
      age: Number(age),
      gender,
      bloodGroup,
      allergies: allergyInput ? allergyInput.split(',').map((s) => s.trim()) : [],
      conditions: [],
      avatarColor: 'bg-teal-500',
    });

    setName('');
    setAddModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Family Care & Health Profiles
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Coordinate healthcare appointments and track allergies for loved ones under one account.
          </p>
        </div>

        <Button
          variant="teal"
          size="sm"
          onClick={() => setAddModalOpen(true)}
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Add Family Member
        </Button>
      </div>

      {/* Trust Notice */}
      <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
          <span>
            <strong>Delegated Caregiver Privacy:</strong> Family health profiles maintain segregated records with granular caregiver permissions.
          </span>
        </div>
      </div>

      {/* Family Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {familyMembers.map((member) => (
          <Card key={member.id} className="p-6 flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl ${member.avatarColor} text-white flex items-center justify-center font-bold text-base shadow-sm`}>
                    {member.name[0]}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{member.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Badge variant="teal" size="sm">{member.relationship}</Badge>
                      <span className="text-xs text-slate-500">{member.age} yrs • {member.gender}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-2 mb-4">
                <div className="flex justify-between text-slate-600">
                  <span>Blood Group:</span>
                  <span className="font-bold text-slate-800">{member.bloodGroup}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Known Allergies:</span>
                  <span className="font-medium text-rose-700">
                    {member.allergies.length > 0 ? member.allergies.join(', ') : 'None reported'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Ongoing Conditions:</span>
                  <span className="font-medium text-amber-700">
                    {member.conditions.length > 0 ? member.conditions.join(', ') : 'None documented'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => alert(`Opening records for ${member.name} (Demo simulated)`)}
              >
                View Records
              </Button>
              <Button
                variant="teal"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => alert(`Starting consult for ${member.name} (Demo simulated)`)}
              >
                Book Visit
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Member Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Family Member Profile"
        description="Create a delegated health record for family coordination."
      >
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Maya Sharma"
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship</label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <option value="Spouse">Spouse</option>
                <option value="Child">Child</option>
                <option value="Parent">Parent</option>
                <option value="Sibling">Sibling</option>
                <option value="Other Dependent">Other Dependent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                min={1}
                max={120}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Allergies (comma-separated)</label>
            <input
              type="text"
              value={allergyInput}
              onChange={(e) => setAllergyInput(e.target.value)}
              placeholder="e.g. Peanuts, Penicillin"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="teal" size="sm" type="submit">
              Save Member
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
