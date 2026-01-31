import React, { useEffect, useState, useRef, useCallback } from 'react';

export type SearchOption = {
  label: string;
  value: string | number;
};

export interface TableSearchProps {
  onSearch: (text: string, option?: string | number) => void;
  placeholder?: string;
  options?: SearchOption[];
  value?: string;
}

const TableSearch: React.FC<TableSearchProps> = ({
  onSearch,
  placeholder = 'Search…',
  options,
  value: controlledValue,
}) => {
  const [text, setText] = useState(controlledValue ?? '');
  const [selectedOption, setSelectedOption] = useState<string | number>('');

  const latestOnSearch = useRef(onSearch);
  latestOnSearch.current = onSearch;

  useEffect(() => {
    if (controlledValue !== undefined) {
      setText(controlledValue);
    }
  }, [controlledValue]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setText(value);
      latestOnSearch.current(value, selectedOption || undefined);
    },
    [selectedOption]
  );

  const handleOptionChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const option = e.target.value;
      setSelectedOption(option);
      latestOnSearch.current(text, option || undefined);
    },
    [text]
  );

  return (
    <>
      {options && options.length > 0 && (
        <div className="search-action">
          <select value={selectedOption} onChange={handleOptionChange}>
            <option value="">All</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="search-section">
        <input
          type="text"
          value={text}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="table-search-input"
        />
        <i className="adminfont-search" />
      </div>
    </>
  );
};

export default TableSearch;