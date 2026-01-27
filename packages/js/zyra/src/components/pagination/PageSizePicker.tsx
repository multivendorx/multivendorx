import React from 'react';
import './pagination.scss';

export const DEFAULT_PER_PAGE_OPTIONS = [10, 25, 50, 75, 100];

interface PageSizePickerProps {
	currentPage: number;
	perPage: number;
	total: number;
	setCurrentPage: (page: number, action?: 'previous' | 'next' | 'goto') => void;
	setPerPageChange?: (perPage: number) => void;
	perPageOptions?: number[];
	label?: string;
}

const PageSizePicker: React.FC<PageSizePickerProps> = ({
	perPage,
	currentPage,
	total,
	setCurrentPage,
	setPerPageChange = () => {},
	perPageOptions = DEFAULT_PER_PAGE_OPTIONS,
	label = 'Rows per page',
}) => {
	const handlePerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const newPerPage = parseInt(event.target.value, 10);
		setPerPageChange(newPerPage);

		const newMaxPage = Math.ceil(total / newPerPage);
		if (currentPage > newMaxPage) {
			setCurrentPage(newMaxPage, 'goto');
		}
	};

	return (
		<div className="pagination-per-page-picker">
			<label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
				{label}
				<select value={perPage} onChange={handlePerPageChange}>
					{perPageOptions.map((option) => (
						<option key={option} value={option}>
							{option}
						</option>
					))}
				</select>
			</label>
		</div>
	);
};

export default PageSizePicker;
