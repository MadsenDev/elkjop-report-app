import { useState } from "react";
import useReportStore from "../store";
import { Day } from "../types";
import { motion, AnimatePresence } from "framer-motion";
import PersonSelect from "./PersonSelect";
import Card, { Chip, Button } from "./ui/Card";
import GoalProgress from "./GoalProgress";
import { WrenchIcon } from "@heroicons/react/24/outline";
import type { RepairTicket } from "../store";
import SectionModal from "./ui/SectionModal";
import NumberInput from "./ui/NumberInput";

interface RepairTicketsSectionProps {
  day: Day;
}

export default function RepairTicketsSection({ day }: RepairTicketsSectionProps) {
  const repairTickets = useReportStore((state) => state.repairTickets);
  const setRepairTicket = useReportStore((state) => state.setRepairTicket);
  const people = useReportStore((state) => state.people);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Form state
  const [formData, setFormData] = useState({
    person: "",
    created: 1,
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTicket = {
      day,
      person: formData.person,
      completed: formData.created,
    };

    if (editingIndex !== null) {
      // When editing, replace all existing tickets for this person with a single new ticket
      const filteredTickets = repairTickets.filter(t => t.person !== formData.person || t.day !== day);
      useReportStore.setState({ repairTickets: [...filteredTickets, newTicket] });
    } else {
      setRepairTicket(newTicket);
    }

    setIsModalOpen(false);
    setEditingIndex(null);
    setFormData({ person: "", created: 1 });
  };

  const handleEdit = (person: string, totalCount: number) => {
    // Find the first ticket for this person to use as the base for editing
    const firstTicketIndex = repairTickets.findIndex(t => t.person === person && t.day === day);
    if (firstTicketIndex === -1) return;

    setFormData({
      person,
      created: totalCount,
    });
    setEditingIndex(firstTicketIndex);
    setIsModalOpen(true);
  };

  const handleDelete = (person: string) => {
    const newTickets = repairTickets.filter(t => t.person !== person || t.day !== day);
    useReportStore.setState({ repairTickets: newTickets });
    setIsModalOpen(false);
    setEditingIndex(null);
  };

  const grouped = repairTickets
    .filter((t: RepairTicket) => t.day === day)
    .reduce<Record<string, { count: number }>>((acc, t) => {
      if (!acc[t.person]) {
        acc[t.person] = { count: 0 };
      }
      acc[t.person].count += t.completed;
      return acc;
    }, {});

  return (
    <Card
      title="Repair Tickets"
      color="orange"
      icon={<WrenchIcon className="w-6 h-6" />}
      description="Repair Tickets Created"
      action={
        <Button onClick={() => {
          setEditingIndex(null);
          setFormData({ person: "", created: 1 });
          setIsModalOpen(true);
        }} color="orange" aria-label="Add Ticket">
          +
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
            {Object.entries(grouped).map(([person, { count }]) => (
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
                    color="orange" 
                    onClick={() => handleEdit(person, count)}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <span>{count} created</span>
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
          setFormData({ person: "", created: 1 });
        }} 
        title="Repair Ticket"
        color="orange"
        onSubmit={handleSubmit}
        submitText={editingIndex !== null ? "Save Changes" : "Add Ticket"}
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
            value={formData.created}
            onChange={(value) => setFormData({ ...formData, created: value })}
            min={0}
            label="Created"
            helperText="Number of repair tickets created"
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