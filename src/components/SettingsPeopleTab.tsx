import { useState } from 'react';
import { Person } from '../store';
import useReportStore from '../store';
import { db } from '../services/db';
import Button from './ui/Button';
import Input from './ui/Input';

export default function SettingsPeopleTab() {
  const { people, loadPeople } = useReportStore();
  const [localPeople, setLocalPeople] = useState<Person[]>(people);
  const [isSaving, setIsSaving] = useState(false);

  const handlePersonChange = (idx: number, field: keyof Person, value: string) => {
    const newPeople = [...localPeople];
    newPeople[idx] = { ...newPeople[idx], [field]: value };
    setLocalPeople(newPeople);
  };

  const handleAddPerson = () => {
    setLocalPeople([
      { code: '', firstName: '', lastName: '' },
      ...localPeople
    ]);
  };

  const handleDeletePerson = (idx: number) => {
    setLocalPeople(localPeople.filter((_, i) => i !== idx));
  };

  const handleSavePeople = async () => {
    try {
      setIsSaving(true);
      await db.setPeople(localPeople);
      await loadPeople(); // Reload to ensure sync
    } catch (error) {
      console.error('Failed to save people:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sticky header with title and actions */}
      <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 pb-4 -mx-6 px-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">People Management</h2>
          <div className="flex items-center gap-4">
            <Button
              onClick={handleSavePeople}
              color="green"
              className="px-6"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              onClick={handleAddPerson}
              color="gray"
              variant="outline"
              className="flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Person
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {/* Column Headers */}
          <div className="p-4 grid grid-cols-12 gap-4 border-b border-gray-200 dark:border-gray-700">
            <div className="col-span-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Code</span>
            </div>
            <div className="col-span-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">First Name</span>
            </div>
            <div className="col-span-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</span>
            </div>
          </div>
          {localPeople.map((person, idx) => (
            <div key={idx} className="p-4 flex items-center gap-4">
              <div className="flex-1 grid grid-cols-12 gap-4">
                <div className="col-span-3">
                  <Input
                    type="text"
                    value={person.code}
                    onChange={(e) => handlePersonChange(idx, 'code', e.target.value)}
                    placeholder="Code"
                    className="bg-gray-50 dark:bg-gray-900"
                  />
                </div>
                <div className="col-span-4">
                  <Input
                    type="text"
                    value={person.firstName}
                    onChange={(e) => handlePersonChange(idx, 'firstName', e.target.value)}
                    placeholder="First Name"
                    className="bg-gray-50 dark:bg-gray-900"
                  />
                </div>
                <div className="col-span-4">
                  <Input
                    type="text"
                    value={person.lastName}
                    onChange={(e) => handlePersonChange(idx, 'lastName', e.target.value)}
                    placeholder="Last Name"
                    className="bg-gray-50 dark:bg-gray-900"
                  />
                </div>
              </div>
              <Button
                onClick={() => handleDeletePerson(idx)}
                color="red"
                variant="ghost"
                className="p-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 