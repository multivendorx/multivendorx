import React from 'react';
import PageArrows from './PageArrows';
import PagePicker from './PagePicker';
import PageSizePicker, { DEFAULT_PER_PAGE_OPTIONS } from './PageSizePicker';
import './pagination.scss';

export type PaginationProps = {
	page: number;
	perPage: number;
	total: number;
	onPageChange?: (page: number, action?: 'previous' | 'next' | 'goto') => void;
	onPerPageChange?: (perPage: number) => void;
	className?: string;
	showPagePicker?: boolean;
	showPerPagePicker?: boolean;
	showPageArrowsLabel?: boolean;
	perPageOptions?: number[];
	children?: (props: { pageCount: number }) => JSX.Element;
};

// Simple clsx replacement
function classNames(...classes: Array<string | undefined | false>) {
	return classes.filter(Boolean).join(' ');
}

const Pagination: React.FC<PaginationProps> = ({
	page,
	perPage,
	total,
	onPageChange = () => {},
	onPerPageChange = () => {},
	showPagePicker = true,
	showPerPagePicker = true,
	showPageArrowsLabel = true,
	className,
	perPageOptions = DEFAULT_PER_PAGE_OPTIONS,
	children,
}) => {
	const pageCount = Math.ceil(total / perPage);

	// If a render prop is passed
	if (children && typeof children === 'function') {
		return children({ pageCount });
	}

	const classes = classNames('pagination', className);

	// If only a per-page picker should show
	if (pageCount <= 1) {
		return total > perPageOptions[0] ? (
			<div className={classes}>
				<PageSizePicker
					currentPage={page}
					perPage={perPage}
					setCurrentPage={onPageChange}
					total={total}
					setPerPageChange={onPerPageChange}
					perPageOptions={perPageOptions}
				/>
			</div>
		) : null;
	}

	return (
		<div className={classes}>
			<PageArrows
				currentPage={page}
				pageCount={pageCount}
				showPageArrowsLabel={showPageArrowsLabel}
				setCurrentPage={onPageChange}
			/>
			{showPagePicker && (
				<PagePicker
					currentPage={page}
					pageCount={pageCount}
					setCurrentPage={onPageChange}
				/>
			)}
			{showPerPagePicker && (
				<PageSizePicker
					currentPage={page}
					perPage={perPage}
					setCurrentPage={onPageChange}
					total={total}
					setPerPageChange={onPerPageChange}
					perPageOptions={perPageOptions}
				/>
			)}
		</div>
	);
};

export default Pagination;
