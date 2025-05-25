import { useState } from 'react';
import { Day } from '../types';
import useReportStore, { RepairTicket } from '../store';
import { formatCurrency } from '../utils/format';
import { useToast } from '../contexts/ToastContext';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';
import Modal from './Modal';

interface RepairSectionProps {
  day: Day;
}

function AnimatedNumber({ value, className = "" }: { value: number, className?: string }) {
  return (
    <span className={`font-mono ${className}`}>
      {value.toLocaleString()}
    </span>
  );
}

export default function CompactRepairSection({ day }: RepairSectionProps) {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<RepairTicket>>({
    day,
    person: '',
    completed: 1
  });

  const { repairTickets, people, setRepairTicket, editRepairTicket } = useReportStore();

  const dayTickets = repairTickets.filter((a: RepairTicket) => a.day === day);
  const totalCompleted = dayTickets.reduce((sum: number, a: RepairTicket) => sum + a.completed, 0);

  const handleSubmit = async () => {
    try {
      if (!formData.person) {
        showToast('Please fill in all required fields', 'error');
        return;
      }

      const ticket: RepairTicket = {
        day,
        person: formData.person,
        completed: formData.completed || 1
      };

      if (editingIndex !== null) {
        await editRepairTicket(editingIndex, ticket);
        showToast('Repair ticket updated successfully', 'success');
      } else {
        await setRepairTicket(ticket);
        showToast('Repair ticket added successfully', 'success');
      }

      setIsModalOpen(false);
      setEditingIndex(null);
      setFormData({
        day,
        person: '',
        completed: 1
      });
    } catch (error) {
      showToast('Failed to save repair ticket', 'error');
    }
  };

  const handleEdit = (index: number) => {
    const ticket = dayTickets[index];
    setFormData(ticket);
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Repair Tickets</h2>
        <Button
          onClick={() => {
            setFormData({
              day,
              person: '',
              completed: 1
            });
            setEditingIndex(null);
            setIsModalOpen(true);
          }}
          color="orange"
          className="px-3 py-1.5 text-sm"
        >
          Add Ticket
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-4">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Completed</div>
          <AnimatedNumber value={totalCompleted} className="text-xl font-semibold text-gray-900 dark:text-white" />
        </div>
      </div>

      <div className="space-y-2">
        {dayTickets.map((ticket, index) => (
          <div
            key={`${ticket.person}-${ticket.day}`}
            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded-lg"
          >
            <div>
              <div className="font-medium text-gray-900 dark:text-white">{ticket.person}</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="font-medium text-gray-900 dark:text-white">{ticket.completed}</div>
              </div>
              <Button
                onClick={() => handleEdit(index)}
                color="gray"
                variant="ghost"
                className="p-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingIndex(null);
          setFormData({
            day,
            person: '',
            completed: 1
          });
        }}
        title={editingIndex !== null ? "Edit Repair Ticket" : "Add Repair Ticket"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Person
            </label>
            <Select
              value={formData.person}
              onChange={(value: string) => setFormData({ ...formData, person: value })}
              className="w-full"
              options={people.map((person) => ({
                value: person.code,
                label: `${person.firstName} ${person.lastName}`
              }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Quantity
            </label>
            <Input
              type="number"
              min="1"
              value={formData.completed}
              onChange={(e) => setFormData({ ...formData, completed: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                setIsModalOpen(false);
                setEditingIndex(null);
                setFormData({
                  day,
                  person: '',
                  completed: 1
                });
              }}
              color="gray"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              color="orange"
            >
              {editingIndex !== null ? "Update" : "Add"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 