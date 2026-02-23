import React, {
    Fragment,
    useEffect,
    useRef,
    useState,
    useMemo,
    useCallback,
} from 'react';
import { TableProps } from './types';
import TableRowActions from './TableRowActions';
import { renderCell } from './Utill';
import { EditableCell } from './renderEditableCell';
import Skeleton from '../UI/Skeleton';
import ComponentStatusView from '../UI/ComponentStatusView';

const ASC = 'asc';
const DESC = 'desc';

const Table: React.FC<TableProps> = ({
    headers = {},
    rows = [],
    caption,
    className,
    onSort = () => { },
    query = {},
    ids = [],
    selectedIds = [],
    onSelectRow,
    onSelectAll,
    classNames,
    onCellEdit,
    isLoading,
    enableBulkSelect = false,
    format,
    currency
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const [isScrollableRight, setIsScrollableRight] = useState(false);
    const [isScrollableLeft, setIsScrollableLeft] = useState(false);
    const sortedBy = useMemo(() => {
        if (query.orderby) return query.orderby;

        const defaultHeader = Object.entries(headers).find(
            ([, config]) => config.defaultSort
        );

        return defaultHeader?.[0];
    }, [query.orderby, headers]);

    const sortDir = useMemo(() => {
        if (query.order) return query.order;

        const currentHeader = Object.entries(headers).find(
            ([key]) => key === sortedBy
        );

        return currentHeader?.[1]?.defaultOrder ?? DESC;
    }, [query.order, headers, sortedBy]);


    const hasData = rows.length > 0;

    const allSelected = useMemo(
        () => ids.length > 0 && ids.every((id) => selectedIds.includes(id)),
        [ids, selectedIds]
    );

    const tabIndex = isScrollableLeft || isScrollableRight ? 0 : null;

    const updateScrollState = useCallback(() => {
        const el = containerRef.current;
        if (!el) return;

        const { scrollLeft, scrollWidth, clientWidth } = el;
        const scrollable = scrollWidth > clientWidth;

        if (!scrollable) {
            setIsScrollableLeft(false);
            setIsScrollableRight(false);
            return;
        }

        setIsScrollableLeft(scrollLeft > 0);
        setIsScrollableRight(scrollLeft + clientWidth < scrollWidth);
    }, []);

    useEffect(() => {
        updateScrollState();

        const onResize = () => requestAnimationFrame(updateScrollState);

        window.addEventListener('resize', onResize);

        return () => window.removeEventListener('resize', onResize);
    }, [headers, rows, updateScrollState]);

    const handleSort = useCallback(
        (key: string) => {
            let direction = DESC;

            if (sortedBy === key) {
                direction = sortDir === ASC ? DESC : ASC;
            }

            onSort(key, direction);
        },
        [sortedBy, sortDir, onSort]
    );

    const toggleAllRows = useCallback(() => {
        onSelectAll?.(!allSelected);
    }, [allSelected, onSelectAll]);

    const toggleRow = useCallback(
        (index: number) => {
            const id = ids[index];
            const isSelected = selectedIds.includes(id);

            onSelectRow?.(id, !isSelected);
        },
        [ids, selectedIds, onSelectRow]
    );

    const getSortIcon = (isSorted: boolean) => {
        if (!isSorted) {
            return (
                <i className="adminfont-arrow-down-up sort-icon" />
            );
        }
        return (
            <i className={`adminfont-${sortDir === ASC ? 'arrow-up' : 'arrow-down'} sort-icon`} />
        );
    };

    return (
        <div
            ref={containerRef}
            className={`table-wrapper ${classNames}`}
            tabIndex={tabIndex}
            role="group"
            onScroll={updateScrollState}
        >
            <table className="admin-table">
                {caption && (
                    <caption className="table-caption screen-reader-only">
                        {caption}
                        {tabIndex === 0 && <small>(scroll to see more)</small>}
                    </caption>
                )}

                <thead className="admin-table-header">
                    <tr className="header-row">
                        {enableBulkSelect && (
                            <th className="header-col select">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={toggleAllRows}
                                />
                            </th>
                        )}

                        {Object.entries(headers).map(([key, config], i) => {
                            const {
                                label,
                                isSortable,
                                isNumeric,
                                screenReaderLabel,
                            } = config;

                            const isSorted = sortedBy === key;

                            const thClass = [
                                'header-col',
                                isSortable && 'sortable',
                                isSorted && 'sorted',
                                isNumeric && 'numeric',
                                config.type && config.type
                            ]
                                .filter(Boolean)
                                .join(' ');

                            return (
                                <th
                                    key={key || i}
                                    className={thClass}
                                    aria-sort={
                                        isSortable && isSorted
                                            ? sortDir === ASC
                                                ? 'ascending'
                                                : 'descending'
                                            : null
                                    }
                                    style={config.width ? { minWidth: `${config.width}rem` } : {}}
                                >
                                    {isSortable ? (
                                        <div
                                            onClick={
                                                hasData
                                                    ? () => handleSort(config.key)
                                                    : null
                                            }
                                            className="sort-button"
                                        >
                                            {label}
                                            {getSortIcon(isSorted)}
                                        </div>
                                    ) : (
                                        <Fragment>
                                            {label}
                                            {screenReaderLabel && (
                                                <span className="screen-reader-only">
                                                    {screenReaderLabel}
                                                </span>
                                            )}
                                        </Fragment>
                                    )}
                                </th>
                            );
                        })}
                    </tr>
                </thead>

                <tbody className="admin-table-body">
                    {isLoading ? (
                        Array.from({
                            length: Number(query.per_page) || 5,
                        }).map((_, rowIndex) => (
                            <tr className="admin-row">
                                {enableBulkSelect && (
                                    <td className="admin-column select">
                                        <Skeleton width={20} height={20} />
                                    </td>
                                )}

                                {Object.entries(headers).map(([key], colIndex) => (
                                    <td className="admin-column">
                                        <Skeleton width="100%" />
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : hasData ? (

                        rows.map((row, rowIndex) => (
                            <tr
                                className="admin-row"
                                key={row.id ?? rowIndex}
                            >
                                {enableBulkSelect && (
                                    <td className="admin-column select">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(row.id)}
                                            onChange={() => toggleRow(rowIndex)}
                                        />
                                    </td>
                                )}

                                {Object.entries(headers).map(([key, header], colIndex) => {
                                    const rowId = row.id;

                                    if (header.isEditable) {
                                        const rowId = row.id;

                                        return (
                                            <EditableCell
                                                header={header}
                                                row={row}
                                                onSave={(newValue: any) => {
                                                    onCellEdit?.(header.key,row, newValue);
                                                }}
                                            />
                                        );
                                    }

                                    if (typeof header.render === "function") {
                                        return (
                                            <td
                                                key={`${rowId}-${colIndex}`}
                                                className={`admin-column ${header.type}`}
                                                style={header.width ? { minWidth: `${header.width}rem` } : {}}
                                            >
                                                {header.render(row)}
                                            </td>
                                        );
                                    }

                                    if (header.type === 'action') {
                                        return (
                                            <td
                                                key={`action-${rowId}`}
                                                className="admin-column actions"
                                            >
                                                <TableRowActions
                                                    row={row}
                                                    rowActions={header.actions}
                                                />
                                            </td>
                                        );
                                    }

                                    let displayValue = renderCell(row, header, format, currency);

                                    return (
                                        <td
                                            key={`${rowId}-${colIndex}`}
                                            className="admin-column"
                                        >
                                            {displayValue}
                                        </td>
                                    );
                                })}

                            </tr>
                        ))
                    ) : (
                        <tr className="admin-row">
                            <ComponentStatusView title="No data to display" />
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
