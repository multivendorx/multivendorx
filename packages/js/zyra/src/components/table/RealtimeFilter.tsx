import React from 'react';
import Select from 'react-select';
import { RealtimeFilterConfig, TableRow } from './types';
import MultiCalendarInput from '../MultiCalendarInput';

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
    if (!rows || rows.length === 0 && Object.keys(query).length === 0) return null;

    const showResetButton = rows.length === 0 && Object.keys(query).length > 0;

    return (
        <div className="wrap-bulk-all-date filter">
            <span className="title">
                <i className="adminfont-filter"/>
                Filter
            </span>

            {filters.map((filter) => {
                const value = query[filter.key];

                // Date filter
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

                // React select options
                const options = filter.options?.map((opt) => ({ label: opt.label, value: opt.value })) || [];

                // Single select
                if (!filter.multiple) {
                    const selectedOption = options.find((o) => o.value === value) || null;
                    return (
                        <div key={filter.key} className="group-field">
                            <Select
                                options={options}
                                value={selectedOption}
                                onChange={(option) => onFilterChange(filter.key, option?.value || '')}
                                isClearable
                                placeholder={`Select ${filter.label}`}
                            />
                        </div>
                    );
                }

                // Multi-select
                const selectedOptions = options.filter((o) =>
                    Array.isArray(value) ? value.includes(o.value) : false
                );

                return (
                    <div key={filter.key} className="group-field">
                        <Select
                            options={options}
                            value={selectedOptions}
                            onChange={(option) => onFilterChange(filter.key, option.map((o) => o.value))}
                            isMulti
                            placeholder={`Select ${filter.label}`}
                        />
                    </div>
                );
            })}

            {/* Reset button */}
            {showResetButton && (
                <div className="reset-btn">
                    <button className="admin-badge red" onClick={onResetFilters}>
                        <i className="adminfont-refresh" />Reset
                    </button>
                </div>
            )}
        </div>
    );
};

export default RealtimeFilters;
