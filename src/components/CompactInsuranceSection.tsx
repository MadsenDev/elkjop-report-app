import { useState } from 'react';
import { Day } from '../types';
import useReportStore, { InsuranceAgreementSale } from '../store';
import { formatCurrency } from '../utils/format';
import { useToast } from '../contexts/ToastContext';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';
import Modal from './Modal';

interface InsuranceSectionProps {
  day: Day;
}

function AnimatedNumber({ value, className = "" }: { value: number, className?: string }) {
  return (
    <span className={`font-mono ${className}`}>
      {value.toLocaleString()}
    </span>
  );
}

export default function CompactInsuranceSection({ day }: InsuranceSectionProps) {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<InsuranceAgreementSale>>({
    day,
    person: '',
    sold: 1
  });

  const { insuranceAgreements, people, setInsuranceAgreement, editInsuranceAgreement } = useReportStore();

  const dayAssignments = insuranceAgreements.filter((a: InsuranceAgreementSale) => a.day === day);
  const totalSold = dayAssignments.reduce((sum: number, a: InsuranceAgreementSale) => sum + a.sold, 0);

  const handleSubmit = async () => {
    try {
      if (!formData.person) {
        showToast('Please fill in all required fields', 'error');
        return;
      }

      const agreement: InsuranceAgreementSale = {
        day,
        person: formData.person,
        sold: formData.sold || 1
      };

      if (editingIndex !== null) {
        await editInsuranceAgreement(editingIndex, agreement);
        showToast('Insurance agreement updated successfully', 'success');
      } else {
        await setInsuranceAgreement(agreement);
        showToast('Insurance agreement added successfully', 'success');
      }

      setIsModalOpen(false);
      setEditingIndex(null);
      setFormData({
        day,
        person: '',
        sold: 1
      });
    } catch (error) {
      showToast('Failed to save insurance agreement', 'error');
    }
  };

  const handleEdit = (index: number) => {
    const agreement = dayAssignments[index];
    setFormData(agreement);
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Insurance</h2>
        <Button
          onClick={() => {
            setFormData({
              day,
              person: '',
              sold: 1
            });
            setEditingIndex(null);
            setIsModalOpen(true);
          }}
          color="green"
          className="px-3 py-1.5 text-sm"
        >
          Add Insurance
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-4">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Sold</div>
          <AnimatedNumber value={totalSold} className="text-xl font-semibold text-gray-900 dark:text-white" />
        </div>
      </div>

      <div className="space-y-2">
        {dayAssignments.map((agreement, index) => (
          <div
            key={`${agreement.person}-${agreement.day}`}
            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded-lg"
          >
            <div>
              <div className="font-medium text-gray-900 dark:text-white">{agreement.person}</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="font-medium text-gray-900 dark:text-white">{agreement.sold}</div>
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
            sold: 1
          });
        }}
        title={editingIndex !== null ? "Edit Insurance Agreement" : "Add Insurance Agreement"}
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
                  sold: 1
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