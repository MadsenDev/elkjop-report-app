import { useState, useEffect } from 'react';
import useReportStore from '../store';
import { Day } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import PersonSelect from './PersonSelect';
import Card, { Chip, Button } from './ui/Card';
import GoalProgress from './GoalProgress';
import { FaShieldAlt } from 'react-icons/fa';

interface InsuranceAgreementSectionProps {
  day: Day;
}

export default function InsuranceAgreementSection({ day }: InsuranceAgreementSectionProps) {
  const insuranceAgreements = useReportStore((state) => state.insuranceAgreements);
  const setInsuranceAgreement = useReportStore((state) => state.setInsuranceAgreement);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Form state
  const [formData, setFormData] = useState({
    person: '',
    sold: 1,
  });

  const [peopleData, setPeopleData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/people.json');
        if (!res.ok) throw new Error('Failed to fetch people');
        setPeopleData(await res.json());
        setLoading(false);
      } catch (e) {
        setError('Could not load people from public/.');
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInsuranceAgreement({
      day,
      person: formData.person,
      sold: formData.sold,
    });
    setIsModalOpen(false);
    setFormData({ person: '', sold: 1 });
  };

  const grouped = insuranceAgreements
    .filter((t) => t.day === day)
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.person] = (acc[t.person] || 0) + t.sold;
      return acc;
    }, {});

  if (loading) return <div className="text-gray-700 dark:text-gray-300">Loading people...</div>;
  if (error) return <div className="text-red-600 dark:text-red-400">{error}</div>;

  return (
    <Card
      title="Insurance Agreements"
      color="green"
      icon={<FaShieldAlt />}
      description="Insurance Agreement Sales"
      action={
        <Button onClick={() => setIsModalOpen(true)} color="green">
          Add Sale
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
                  <Chip color="green">
                    {sold} sold
                  </Chip>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Add Insurance Agreement Sale</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Person
                </label>
                <div className="mt-1">
                  <PersonSelect
                    value={formData.person}
                    onChange={(value) => setFormData({ ...formData, person: value })}
                    label="Select person"
                    people={peopleData}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sold
                </label>
                <input
                  type="number"
                  value={formData.sold}
                  onChange={(e) =>
                    setFormData({ ...formData, sold: parseInt(e.target.value) })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  min="1"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  color="green"
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="green"
                >
                  Add
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
}  