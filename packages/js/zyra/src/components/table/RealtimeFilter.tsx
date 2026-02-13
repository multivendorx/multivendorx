import React from 'react';
import { RealtimeFilterConfig, TableRow } from './types';
import MultiCalendarInput from '../MultiCalendarInput';
import { SelectInputUI } from '../SelectInput';
import { AdminButtonUI } from '../AdminButton';

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
}

const RealtimeFilters: React.FC<RealtimeFiltersProps> = ({
    filters,
    query,
    onFilterChange,
    rows,
    onResetFilters,
}) => {
    if (!rows || (rows.length === 0 && Object.keys(query).length === 0)) return null;

    const showResetButton = Object.values(query || {}).some((value) => {
        if (Array.isArray(value)) return value.length > 0;
        return value !== undefined && value !== null && value !== '';
    });

    return (
        <div className="wrap-bulk-all-date filter">
            <span className="title">
                <i className="adminfont-filter" />
                Filter
            </span>

            {filters.map((filter) => {
                const value = query[filter.key];

                if (filter.type === 'date') {
                    return (
                        <div key={filter.key} className="group-field">
                            <MultiCalendarInput
                                value={value as { startDate: Date; endDate: Date } | undefined}
                                onChange={(range) => onFilterChange(filter.key, range)}
                                showLabel
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