import React, { Fragment, useEffect, useRef, useState } from 'react';
import Table from './table';
import TableSummary from './summary';
import Pagination from './Pagination';
import { QueryProps, TableCardProps, TableRow } from './types';
import BulkActionDropdown from './BulkActionDropdown';
import RealtimeFilters from './RealtimeFilter';
import CategoryFilter from './CategoryFilter';
import ButtonActions from './ButtonActions';
import { useOutsideClick } from '../useOutsideClick';
import HeaderSearch from '../HeaderSearch';
import Skeleton from '../UI/Skeleton';
import { PopupUI } from '../Popup';

const defaultOnColumnsChange = (
	showCols: string[],
	key?: string
): void => { };

/**
 * Pure React TableCard
 */
const TableCard: React.FC<TableCardProps> = ({
	className,
	search,
	headers = {},
	ids = [],
	isLoading = false,
	onColumnsChange = defaultOnColumnsChange,
	onSort,
	bulkActions = [],
	onBulkActionApply,
	rows = [],
	showMenu = true,
	summary,
	title,
	totalRows = 0,
	categoryCounts,
	activeCategory = 'all',
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
	});
	/**
	 * TableCard query handler
	 */
	const onQueryChange =
		(param: string) =>
			(value?: string, direction?: string) => {
				setQuery((prev) => ({
					...prev,
					[param]:
						param === 'paged' || param === 'per_page'
							? Number(value)
							: value,
					order:
						param === 'sort'
							? direction
							: prev.order,
					orderby:
						param === 'sort'
							? value
							: prev.orderby,
				}));
			};

	const onFilterChange = (key: string, value: string | string[] | { startDate: Date; endDate: Date }) => {
		setQuery((prev) => ({
			...prev,
			paged: 1, // reset to first page
			filter: {
				...prev.filter,
				[key]: value,
			},
		}));
	};


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
		return Object.entries(headersObj)
			.filter(([_, config]) => config.visible !== false)
			.map(([key]) => key);
	};

	const [showCols, setShowCols] = useState<string[]>(getShowCols(headers));

	/**
	 * Toggle column visibility
	 */
	const onColumnToggle = (key: string) => {
		const isVisible = showCols.includes(key);
		let updated: string[];

		if (isVisible) {
			if (showCols.length <= 1) return; // don't hide last column

			// Reset sorting if hiding currently sorted column
			if (query.orderby === key) {
				const defaultSort = Object.entries(headers).find(
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
		onColumnsChange(updated, key);
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
		.filter(([key, config]) =>
			showCols.includes(key) && (config.tableDisplay !== false) // only include if table !== false (default true)
		)
		.map(([key, { csvDisplay, tableDisplay, ...rest }]) => ({
			key,
			...rest, // spread everything else except csv and table
		}));
	/**
	 * Root className (manual)
	 */
	const rootClassName = [
		'admin-table-wrapper table-card',
		className,
		showMenu ? 'has-menu' : '',
	]
		.filter(Boolean)
		.join(' ');

	return (
		<div className={rootClassName}>
			{/* HEADER */}
			<div className="table-card__header">
				<h2 className="table-card__title">{title}</h2>
			</div>

			{/* BODY */}
			<div className="admin-top-filter">
				{categoryCounts && categoryCounts.length > 0 && (
					<CategoryFilter
						categories={categoryCounts}
						activeCategory={query.categoryFilter || activeCategory}
						onCategoryClick={(value) => {

							const matched = categoryCounts.find(
								(cat) => cat.value === value
							);
							setDerivedTotalRows(matched?.count ?? 0);

							setQuery((prev) => ({
								...prev,
								paged: 1,
								categoryFilter: value
							}));
						}}
					/>
				)}

				<div className="table-action-wrapper">
					{buttonActions && <ButtonActions actions={buttonActions} query={query} />}
					{search && (
						<HeaderSearch
							search={{
								placeholder: search.placeholder,
								options: search.options,
							}}
							onQueryUpdate={(payload) => {
								onQueryChange('searchValue')(payload.searchValue);
								if ('searchAction' in payload) {
									onQueryChange('searchAction')(String(payload.searchAction));
								}
							}}
						/>
					)}
					{showMenu && showColumnToggleIcon && (
						<PopupUI
							position="menu-dropdown"
							toggleIcon="adminfont-more-vertical"
						>
							<ul>
								{Object.entries(headers).map(([key, config]) => {
									const { label, required } = config;
									if (required) return null;

									return (
										<li key={key}>
											<label>
												<input
													type="checkbox"
													checked={showCols.includes(key)}
													onChange={() => onColumnToggle(key)}
												/>
												{label}
											</label>
										</li>
									);
								})}
							</ul>
						</PopupUI>
					)}
				</div>
			</div>

			<Table
				rows={rows}
				headers={visibleHeaders}
				caption={title}
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
				enableBulkSelect={bulkActions.length > 0 || !!onSelectCsvDownloadApply}
				isLoading={isLoading}
				format={format}
				currency={currency}
			/>
			{/* pagination */}
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

						{summary && <TableSummary data={summary} />}
					</Fragment>
				)}
			</div>

			<div className="admin-filter-wrapper">
				<div className="admin-filter-wrapper">
					{selectedIds.length <= 2 && filters.length > 0 && (
						<RealtimeFilters
							filters={filters}
							query={query.filter || {}}
							onFilterChange={onFilterChange}
							rows={rows}
							onResetFilters={() =>
								setQuery((prev) => ({ ...prev, filter: {}, paged: 1 }))
							}
							format={format}
						/>
					)}

					{selectedIds.length > 2 && (bulkActions.length > 0 || onSelectCsvDownloadApply) && (
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
		</div>
	);
};

export default TableCard;
