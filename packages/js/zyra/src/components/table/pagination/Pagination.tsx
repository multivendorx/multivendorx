import React from 'react';
import PagePicker from './PagePicker';
import { SelectInputUI } from '../../SelectInput';

// Keeping the constant accessible
export const DEFAULT_PER_PAGE_OPTIONS = [10, 25, 50, 75, 100];

export type PaginationProps = {
	page: number;
	perPage: number;
	total: number;
	onPageChange?: (page: number, action?: 'previous' | 'next' | 'goto') => void;
	onPerPageChange?: (perPage: number) => void;
	showPagePicker?: boolean;
	showPerPagePicker?: boolean;
	showPageArrowsLabel?: boolean;
	perPageOptions?: number[];
};

const Pagination: React.FC<PaginationProps> = ({
	page,
	perPage,
	total,
	onPageChange = () => { },
	onPerPageChange = () => { },
	showPagePicker = true,
	showPerPagePicker = true,
	showPageArrowsLabel = true,
	perPageOptions = DEFAULT_PER_PAGE_OPTIONS,
}) => {
	const pageCount = Math.ceil(total / perPage);

	// --- PageArrows Logic ---
	const startIndex = total === 0 ? 0 : (page - 1) * perPage + 1;
	const endIndex = Math.min(page * perPage, total);

	// --- PageSizePicker Logic ---
	const handlePerPageChange = (value:number) => {
		onPerPageChange(value);

		// Logic to prevent staying on a page that no longer exists
		const newMaxPage = Math.ceil(total / value);
		if (page > newMaxPage) {
			onPageChange(newMaxPage, 'goto');
		}
	};

	const StatusLabel = showPageArrowsLabel && total > 0 && (
		<span className="show-section" role="status" aria-live="polite">
			Showing {startIndex} to {endIndex} of {total} entries.
		</span>
	);

	const SizePicker = (
		<div className="showing-number">
			Show
			<SelectInputUI
				value={perPage}
				options={
					perPageOptions.map((option) => ({
						value: option,
						label: option,
					}))
				}
				onChange={(newValue) => {
					handlePerPageChange(newValue.value);
				}}
			/>
			entries
		</div>
	);

	// Layout for 1 page or less
	if (pageCount <= 1) {
		return (
			<div className="pagination-number-wrapper">
				{StatusLabel}
				{/* Only show picker if there's enough data to actually paginate */}
				{total > perPageOptions[0] && SizePicker}
			</div>
		);
	}

	// Standard Layout
	return (
		<>
			<div className="pagination-number-wrapper">
				{StatusLabel}
				{showPerPagePicker && SizePicker}
			</div>
			{showPagePicker && (
				<PagePicker
					currentPage={page}
					pageCount={pageCount}
					setCurrentPage={onPageChange}
				/>
			)}
		</>
	);
};

export default Pagination;