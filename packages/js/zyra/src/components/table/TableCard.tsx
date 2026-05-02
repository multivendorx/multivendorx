import React, { Fragment, useEffect, useState } from 'react';
import Table from './table';
import Pagination from './Pagination';
import { QueryProps, TableCardProps } from './types';
import BulkActionDropdown from './BulkActionDropdown';
import RealtimeFilters from './RealtimeFilter';
import ButtonActions from './ButtonActions';
import HeaderSearch from '../HeaderSearch';
import Skeleton from '../UI/Skeleton';
import { PopupUI } from '../Popup';
import '../../styles/web/Table.scss';
import { ItemListUI } from '../ItemList';

// Category item interface
export interface CategoryItem {
    label: string;
    value: string;
    count: number;
}

/**
 * Pure React TableCard
 */
const TableCard: React.FC<TableCardProps> = ({
    className = '',
    search,
    headers = {},
    ids = [],
    isLoading = false,
    onColumnsChange,
    onSort,
    bulkActions = [],
    onBulkActionApply,
    rows = [],
    showMenu = true,
    summary,
    title,
    totalRows = 0,
    categoryCounts = [],
    activeCategory = 'all',
    languageFilterCounts = [],
    activeLanguageFilter = 'all',
    filters = [],
    showColumnToggleIcon = true,
    onSelectCsvDownloadApply,
    onCellEdit,
    buttonActions,
    format,
    currency,
    ...props
}) => {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [derivedTotalRows, setDerivedTotalRows] = useState<number>(totalRows);

    const [query, setQuery] = useState<QueryProps>({
        orderby: '',
        order: 'desc',
        paged: 1,
        per_page: 10,
        filter: {},
        categoryFilter: activeCategory,
        languageFilter: activeLanguageFilter,
    });
    /**
     * TableCard query handler
     */
    const onQueryChange =
        (param: string) => (value?: string, direction?: string) => {
            setQuery((prev) => ({
                ...prev,
                [param]:
                    param === 'paged' || param === 'per_page'
                        ? Number(value)
                        : value,
                order: param === 'sort' ? direction : prev.order,
                orderby: param === 'sort' ? value : prev.orderby,
            }));
        };

    const onFilterChange = (
        key: string,
        value: string | string[] | { startDate: Date; endDate: Date }
    ) => {
        setQuery((prev) => ({
            ...prev,
            paged: 1, // reset to first page
            filter: {
                ...prev.filter,
                [key]: value,
            },
        }));
    };

    // Handle category change
    const handleCategoryChange = (value: string) => {
        // Safely find the selected category to update total rows
        if (categoryCounts && Array.isArray(categoryCounts)) {
            const selectedCategory = categoryCounts.find(
                (cat) => cat && cat.value === value
            );
            setDerivedTotalRows(selectedCategory?.count ?? 0);
        }

        setQuery((prev) => ({
            ...prev,
            paged: 1, // Reset to first page when category changes
            categoryFilter: value,
        }));
    };
    const handleLanguageChange = (value: string) => {
        setQuery((prev) => ({
            ...prev,
            paged: 1,
            languageFilter: value,
        }));
    };
    const visibleCategories = React.useMemo(() => {
        if (!categoryCounts || !Array.isArray(categoryCounts)) {
            return [];
        }
        return categoryCounts.filter((cat) => cat && cat.count > 0);
    }, [categoryCounts]);
    const visibleLanguages = React.useMemo(() => {
        if (!languageFilterCounts || !Array.isArray(languageFilterCounts)) {
            return [];
        }
        return languageFilterCounts.filter((lang) => lang && lang.count > 0);
    }, [languageFilterCounts]);
    useEffect(() => {
        props.onQueryUpdate?.(query);
    }, [query]);

    useEffect(() => {
        setDerivedTotalRows(totalRows);
    }, [totalRows]);

    // Toggle single row
    const handleSelectRow = (id: number, selected: boolean) => {
        setSelectedIds((prev) =>
            selected ? [...prev, id] : prev.filter((x) => x !== id)
        );
    };

    // Toggle all rows
    const handleSelectAll = (selected: boolean) => {
        setSelectedIds(selected ? [...ids] : []);
    };

    // Handle bulk action apply
    const handleBulkApply = (action: string) => {
        onBulkActionApply?.(action, selectedIds);
        setSelectedIds([]);
    };
    /**
     * Determine default visible columns
     */
    const getShowCols = (headersObj: TableCardProps['headers'] = {}) => {
        return (
            Object.entries(headersObj)
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .filter(([_, config]) => config.visible !== false)
                .map(([key]) => key)
        );
    };

    const [showCols, setShowCols] = useState<string[]>(getShowCols(headers));

    /**
     * Toggle column visibility
     */
    const onColumnToggle = (key: string) => {
        const isVisible = showCols.includes(key);
        let updated: string[];

        if (isVisible) {
            if (showCols.length <= 1) {
                return;
            } // don't hide last column

            // Reset sorting if hiding currently sorted column
            if (query.orderby === key) {
                const defaultSort = Object.entries(headers).find(
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    ([_, config]) => config.defaultSort
                );

                if (defaultSort) {
                    onQueryChange('sort')(defaultSort[0], 'desc');
                }
            }

            updated = showCols.filter((c) => c !== key);
        } else {
            updated = [...showCols, key];
        }

        setShowCols(updated);
        onColumnsChange?.(updated, key);
    };

    /**
     * Pagination handler
     */
    const onPageChange = (
        newPage: number,
        direction?: 'previous' | 'next' | 'goto'
    ) => {
        props.onPageChange?.(newPage, direction);
        onQueryChange('paged')(String(newPage), direction);
    };

    /**
     * Derived visible headers & rows
     */
    const visibleHeaders = Object.entries(headers)
        .filter(
            ([key, config]) =>
                showCols.includes(key) && config.tableDisplay !== false // only include if table !== false (default true)
        )
        .map(([key, { ...rest }]) => ({
            key,
            ...rest, // spread everything else except csv and table
        }));

    return (
        <div className={`admin-table-wrapper ${className}`}>
            {/* HEADER */}
            {title && (
                <div className="table-card-header">
                    <div className="title">{title}</div>
                </div>
            )}

            {/* BODY */}
            {(visibleCategories.length > 0 ||
                buttonActions ||
                search ||
                (showMenu && showColumnToggleIcon)) && (
                <div className="admin-top-filter">
                    {/* Category Filter - Integrated directly (was CategoryFilter component) */}
                    {(visibleCategories.length > 0 ||
                        visibleLanguages.length > 0) && (
                        <>
                            <div className="filter-wrapper">
                                {visibleCategories.length > 0 && (
                                    <div className="filters category">
                                        {visibleCategories.map(
                                            ({ label, value, count }) => (
                                                <div
                                                    key={value}
                                                    className={`filter-item ${
                                                        (query.categoryFilter ||
                                                            activeCategory) === value
                                                            ? 'active'
                                                            : ''
                                                    }`}
                                                    onClick={() =>
                                                        handleCategoryChange(value)
                                                    }
                                                >
                                                    {label} ({count})
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                                {visibleLanguages.length > 0 && (
                                    <div className="filter language">
                                        {visibleLanguages.map(
                                            ({ label, value, count }) => (
                                                <div
                                                    key={value}
                                                    className={`filter-item ${
                                                        (query.languageFilter ||
                                                            activeLanguageFilter) ===
                                                        value
                                                            ? 'active'
                                                            : ''
                                                    }`}
                                                    onClick={() =>
                                                        handleLanguageChange(value)
                                                    }
                                                >
                                                    {label} ({count})
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="table-action-wrapper">
                                {buttonActions && (
                                    <ButtonActions
                                        actions={buttonActions}
                                        query={query}
                                    />
                                )}
                                {search && (
                                    <HeaderSearch
                                        search={{
                                            placeholder: search.placeholder,
                                            options: search.options,
                                        }}
                                        width={search.size}
                                        onQueryUpdate={(payload) => {
                                            onQueryChange('searchValue')(
                                                payload.searchValue
                                            );
                                            if ('searchAction' in payload) {
                                                onQueryChange('searchAction')(
                                                    String(payload.searchAction)
                                                );
                                            }
                                        }}
                                    />
                                )}
                                {showMenu && showColumnToggleIcon && (
                                    <PopupUI
                                        position="menu-dropdown"
                                        toggleIcon="more-vertical"
                                        tooltipName="Manage display"
                                        tooltipPosition="end"
                                    >
                                        <ItemListUI
                                            className="default table-menu"
                                            items={Object.entries(headers)
                                                .filter(
                                                    ([_, config]) => !config.required
                                                )
                                                .map(([key, config]) => ({
                                                    id: key,
                                                    title: config.label,
                                                    action: () => onColumnToggle(key),
                                                    tags: (
                                                        <input
                                                            type="checkbox"
                                                            checked={showCols.includes(
                                                                key
                                                            )}
                                                            onChange={(e) => {
                                                                e.stopPropagation();
                                                                onColumnToggle(key);
                                                            }}
                                                        />
                                                    ),
                                                }))}
                                        />
                                    </PopupUI>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}

            <Table
                rows={rows}
                headers={visibleHeaders}
                // caption={title}
                query={query}
                onSort={
                    onSort ||
                    (onQueryChange('sort') as (
                        key: string,
                        direction: string
                    ) => void)
                }
                ids={ids}
                selectedIds={selectedIds}
                onSelectRow={handleSelectRow}
                onSelectAll={handleSelectAll}
                onCellEdit={onCellEdit}
                enableBulkSelect={
                    bulkActions.length > 0 || !!onSelectCsvDownloadApply
                }
                isLoading={isLoading}
                format={format}
                currency={currency}
            />
            {/* pagination */}
            {derivedTotalRows > 0 && (
                <div className="admin-pagination">
                    {isLoading ? (
                        <Skeleton width="100%" />
                    ) : (
                        <Fragment>
                            <Pagination
                                page={Number(query.paged)}
                                perPage={Number(query.per_page)}
                                total={derivedTotalRows}
                                onPageChange={onPageChange}
                                onPerPageChange={(perPage) =>
                                    onQueryChange('per_page')(String(perPage))
                                }
                            />

                            {summary && (
                                <ul
                                    className="table-summary"
                                    role="complementary"
                                >
                                    {summary.map(({ label, value }, i) => (
                                        <li
                                            className="table-summary-item"
                                            key={i}
                                        >
                                            <span className="table-summary-value">
                                                {value}
                                            </span>
                                            <span className="table-summary-label">
                                                {label}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Fragment>
                    )}
                </div>
            )}

            <div className="filter-wrapper">
                {selectedIds.length <= 1 && filters.length > 0 && (
                    <RealtimeFilters
                        filters={filters}
                        query={query.filter || {}}
                        onFilterChange={onFilterChange}
                        rows={rows}
                        onResetFilters={() =>
                            setQuery((prev) => ({
                                ...prev,
                                filter: {},
                                paged: 1,
                            }))
                        }
                        format={format}
                    />
                )}

                {selectedIds.length > 1 &&
                    (bulkActions.length > 0 || onSelectCsvDownloadApply) && (
                        <BulkActionDropdown
                            actions={bulkActions}
                            selectedIds={selectedIds}
                            onApply={handleBulkApply}
                            onClearSelection={() => setSelectedIds([])}
                            onSelectCsvDownloadApply={onSelectCsvDownloadApply}
                            totalIds={ids}
                            onToggleSelectAll={(select) =>
                                setSelectedIds(select ? [...ids] : [])
                            }
                            showDropdown={bulkActions.length > 0}
                        />
                    )}
            </div>
        </div>
    );
};

export default TableCard;
