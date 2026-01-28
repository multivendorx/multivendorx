import React, { useEffect, useState, useRef, useCallback } from 'react';

export type SearchOption = {
  label: string;
  value: string | number;
};

export interface TableSearchProps {
  /** Called when user types or selects a value */
  onSearch: (text: string, option?: string | number) => void;
  /** Placeholder for the text input */
  placeholder?: string;
  /** Optional dropdown options */
  options?: SearchOption[];
  /** Optional debounce for input */
  debounce?: number;
  /** Optional controlled value */
  value?: string;
}

const TableSearch: React.FC<TableSearchProps> = ({
  onSearch,
  placeholder = 'Search…',
  options,
  debounce = 300,
  value: controlledValue,
}) => {
  const [text, setText] = useState(controlledValue ?? '');
  const [selectedOption, setSelectedOption] = useState<string | number>('');

  const latestOnSearch = useRef(onSearch);
  latestOnSearch.current = onSearch;

  // Update text if controlledValue changes
  useEffect(() => {
    if (controlledValue !== undefined) setText(controlledValue);
  }, [controlledValue]);

  // Debounced effect for search
  useEffect(() => {
    // Only run if text or option changes
    const handler = setTimeout(() => {
      latestOnSearch.current(text, selectedOption || undefined);
    }, debounce);

    return () => clearTimeout(handler);
  }, [text, selectedOption, debounce]);

  // Use stable callbacks to avoid unnecessary re-renders in parent
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setText(e.target.value);
    },
    []
  );

  const handleOptionChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedOption(e.target.value);
    },
    []
  );

  return (
    <div className="table-search">
      <div className="table-search-wrapper">
        <input
          type="text"
          value={text}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="table-search-input"
        />

        {options && options.length > 0 && (
          <select
            value={selectedOption}
            onChange={handleOptionChange}
            className="table-search-select"
          >
            <option value="">All</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
};

export default TableSearch;
