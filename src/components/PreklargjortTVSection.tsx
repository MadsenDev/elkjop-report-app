import { useState, useEffect } from "react";
import useReportStore from "../store";
import { Day } from "../types";
import { motion, AnimatePresence } from "framer-motion";
import PersonSelect from "./PersonSelect";
import Card, { Chip, Button } from "./ui/Card";
import GoalProgress from "./GoalProgress";
import type { PrecalibratedTVCompletion } from "../store";
import { FaTv } from "react-icons/fa";
import SectionModal from './ui/SectionModal';

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
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

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

    const newCompletion = {
      day,
      person: formData.person,
      completed: formData.completed,
    };

    if (editingIndex !== null) {
      // When editing, replace all existing completions for this person with a single new one
      const filteredCompletions = precalibratedTVs.filter(c => c.person !== formData.person || c.day !== day);
      useReportStore.setState({ precalibratedTVs: [...filteredCompletions, newCompletion] });
    } else {
      setPrecalibratedTV(newCompletion);
    }

    setFormData({
      person: '',
      completed: 1,
    });
    setIsModalOpen(false);
    setEditingIndex(null);
  };

  const handleEdit = (person: string, totalCompleted: number) => {
    // Find the first completion for this person to use as the base for editing
    const firstCompletionIndex = precalibratedTVs.findIndex(c => c.person === person && c.day === day);
    if (firstCompletionIndex === -1) return;

    setFormData({
      person,
      completed: totalCompleted,
    });
    setEditingIndex(firstCompletionIndex);
    setIsModalOpen(true);
  };

  const handleDelete = (person: string) => {
    const newCompletions = precalibratedTVs.filter(c => c.person !== person || c.day !== day);
    useReportStore.setState({ precalibratedTVs: newCompletions });
    setIsModalOpen(false);
    setEditingIndex(null);
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
        <Button onClick={() => {
          setEditingIndex(null);
          setFormData({ person: '', completed: 1 });
          setIsModalOpen(true);
        }} color="purple">
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
                  <Chip 
                    color="purple"
                    onClick={() => handleEdit(person, count)}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <span>{count} completed</span>
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
          setFormData({ person: '', completed: 1 });
        }} 
        title="Add Completion"
        color="purple"
        onSubmit={handleSubmit}
        submitText={editingIndex !== null ? "Save Changes" : "Add Completion"}
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
              people={peopleData}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Completed
          </label>
          <div className="mt-1">
            <input
              type="number"
              min="0"
              value={formData.completed}
              onChange={(e) => setFormData({ ...formData, completed: parseInt(e.target.value) })}
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white sm:text-sm transition-colors"
              required
            />
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Number of TV setups completed
          </p>
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