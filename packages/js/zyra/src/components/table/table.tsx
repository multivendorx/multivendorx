import React, {
	Fragment,
	useEffect,
	useRef,
	useState,
} from 'react';
import { TableProps, TableRow } from './types';
import './table.scss';

const ASC = 'asc';
const DESC = 'desc';

const getDisplay = (cell: { display?: React.ReactNode }) =>
	cell?.display ?? null;

const Table: React.FC<TableProps> = ({
	// instanceId,
	headers = [],
	rows = [],
	ariaHidden,
	caption,
	className,
	onSort = () => { },
	query = {},
	rowHeader,
	rowKey,
	ids = [],
	selectedIds = [],
	onSelectRow,
	onSelectAll,
	emptyMessage,
	classNames,
}) => {
	const allSelected = ids.length > 0 && ids.every((id) => selectedIds.includes(id));
	const [tabIndex, setTabIndex] = useState<number | undefined>();
	const [isScrollableRight, setIsScrollableRight] = useState(false);
	const [isScrollableLeft, setIsScrollableLeft] = useState(false);

	const containerRef = useRef<HTMLDivElement>(null);

	const sortedBy =
		query.orderby ??
		headers.find((h) => h.defaultSort)?.key;

	const sortDir =
		query.order ??
		headers.find((h) => h.key === sortedBy)?.defaultOrder ??
		DESC;

	const hasData = rows.length > 0;

	const getRowKey = (row: TableRow[], index: number) => {
		return rowKey ? rowKey(row, index) : index;
	};

	const updateScrollState = () => {
		const el = containerRef.current;
		if (!el) return;

		const { scrollLeft, scrollWidth, clientWidth } = el;
		const scrollable = scrollWidth > clientWidth;

		if (!scrollable) {
			setIsScrollableLeft(false);
			setIsScrollableRight(false);
			el.scrollLeft = 0;
			return;
		}

		setIsScrollableLeft(scrollLeft > 0);
		setIsScrollableRight(scrollLeft + clientWidth < scrollWidth);
	};

	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;

		const isScrollable = el.scrollWidth > el.clientWidth;
		setTabIndex(isScrollable ? 0 : undefined);
		updateScrollState();

		const onResize = () => requestAnimationFrame(updateScrollState);
		window.addEventListener('resize', onResize);

		return () => window.removeEventListener('resize', onResize);
	}, [headers, rows]);

	const sortBy = (key: string) => () => {
		let direction = DESC;

		if (sortedBy === key) {
			direction = sortDir === ASC ? DESC : ASC;
		}

		onSort(key, direction);
	};

	const rootClassName = [
		'table-container',
		className,
		classNames,
		isScrollableLeft ? 'scroll-left' : '',
		isScrollableRight ? 'scroll-right' : '',
	]
		.filter(Boolean)
		.join(' ');

	const toggleAllRows = () => {
	  const newState = !allSelected;
	  onSelectAll?.(newState);
	};
  
	const toggleRow = (index: number) => {
	  const id = ids[index];
	  const isSelected = selectedIds.includes(id);
	  onSelectRow?.(id, !isSelected);
	};
	return (
		<div
			ref={containerRef}
			className={rootClassName}
			tabIndex={tabIndex}
			aria-hidden={ariaHidden}
			// aria-labelledby={`caption-${instanceId}`}
			role="group"
			onScroll={updateScrollState}
		>
			<table className="table">
				<caption
					// id={`caption-${instanceId}`}
					className="table-caption screen-reader-only"
				>
					{caption}
					{tabIndex === 0 && (
						<small>(scroll to see more)</small>
					)}
				</caption>

				<tbody>
					<tr>
						{selectedIds.length > 0 || allSelected ? (
							<th>
								<input type="checkbox" checked={allSelected} onChange={toggleAllRows} />
							</th>
						) : (
							<th>
								<input type="checkbox" checked={allSelected} onChange={toggleAllRows} />
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
								'table-header',
								cellClassName,
								isSortable ? 'sortable' : '',
								isSorted ? 'sorted' : '',
								isNumeric ? 'numeric' : '',
								isLeftAligned || !isNumeric ? 'left' : '',
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
											: undefined
									}
								>
									{isSortable ? (
										<button
											type="button"
											onClick={hasData ? sortBy(key) : undefined}
											className="sort-button"
										>
											{label}
										</button>
									) : (
										<Fragment>
											<span aria-hidden={!!screenReaderLabel}>
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

					{hasData ? (
						rows.map((row, rowIndex) => (

							<tr key={getRowKey(row, rowIndex)}>
								<td>
									<input
										type="checkbox"
										checked={selectedIds.includes(ids[rowIndex])}
										onChange={() => toggleRow(rowIndex)}
									/>
								</td>
								{row.map((cell, colIndex) => {
									const header = headers[colIndex];
									const isHeaderCell = rowHeader === colIndex;
									const CellTag = isHeaderCell ? 'th' : 'td';

									const cellClass = [
										'table-cell',
										header.cellClassName,
										header.isNumeric ? 'numeric' : '',
										header.isLeftAligned || !header.isNumeric
											? 'left'
											: '',
										sortedBy === header.key ? 'sorted' : '',
									]
										.filter(Boolean)
										.join(' ');

									return (
										<CellTag
											key={`${getRowKey(row, rowIndex)}-${colIndex}`}
											scope={isHeaderCell ? 'row' : undefined}
											className={cellClass}
										>
											{getDisplay(cell)}
										</CellTag>
									);
								})}
							</tr>
						))
					) : (
						<tr>
							<td
								colSpan={headers.length}
								className="table-empty"
							>
								{emptyMessage ?? 'No data to display'}
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
};

export default Table;
