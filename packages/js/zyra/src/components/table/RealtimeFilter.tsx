import React, { useEffect } from 'react';
import { RealtimeFilterConfig, TableRow } from './types';
import { SelectInputUI } from '../SelectInput';
import { AdminButtonUI } from '../AdminButton';
import CalendarInput, { CalendarRange } from '../CalendarInput';

export type FilterValue =
    | string
    | string[]
    | {
        startDate: Date;
        endDate: Date;
    };

interface RealtimeFiltersProps {
    filters: RealtimeFilterConfig[];
    query: Record<string, FilterValue | undefined>;
    onFilterChange: (key: string, value: FilterValue) => void;
    rows: TableRow[][];
    onResetFilters: () => void;
    format?: string;
}

const RealtimeFilters: React.FC<RealtimeFiltersProps> = ({
    filters,
    query,
    onFilterChange,
    rows,
    onResetFilters,
    format,
}) => {
    useEffect(() => {
        filters.forEach((filter) => {
          if (filter.type === 'date' && !query[filter.key]) {
            const end = new Date();
            const start = new Date();
            start.setMonth(start.getMonth() - 1);
            onFilterChange(filter.key, {
              startDate: start,
              endDate: end,
            });
          }
        });
    }, []);
      
    if (!rows || (rows.length === 0 && Object.keys(query).length === 0)) return null;

    const showResetButton = Object.values(query || {}).some((value) =>
        Array.isArray(value) ? value.length : value
    );

    const getDefaultDateRange = (): CalendarRange => {
		const start = new Date();
		start.setMonth(start.getMonth() - 1);

		return {
			startDate: start,
			endDate: new Date(),
		};
	};

    return (
        <div className="wrap-bulk-all-date filter">
            <span className="title">
                <i className="adminfont-filter" />
                Filter
            </span>

            {filters.map((filter) => {
                const value = query[filter.key];

                if (filter.type === 'date') {
                    const range = value as CalendarRange;
                    return (
                      <div key={filter.key} className="group-field">
                        <CalendarInput
                          value={range}
                          onChange={(newRange) => {
                            onFilterChange(filter.key, newRange as { startDate: Date; endDate: Date });
                          }}
                          format={format}
                        />
                      </div>
                    );
                }                  

                const options = filter.options?.map((opt) => ({ 
                    label: opt.label, 
                    value: String(opt.value) 
                })) || [];

                return (
                    <div key={filter.key} className="group-field">
                        <SelectInputUI
                            options={options}
                            value={filter.multiple ? (value as string[]) : (value as string)}
                            placeholder={`Select ${filter.label}`}
                            multiple={filter.multiple}
                            onChange={(selected) => {
                                if (filter.multiple && Array.isArray(selected)) {
                                    onFilterChange(filter.key, selected.map(s => s.value));
                                } else if (!Array.isArray(selected)) {
                                    onFilterChange(filter.key, selected?.value || '');
                                }
                            }}
                        />
                    </div>
                );
            })}

            {showResetButton && (
                <div className="reset-btn">
                    <AdminButtonUI
                        buttons={{
                            text: "Reset",
                            icon: "refresh",
                            onClick: onResetFilters,
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default RealtimeFilters;