import React from 'react';
import { RealtimeFilterConfig, TableRow } from './types';
import { SelectInputUI } from '../SelectInput';
import { ButtonInputUI } from '../ButtonInput';
import { CalendarInputUI, CalendarRange } from '../CalendarInput';

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
    if (!rows || (rows.length === 0 && Object.keys(query).length === 0)) {
        return null;
    }

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
        <div className="table-filter-wrapper">
            <div className="table-filter">
                <span className="title">
                    <i className="adminfont-filter" />
                    Filter
                </span>

                {filters.map((filter) => {
                    const value = query[filter.key];

                    if (filter.type === 'date') {
                        const range =
                            (value as CalendarRange) || getDefaultDateRange();
                        return (
                            <div key={filter.key} className="group-field">
                                <CalendarInputUI
                                    value={range}
                                    onChange={(newRange) => {
                                        onFilterChange(
                                            filter.key,
                                            newRange as {
                                                startDate: Date;
                                                endDate: Date;
                                            }
                                        );
                                    }}
                                    format={format}
                                />
                            </div>
                        );
                    }

                    const options =
                        filter.options?.map((opt) => ({
                            label: opt.label,
                            value: String(opt.value),
                        })) || [];

                    return (
                        <div key={filter.key} className="group-field">
                            <SelectInputUI
                                type={
                                    filter.multiple
                                        ? 'multi-select'
                                        : 'single-select'
                                }
                                options={options}
                                value={value}
                                placeholder={`Select ${filter.label}`}
                                onChange={(selected) => {
                                    onFilterChange(filter.key, selected);
                                }}
                            />
                        </div>
                    );
                })}
            </div>
            {showResetButton && (
                <ButtonInputUI
                    buttons={{
                        text: 'Reset',
                        icon: 'refresh',
                        color: 'red',
                        onClick: onResetFilters,
                    }}
                />
            )}
        </div>
    );
};

export default RealtimeFilters;
