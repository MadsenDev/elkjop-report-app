import { useState, useEffect } from "react";
import useReportStore from "../store";
import { Day } from "../types";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "./Modal";
import PersonSelect from "./PersonSelect";
import Card, { Chip, Button } from "./ui/Card";
import GoalProgress from "./GoalProgress";
import type { PrecalibratedTVCompletion } from "../store";
import { FaTv } from "react-icons/fa";

interface PrecalibratedTVSectionProps {
  day: Day;
}

export default function PrecalibratedTVSection({ day }: PrecalibratedTVSectionProps) {
  const precalibratedTVs = useReportStore((state) => state.precalibratedTVs);
  const setPrecalibratedTV = useReportStore((state) => state.setPrecalibratedTV);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Form state
  const [formData, setFormData] = useState({
    person: '',
    completed: 1,
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
    if (!formData.person) return;

    setPrecalibratedTV({
      day,
      person: formData.person,
      completed: formData.completed,
    });

    setFormData({
      person: '',
      completed: 1,
    });
    setIsModalOpen(false);
  };

  const grouped = precalibratedTVs
    .filter((t: PrecalibratedTVCompletion) => t.day === day)
    .reduce<Record<string, number>>((acc, t) => {
      if (!acc[t.person]) {
        acc[t.person] = 0;
      }
      acc[t.person] += t.completed;
      return acc;
    }, {});

  if (loading) return <div className="text-gray-700 dark:text-gray-300">Loading people...</div>;
  if (error) return <div className="text-red-600 dark:text-red-400">{error}</div>;

  return (
    <Card
      title="Precalibrated TVs"
      color="purple"
      icon={<FaTv />}
      description="TV Setup Completions"
      action={
        <Button onClick={() => setIsModalOpen(true)} color="purple">
          Add Completion
        </Button>
      }
    >
      <div className="space-y-6">
        <GoalProgress day={day} section="Precalibrated TVs" color="purple" />
        
        <div className="space-y-4">
          <AnimatePresence>
            {Object.keys(grouped).length === 0 && (
              <motion.p
                className="text-gray-400 dark:text-gray-500 text-center py-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                No completions added for this day.
              </motion.p>
            )}
            {Object.entries(grouped).map(([person, count]) => (
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
                  <Chip color="purple">
                    {count} completed
                  </Chip>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Completion">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Person</label>
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Completed</label>
            <input
              type="number"
              min="0"
              value={formData.completed}
              onChange={(e) => setFormData({ ...formData, completed: parseInt(e.target.value) })}
              className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              onClick={() => setIsModalOpen(false)}
              color="purple"
              variant="outline"
            >
              Cancel
            </Button>
            <Button type="submit" color="purple">
              Add Completion
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
}  