import { useState, useMemo } from 'react';
import { Service } from '../store';
import useReportStore from '../store';
import { db } from '../services/db';
import Button from './ui/Button';
import Input from './ui/Input';

export default function SettingsServicesTab() {
  const { services, loadServices } = useReportStore();
  const [localServices, setLocalServices] = useState<Service[]>(services);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleServiceChange = (idx: number, field: keyof Service, value: string | number) => {
    const newServices = [...localServices];
    newServices[idx] = { ...newServices[idx], [field]: value };
    setLocalServices(newServices);
  };

  const handleAddService = () => {
    setLocalServices([
      { id: '', price: 0, cost: 0 },
      ...localServices
    ]);
  };

  const handleDeleteService = (idx: number) => {
    setLocalServices(localServices.filter((_, i) => i !== idx));
  };

  const handleSaveServices = async () => {
    try {
      setIsSaving(true);
      await db.setServices(localServices);
      await loadServices(); // Reload to ensure sync
    } catch (error) {
      console.error('Failed to save services:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredServices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return localServices.map((s, idx) => ({ service: s, idx }));

    return localServices
      .map((s, idx) => ({ service: s, idx }))
      .filter(({ service }) => {
        const id = (service.id ?? '').toString().toLowerCase();
        const price = Number.isFinite(service.price) ? String(service.price) : '';
        const cost = Number.isFinite(service.cost) ? String(service.cost) : '';
        return (
          id.includes(query) ||
          price.includes(query) ||
          cost.includes(query)
        );
      });
  }, [localServices, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Sticky header with title and actions */}
      <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 pb-4 -mx-6 px-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Services Management</h2>
          <div className="flex items-center gap-4">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search (id, price, cost)"
              className="bg-gray-50 dark:bg-gray-900 w-64"
            />
            <Button
              onClick={handleSaveServices}
              color="green"
              className="px-6"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              onClick={handleAddService}
              color="gray"
              variant="outline"
              className="flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Service
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {/* Column Headers */}
          <div className="p-4 grid grid-cols-12 gap-4 border-b border-gray-200 dark:border-gray-700">
            <div className="col-span-5">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Article</span>
            </div>
            <div className="col-span-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Price</span>
            </div>
            <div className="col-span-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cost</span>
            </div>
          </div>
          {filteredServices.map(({ service, idx }) => (
            <div key={idx} className="p-4 flex items-center gap-4">
              <div className="flex-1 grid grid-cols-12 gap-4">
                <div className="col-span-5">
                  <Input
                    type="text"
                    value={service.id}
                    onChange={(e) => handleServiceChange(idx, 'id', e.target.value)}
                    placeholder="ID"
                    className="bg-gray-50 dark:bg-gray-900"
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    value={service.price}
                    onChange={(e) => handleServiceChange(idx, 'price', parseFloat(e.target.value))}
                    placeholder="Price"
                    className="bg-gray-50 dark:bg-gray-900"
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    value={service.cost}
                    onChange={(e) => handleServiceChange(idx, 'cost', parseFloat(e.target.value))}
                    placeholder="Cost"
                    className="bg-gray-50 dark:bg-gray-900"
                  />
                </div>
              </div>
              <Button
                onClick={() => handleDeleteService(idx)}
                color="red"
                variant="ghost"
                className="p-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 