import { useState } from 'react';
import { Day } from '../types';
import useReportStore, { AVSAssignment } from '../store';
import { formatCurrency } from '../utils/format';
import { useToast } from '../contexts/ToastContext';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';
import Modal from './Modal';

interface AVSSectionProps {
  day: Day;
}

function AnimatedNumber({ value, className = "" }: { value: number, className?: string }) {
  return (
    <span className={`font-mono ${className}`}>
      {value.toLocaleString()}
    </span>
  );
}

export default function CompactAVSSection({ day }: AVSSectionProps) {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<AVSAssignment>>({
    day,
    person: '',
    serviceId: '',
    sold: 1,
    price: 0,
    gm: 0
  });

  const { avsAssignments, services, people, setAVSAssignment, editAVSAssignment } = useReportStore();

  const dayAssignments = avsAssignments.filter((a: AVSAssignment) => a.day === day);
  const totalSold = dayAssignments.reduce((sum: number, a: AVSAssignment) => sum + a.sold, 0);
  const totalGM = dayAssignments.reduce((sum: number, a: AVSAssignment) => sum + a.gm, 0);

  const handleSubmit = async () => {
    try {
      if (!formData.person || !formData.serviceId) {
        showToast('Please fill in all required fields', 'error');
        return;
      }

      const service = services.find((s: { id: string }) => s.id === formData.serviceId);
      if (!service) {
        showToast('Invalid service selected', 'error');
        return;
      }

      const assignment: AVSAssignment = {
        day,
        person: formData.person,
        serviceId: formData.serviceId,
        sold: formData.sold || 1,
        price: service.price,
        gm: service.price - service.cost
      };

      if (editingIndex !== null) {
        await editAVSAssignment(editingIndex, assignment);
        showToast('AVS assignment updated successfully', 'success');
      } else {
        await setAVSAssignment(assignment);
        showToast('AVS assignment added successfully', 'success');
      }

      setIsModalOpen(false);
      setEditingIndex(null);
      setFormData({
        day,
        person: '',
        serviceId: '',
        sold: 1,
        price: 0,
        gm: 0
      });
    } catch (error) {
      showToast('Failed to save AVS assignment', 'error');
    }
  };

  const handleEdit = (index: number) => {
    const assignment = dayAssignments[index];
    setFormData(assignment);
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AVS</h2>
        <Button
          onClick={() => {
            setFormData({
              day,
              person: '',
              serviceId: '',
              sold: 1,
              price: 0,
              gm: 0
            });
            setEditingIndex(null);
            setIsModalOpen(true);
          }}
          color="green"
          className="px-3 py-1.5 text-sm"
        >
          Add AVS
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Sold</div>
          <AnimatedNumber value={totalSold} className="text-xl font-semibold text-gray-900 dark:text-white" />
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total GM</div>
          <AnimatedNumber value={totalGM} className="text-xl font-semibold text-gray-900 dark:text-white" />
        </div>
      </div>

      <div className="space-y-2">
        {dayAssignments.map((assignment, index) => {
          const service = services.find(s => s.id === assignment.serviceId);
          return (
            <div
              key={`${assignment.person}-${assignment.serviceId}`}
              className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded-lg"
            >
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{assignment.person}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{service?.id || 'Unknown Service'}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-medium text-gray-900 dark:text-white">{assignment.sold}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{formatCurrency(assignment.gm)}</div>
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
          );
        })}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingIndex(null);
          setFormData({
            day,
            person: '',
            serviceId: '',
            sold: 1,
            price: 0,
            gm: 0
          });
        }}
        title={editingIndex !== null ? "Edit AVS Assignment" : "Add AVS Assignment"}
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
              Service
            </label>
            <Select
              value={formData.serviceId}
              onChange={(value: string) => setFormData({ ...formData, serviceId: value })}
              className="w-full"
              options={services.map((service) => ({
                value: service.id,
                label: `${service.id} - ${formatCurrency(service.price)}`
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
              value={formData.sold}
              onChange={(e) => setFormData({ ...formData, sold: parseInt(e.target.value) })}
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
                  serviceId: '',
                  sold: 1,
                  price: 0,
                  gm: 0
                });
              }}
              color="gray"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              color="green"
            >
              {editingIndex !== null ? "Update" : "Add"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 