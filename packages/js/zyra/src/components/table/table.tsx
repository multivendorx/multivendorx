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
import { renderEditableCell } from './renderEditableCell';
import Skeleton from '../UI/Skeleton';
import ComponentStatusView from '../UI/ComponentStatusView';

const ASC = 'asc';
const DESC = 'desc';

const Table: React.FC<TableProps> = ({
    headers = [],
    rows = [],
    caption,
    className,
    onSort = () => {},
    query = {},
    ids = [],
    selectedIds = [],
    onSelectRow,
    onSelectAll,
    classNames,
    onCellEdit,
    isLoading,
    enableBulkSelect = false,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const [isScrollableRight, setIsScrollableRight] = useState(false);
    const [isScrollableLeft, setIsScrollableLeft] = useState(false);

    const sortedBy = useMemo(
        () => query.orderby ?? headers.find((h) => h.defaultSort)?.key,
        [query.orderby, headers]
    );

    const sortDir = useMemo(
        () =>
            query.order ??
            headers.find((h) => h.key === sortedBy)?.defaultOrder ??
            DESC,
        [query.order, headers, sortedBy]
    );

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
        if (!isSorted) return '↕';
        return sortDir === ASC ? '↑' : '↓';
    };

    const rootClassName = useMemo(
        () =>
            [
                'table-wrapper',
                className,
                classNames,
                isScrollableLeft && 'scroll-left',
                isScrollableRight && 'scroll-right',
            ]
                .filter(Boolean)
                .join(' '),
        [className, classNames, isScrollableLeft, isScrollableRight]
    );

    return (
        <div
            ref={containerRef}
            className={rootClassName}
            tabIndex={tabIndex}
            role="group"
            onScroll={updateScrollState}
        >
            <table className="admin-table">
                <caption className="table-caption screen-reader-only">
                    {caption}
                    {tabIndex === 0 && <small>(scroll to see more)</small>}
                </caption>

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
                        {headers.map((header, i) => {
                            const {
                                key,
                                label,
                                isSortable,
                                isNumeric,
                                isLeftAligned,
                                cellClassName,
                                screenReaderLabel,
                            } = header;

                            const isSorted = sortedBy === key;

                            const thClass = [
                                'header-col',
                                cellClassName,
                                isSortable && 'sortable',
                                isSorted && 'sorted',
                                isNumeric && 'numeric',
                                (isLeftAligned || !isNumeric) && 'left',
                            ]
                                .filter(Boolean)
                                .join(' ');

                            return (
                                <th
                                    key={key || i}
                                    scope="col"
                                    role="columnheader"
                                    className={thClass}
                                    aria-sort={
                                        isSortable && isSorted
                                            ? sortDir === ASC
                                                ? 'ascending'
                                                : 'descending'
                                            : null
                                    }
                                >
                                    {isSortable ? (
                                        <span
                                            onClick={
                                                hasData
                                                    ? () => handleSort(key)
                                                    : null
                                            }
                                            className="sort-button"
                                        >
                                            <span className="sort-label">
                                                {label}
                                            </span>
                                            <span className="sort-icon">
                                                {getSortIcon(isSorted)}
                                            </span>
                                        </span>
                                    ) : (
                                        <Fragment>
                                            <span
                                                aria-hidden={
                                                    !!screenReaderLabel
                                                }
                                            >
                                                {label}
                                            </span>
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
                            <tr
                                className="admin-row"
                                key={`skeleton-${rowIndex}`}
                            >
                                {enableBulkSelect && (
                                    <td className="admin-column select">
                                        <Skeleton width="20px" height="20px" />
                                    </td>
                                )}

                                {headers.map((_, colIndex) => (
                                    <td
                                        key={`skeleton-${rowIndex}-${colIndex}`}
                                        className="admin-column"
                                    >
                                        <Skeleton width="100%" />
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : hasData ? (
                        rows.map((row, rowIndex) => (
                            <tr
                                className="admin-row"
                                key={ids[rowIndex] ?? rowIndex}
                            >
                                {enableBulkSelect && (
                                    <td className="admin-column select">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(
                                                ids[rowIndex]
                                            )}
                                            onChange={() => toggleRow(rowIndex)}
                                        />
                                    </td>
                                )}

                                {row.map((cell, colIndex) => {
                                    const header = headers[colIndex];
                                    const rowId = ids[rowIndex];

                                    if (header.type === 'action') {
                                        return (
                                            <td
                                                key={`action-${rowId}`}
                                                className="admin-column actions"
                                            >
                                                <TableRowActions
                                                    rowId={rowId}
                                                    rowActions={header.actions}
                                                />
                                            </td>
                                        );
                                    }

                                    const displayValue = renderCell(cell);

                                    const isStatusColumn =
                                        header.key === 'status';

                                    const statusClass =
                                        isStatusColumn && cell?.value
                                            ? `admin-badge badge-${String(
                                                  cell.value
                                              ).toLowerCase()}`
                                            : '';

                                    return (
                                        <td
                                            key={`${rowId}-${colIndex}`}
                                            className="admin-column"
                                        >
                                            {isStatusColumn ? (
                                                <span className={statusClass}>
                                                    {displayValue}
                                                </span>
                                            ) : header.isEditable ? (
                                                renderEditableCell({
                                                    header,
                                                    cell,
                                                    isEditing: false,
                                                    onSave: onCellEdit,
                                                })
                                            ) : (
                                                displayValue
                                            )}
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
