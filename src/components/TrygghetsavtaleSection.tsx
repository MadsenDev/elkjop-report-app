import { useState } from 'react';
import useReportStore from '../store';
import { Day } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import PersonSelect from './PersonSelect';
import Card, { Chip, Button } from './ui/Card';
import GoalProgress from './GoalProgress';
import { FaShieldAlt } from 'react-icons/fa';
import SectionModal from './ui/SectionModal';
import NumberInput from './ui/NumberInput';
import { FiPlus } from 'react-icons/fi';

interface InsuranceAgreementSectionProps {
  day: Day;
}

interface FormData {
  person: string;
  sold: number;
}

export default function InsuranceAgreementSection({ day }: InsuranceAgreementSectionProps) {
  const insuranceAgreements = useReportStore((state) => state.insuranceAgreements);
  const setInsuranceAgreement = useReportStore((state) => state.setInsuranceAgreement);
  const people = useReportStore((state) => state.people);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Form state
  const [formData, setFormData] = useState<FormData>({
    person: '',
    sold: 1
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAgreement = {
      day,
      person: formData.person,
      sold: formData.sold,
    };

    if (editingIndex !== null) {
      // When editing, replace all existing agreements for this person with a single new one
      const filteredAgreements = insuranceAgreements.filter(a => a.person !== formData.person || a.day !== day);
      useReportStore.setState({ insuranceAgreements: [...filteredAgreements, newAgreement] });
    } else {
      setInsuranceAgreement(newAgreement);
    }

    setIsModalOpen(false);
    setEditingIndex(null);
    setFormData({ person: '', sold: 1 });
  };

  const handleEdit = (person: string, totalSold: number) => {
    // Find the first agreement for this person to use as the base for editing
    const firstAgreementIndex = insuranceAgreements.findIndex(a => a.person === person && a.day === day);
    if (firstAgreementIndex === -1) return;

    setFormData({
      person,
      sold: totalSold,
    });
    setEditingIndex(firstAgreementIndex);
    setIsModalOpen(true);
  };

  const handleDelete = (person: string) => {
    const newAgreements = insuranceAgreements.filter(a => a.person !== person || a.day !== day);
    useReportStore.setState({ insuranceAgreements: newAgreements });
    setIsModalOpen(false);
    setEditingIndex(null);
  };

  const grouped = insuranceAgreements
    .filter((t) => t.day === day)
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.person] = (acc[t.person] || 0) + t.sold;
      return acc;
    }, {});

  return (
    <Card
      title="Insurance Agreements"
      color="green"
      icon={<FaShieldAlt />}
      description="Insurance Agreement Sales"
      action={
        <Button
          onClick={() => {
            setEditingIndex(null);
            setFormData({ person: '', sold: 1 });
            setIsModalOpen(true);
          }}
          color="green"
          aria-label="Add Sale"
          className="rounded-full w-10 h-10 flex items-center justify-center text-white bg-green-600 hover:bg-green-700 shadow-md transition-all"
        >
          <FiPlus size={24} />
        </Button>
      }
    >
      <div className="space-y-6">
        <GoalProgress day={day} section="Insurance Agreements" color="green" />
        
        <div className="space-y-4">
          <AnimatePresence>
            {Object.keys(grouped).length === 0 && (
              <motion.p
                className="text-gray-400 dark:text-gray-500 text-center py-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                No sales added for this day.
              </motion.p>
            )}
            {Object.entries(grouped).map(([person, sold]) => (
              <motion.div
                key={person}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{person}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Chip 
                    color="green"
                    onClick={() => handleEdit(person, sold)}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <span>{sold} sold</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(person);
                      }}
                      className="ml-2 hover:text-red-500"
                    >
                      ×
                    </button>
                  </Chip>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <SectionModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingIndex(null);
          setFormData({ person: '', sold: 1 });
        }} 
        title="Add Insurance Agreement"
        color="green"
        onSubmit={handleSubmit}
        submitText={editingIndex !== null ? "Save Changes" : "Add Sale"}
        isEditing={editingIndex !== null}
      >
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Person
          </label>
          <div className="mt-1">
            <PersonSelect
              value={formData.person}
              onChange={(value) => setFormData({ ...formData, person: value })}
              label="Select person"
              people={people}
            />
          </div>
        </div>

        <div className="space-y-1">
          <NumberInput
            value={formData.sold}
            onChange={(value) => setFormData({ ...formData, sold: value })}
            min={1}
            label="Amount"
            helperText="Number of insurance agreements sold"
            required
          />
        </div>

        {editingIndex !== null && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => handleDelete(formData.person)}
              className="w-full px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete Entry
            </button>
          </div>
        )}
      </SectionModal>
    </Card>
  );
}  