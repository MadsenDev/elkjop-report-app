import { useState, useEffect } from "react";
import useReportStore from "../store";
import { Day } from "../types";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "./Modal";
import PersonSelect from "./PersonSelect";
import Card, { Chip, Button } from "./ui/Card";
import GoalProgress from "./GoalProgress";
import { WrenchScrewdriverIcon } from "@heroicons/react/24/outline";
import type { RepairTicket } from "../store";

interface RepairTicketsSectionProps {
  day: Day;
}

export default function RepairTicketsSection({ day }: RepairTicketsSectionProps) {
  const repairTickets = useReportStore((state) => state.repairTickets);
  const setRepairTicket = useReportStore((state) => state.setRepairTicket);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Form state
  const [formData, setFormData] = useState({
    person: "",
    created: 1,
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
        setError('Kunne ikke laste people fra public/.');
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="text-gray-700 dark:text-gray-300">Loading people...</div>;
  if (error) return <div className="text-red-600 dark:text-red-400">{error}</div>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRepairTicket({
      day,
      person: formData.person,
      completed: formData.created,
    });
    setIsModalOpen(false);
    setFormData({ person: "", created: 1 });
  };

  const grouped = repairTickets
    .filter((t: RepairTicket) => t.day === day)
    .reduce<Record<string, number>>((acc, t) => {
      if (!acc[t.person]) {
        acc[t.person] = 0;
      }
      acc[t.person] += t.completed;
      return acc;
    }, {});

  return (
    <Card
      title="Repair Tickets"
      color="orange"
      icon={<WrenchScrewdriverIcon className="w-6 h-6" />}
      description="Repair Tickets Created"
      action={
        <Button onClick={() => setIsModalOpen(true)} color="orange">
          Add Ticket
        </Button>
      }
    >
      <div className="space-y-6">
        <GoalProgress day={day} section="RepairTickets" color="orange" />
        
        <div className="space-y-4">
          <AnimatePresence>
            {Object.keys(grouped).length === 0 && (
              <motion.p
                className="text-gray-400 dark:text-gray-500 text-center py-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                No tickets created for this day.
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
                  <Chip color="orange">
                    {count} created
                  </Chip>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Ticket">
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Created</label>
            <input
              type="number"
              min="0"
              value={formData.created}
              onChange={(e) => setFormData({ ...formData, created: parseInt(e.target.value) })}
              className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              onClick={() => setIsModalOpen(false)}
              color="orange"
              variant="outline"
            >
              Cancel
            </Button>
            <Button type="submit" color="orange">
              Add Ticket
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
}  