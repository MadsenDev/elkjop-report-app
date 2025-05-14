import { Fragment, useState } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

interface Person {
  code: string;
  firstName: string;
  lastName: string;
}

interface PersonSelectProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  people: Person[];
}

export default function PersonSelect({ value, onChange, label = 'Select Person', people }: PersonSelectProps) {
  const [query, setQuery] = useState('');
  
  console.log('PersonSelect received people:', people);

  const filteredPeople =
    query === ''
      ? people
      : people.filter((person) =>
          `${person.code} ${person.firstName} ${person.lastName}`
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(query.toLowerCase().replace(/\s+/g, ''))
        );

  return (
    <div className="relative">
      <Combobox value={value} onChange={onChange}>
        <div className="relative">
          <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left border border-gray-300 dark:border-gray-600 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
            <Combobox.Input
              className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 dark:text-white focus:ring-0 bg-transparent"
              displayValue={(value: string) => {
                const person = people.find((p) => p.code === value);
                return person ? `${person.code} - ${person.firstName} ${person.lastName}` : '';
              }}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={label}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
            </Combobox.Button>
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery('')}
          >
            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {filteredPeople.length === 0 && query !== '' ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-300">
                  Nothing found.
                </div>
              ) : (
                filteredPeople.map((person) => (
                  <Combobox.Option
                    key={person.code}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? 'bg-blue-600 text-white' : 'text-gray-900 dark:text-gray-100'
                      }`
                    }
                    value={person.code}
                  >
                    {({ selected, active }) => (
                      <>
                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                          {person.code} - {person.firstName} {person.lastName}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? 'text-white' : 'text-blue-600 dark:text-blue-400'
                            }`}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
    </div>
  );
} 