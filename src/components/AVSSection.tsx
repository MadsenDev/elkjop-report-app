import { useState } from "react";
import useReportStore from "../store";
import { Day } from "../types";
import { motion, AnimatePresence } from "framer-motion";
import PersonSelect from "./PersonSelect";
import Card, { Chip, Button } from "./ui/Card";
import { formatCurrency } from "../utils/format";
import { calculateGrossMargin } from "../utils/grossMargin";
import GoalProgress from "./GoalProgress";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import type { AVSAssignment } from "../store";
import ServiceSelect from "./ServiceSelect";
import SectionModal from './ui/SectionModal';
import NumberInput from './ui/NumberInput';

interface AVSSectionProps {
  day: Day;
}

interface FormData {
  person: string;
  serviceId: string;
  priceOverride: string;
}

export default function AVSSection({ day }: AVSSectionProps) {
  const avsAssignments = useReportStore((state) => state.avsAssignments);
  const setAVSAssignment = useReportStore((state) => state.setAVSAssignment);
  const editAVSAssignment = useReportStore((state) => state.editAVSAssignment);
  const services = useReportStore((state) => state.services);
  const people = useReportStore((state) => state.people);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    person: '',
    serviceId: '',
    priceOverride: ''
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const service = services.find((s) => s.id === formData.serviceId);
    if (service) {
      const price = formData.priceOverride ? parseFloat(formData.priceOverride) : service.price;
      const { gm } = calculateGrossMargin(service.cost, price);

      const newAssignment = {
        day,
        person: formData.person,
        serviceId: formData.serviceId,
        sold: 1,
        price,
        gm,
      };

      if (editingIndex !== null) {
        editAVSAssignment(editingIndex, newAssignment);
      } else {
        setAVSAssignment(newAssignment);
      }

      setIsModalOpen(false);
      setEditingIndex(null);
      setFormData({
        person: '',
        serviceId: '',
        priceOverride: ''
      });
    }
  };

  const handleEdit = (index: number) => {
    const assignment = avsAssignments[index];
    const service = services.find(s => s.id === assignment.serviceId);
    if (!service) return;

    setFormData({
      person: assignment.person,
      serviceId: assignment.serviceId,
      priceOverride: assignment.price !== service.price ? assignment.price.toString() : '',
    });
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  const handleDelete = (index: number) => {
    const newAssignments = avsAssignments.filter((_, i) => i !== index);
    useReportStore.setState({ avsAssignments: newAssignments });
    setIsModalOpen(false);
    setEditingIndex(null);
  };

  const grouped = avsAssignments
    .filter((a: AVSAssignment) => a.day === day)
    .reduce<Record<string, { serviceId: string; sold: number; price: number; gm: number; index: number }[]>>((acc, a) => {
      if (!acc[a.person]) {
        acc[a.person] = [];
      }
      const actualIndex = avsAssignments.findIndex(assignment => 
        assignment.day === a.day && 
        assignment.person === a.person && 
        assignment.serviceId === a.serviceId
      );
      acc[a.person].push({
        serviceId: a.serviceId,
        sold: a.sold,
        price: a.price,
        gm: a.gm,
        index: actualIndex,
      });
      return acc;
    }, {});

  return (
    <Card
      title="AVS"
      color="blue"
      icon={<CurrencyDollarIcon className="w-6 h-6" />}
      description="Additional Value Services"
      action={
        <Button onClick={() => {
          setEditingIndex(null);
          setFormData({
            person: '',
            serviceId: '',
            priceOverride: ''
          });
          setIsModalOpen(true);
        }} color="blue">
          Add Service
        </Button>
      }
    >
      <div className="space-y-6">
        <GoalProgress day={day} section="AVS" color="blue" />
        
        <div className="space-y-4">
          <AnimatePresence>
            {Object.keys(grouped).length === 0 && (
              <motion.p
                className="text-gray-400 dark:text-gray-500 text-center py-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                No services added for this day.
              </motion.p>
            )}
            {Object.entries(grouped).map(([person, personServices]) => (
              <motion.div
                key={person}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">{person}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  <AnimatePresence>
                    {personServices.map((service) => {
                      const serviceDetails = services.find((s) => s.id === service.serviceId);
                      return (
                        <Chip 
                          key={service.serviceId} 
                          color="blue"
                          onClick={() => handleEdit(service.index)}
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          <span>{serviceDetails?.name} ({formatCurrency(service.gm)})</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(service.index);
                            }}
                            className="ml-2 hover:text-red-500"
                          >
                            ×
                          </button>
                        </Chip>
                      );
                    })}
                  </AnimatePresence>
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
          setFormData({
            person: '',
            serviceId: '',
            priceOverride: ''
          });
        }} 
        title="Add Service"
        color="blue"
        onSubmit={handleSubmit}
        submitText={editingIndex !== null ? "Save Changes" : "Add Service"}
        isEditing={editingIndex !== null}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Person</label>
          <div className="mt-1">
            <PersonSelect
              value={formData.person}
              onChange={(value) => setFormData({ ...formData, person: value })}
              label="Select person"
              people={people}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Service</label>
          <ServiceSelect
            value={formData.serviceId}
            onChange={(serviceId) => setFormData({ ...formData, serviceId })}
            label="Select a service"
            services={services}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price Override (optional)</label>
          <NumberInput
            value={formData.priceOverride ? parseFloat(formData.priceOverride) : 0}
            onChange={(value) => setFormData({ ...formData, priceOverride: value.toString() })}
            min={0}
            step={0.01}
            helperText="Leave empty to use default price"
          />
        </div>

        {editingIndex !== null && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => handleDelete(editingIndex)}
              className="w-full px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete Service
            </button>
          </div>
        )}
      </SectionModal>
    </Card>
  );
}  