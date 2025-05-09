import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown } from 'react-icons/fa';

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  disabled?: boolean;
}

interface AccordionProps {
  items: AccordionItem[];
  defaultOpen?: string[];
  multiple?: boolean;
  onChange?: (openItems: string[]) => void;
  className?: string;
}

export default function Accordion({
  items,
  defaultOpen = [],
  multiple = false,
  onChange,
  className = '',
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>(defaultOpen);

  const handleItemClick = (itemId: string) => {
    const newOpenItems = multiple
      ? openItems.includes(itemId)
        ? openItems.filter((id) => id !== itemId)
        : [...openItems, itemId]
      : openItems.includes(itemId)
      ? []
      : [itemId];

    setOpenItems(newOpenItems);
    onChange?.(newOpenItems);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item) => (
        <div
          key={item.id}
          className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
        >
          <button
            onClick={() => !item.disabled && handleItemClick(item.id)}
            disabled={item.disabled}
            className={`
              w-full
              px-4
              py-3
              flex
              items-center
              justify-between
              text-left
              font-medium
              ${
                item.disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800'
              }
              ${
                openItems.includes(item.id)
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-900 dark:text-white'
              }
            `}
            aria-expanded={openItems.includes(item.id)}
          >
            {item.title}
            <FaChevronDown
              className={`
                w-5
                h-5
                transform
                transition-transform
                ${
                  openItems.includes(item.id)
                    ? 'rotate-180 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400'
                }
              `}
            />
          </button>
          <AnimatePresence>
            {openItems.includes(item.id) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  {item.content}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
} 